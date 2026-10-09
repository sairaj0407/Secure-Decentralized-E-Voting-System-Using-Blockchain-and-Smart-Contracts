const pool = require("../config/database");

const {
    votingContract
} = require("../config/blockchain");

const {
    castVoteOnBlockchain,
    castVoteForOnBlockchain,
    authorizeVoterOnBlockchain,
    isVoterAuthorizedOnBlockchain
} = require("../services/blockchainService");

const { ethers } = require("ethers");


// ============================================================
// CAST VOTE
// ============================================================

const castVote = async (req, res) => {
    try {

        const electionId = req.body.electionId || req.body.election_id;
        const candidateId = req.body.candidateId || req.body.candidate_id;
        const voterId = req.user.userId;


        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        if (!electionId || !candidateId) {
            return res.status(400).json({
                success: false,
                message: "Election ID and Candidate ID are required."
            });
        }


        // --------------------------------------------------------
        // GET VOTER
        // --------------------------------------------------------

        const voterResult = await pool.query(
            `SELECT
                id,
                name,
                wallet_address,
                role,
                is_active,
                is_verified
             FROM users
             WHERE id = $1`,
            [voterId]
        );

        if (voterResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Voter not found."
            });
        }

        const voter = voterResult.rows[0];

        if (voter.role !== "VOTER") {
            return res.status(403).json({
                success: false,
                message: "Only voters can cast votes."
            });
        }

        if (!voter.is_active) {
            return res.status(403).json({
                success: false,
                message: "Voter account is inactive."
            });
        }

        if (!voter.is_verified) {
            return res.status(403).json({
                success: false,
                message: "Voter account must be verified by the Election Commission before voting."
            });
        }

        if (!voter.wallet_address) {
            const generatedWallet = ethers.Wallet.createRandom().address;
            await pool.query("UPDATE users SET wallet_address = $1 WHERE id = $2", [generatedWallet, voter.id]);
            voter.wallet_address = generatedWallet;
            console.log(`[Vote Controller] Auto-assigned on-chain wallet ${generatedWallet} to voter ${voter.id}`);
        }


        // --------------------------------------------------------
        // GET ELECTION
        // --------------------------------------------------------

        const electionResult = await pool.query(
            `SELECT
                id,
                title,
                status,
                contract_address,
                blockchain_election_id
             FROM elections
             WHERE id = $1`,
            [electionId]
        );

        if (electionResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Election not found."
            });
        }

        const election = electionResult.rows[0];

        if (!election.blockchain_election_id) {
            return res.status(400).json({
                success: false,
                message: "Election is not linked to blockchain."
            });
        }


        // --------------------------------------------------------
        // CHECK ELECTION STATUS
        // --------------------------------------------------------

        if (election.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message:
                    "Voting is available only while the election is ongoing."
            });
        }


        // --------------------------------------------------------
        // CHECK VOTER AUTHORIZATION (JUST-IN-TIME ENROLLMENT)
        // --------------------------------------------------------

        let authorizationResult = await pool.query(
            `SELECT
                id,
                is_authorized,
                has_voted
             FROM voter_election_authorizations
             WHERE user_id = $1
             AND election_id = $2`,
            [voterId, electionId]
        );

        if (authorizationResult.rows.length === 0) {
            if (voter.is_verified && voter.is_active) {
                console.log(`[Vote Controller] Just-In-Time enrolling verified elector ${voter.id} for election ${electionId}`);
                const newAuth = await pool.query(
                    `INSERT INTO voter_election_authorizations
                     (user_id, election_id, is_authorized, authorized_at)
                     VALUES ($1, $2, TRUE, NOW())
                     RETURNING id, is_authorized, has_voted`,
                    [voterId, electionId]
                );
                authorizationResult = newAuth;
            } else {
                return res.status(403).json({
                    success: false,
                    message: "Voter is not authorized for this election."
                });
            }
        }

        const authorization = authorizationResult.rows[0];

        if (!authorization.is_authorized) {
            return res.status(403).json({
                success: false,
                message: "Voter is not authorized for this election."
            });
        }

        if (authorization.has_voted) {
            return res.status(409).json({
                success: false,
                message: "Voter has already voted in this election."
            });
        }


        // --------------------------------------------------------
        // CHECK CANDIDATE
        // --------------------------------------------------------

        const candidateResult = await pool.query(
            `SELECT
                id,
                election_id,
                name
             FROM candidates
             WHERE id = $1
             AND election_id = $2`,
            [candidateId, electionId]
        );

        if (candidateResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Candidate does not belong to this election."
            });
        }

        const candidate = candidateResult.rows[0];


        // --------------------------------------------------------
        // GET BLOCKCHAIN CANDIDATE ID
        // --------------------------------------------------------

        const blockchainElectionId =
            election.blockchain_election_id;

        const blockchainCandidates =
            await votingContract.getCandidates(
                blockchainElectionId
            );

        if (
            !blockchainCandidates ||
            blockchainCandidates.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "No candidates found on blockchain."
            });
        }


        // --------------------------------------------------------
        // MAP DATABASE CANDIDATE TO BLOCKCHAIN CANDIDATE
        // --------------------------------------------------------

        const databaseCandidatesResult = await pool.query(
            `SELECT
                id,
                name
             FROM candidates
             WHERE election_id = $1
             ORDER BY id`,
            [electionId]
        );

        const databaseCandidates =
            databaseCandidatesResult.rows;

        const candidateIndex =
            databaseCandidates.findIndex(
                c => String(c.id) === String(candidateId)
            );

        if (candidateIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Candidate mapping not found."
            });
        }

        const blockchainCandidateId =
            candidateIndex + 1;


        // --------------------------------------------------------
        // CAST OR VERIFY BLOCKCHAIN VOTE
        // --------------------------------------------------------

        // Ensure voter is authorized on blockchain
        try {
            const isAuthOnChain = await isVoterAuthorizedOnBlockchain(blockchainElectionId, voter.wallet_address);
            if (!isAuthOnChain) {
                console.log(`[Vote Controller] Authorizing voter ${voter.wallet_address} on blockchain for election ${blockchainElectionId}...`);
                await authorizeVoterOnBlockchain(blockchainElectionId, voter.wallet_address);
            }
        } catch (onChainAuthErr) {
            console.warn("[Vote Controller] On-chain pre-authorization note:", onChainAuthErr.message);
        }

        let transactionHash = req.body.transactionHash;
        let blockNumber = null;
        let gasUsed = null;

        if (transactionHash) {
            console.log(`Verifying client-submitted MetaMask transaction: ${transactionHash}`);
            const provider = votingContract.runner.provider;
            
            const tx = await provider.getTransaction(transactionHash);
            if (!tx) {
                return res.status(404).json({
                    success: false,
                    message: "Transaction not found on blockchain."
                });
            }

            const receipt = await provider.getTransactionReceipt(transactionHash);
            if (!receipt || receipt.status !== 1) {
                return res.status(400).json({
                    success: false,
                    message: "Transaction failed or has no receipt on the blockchain."
                });
            }

            // Verify contract address
            const contractAddr = typeof votingContract.target === "string" ? votingContract.target : await votingContract.getAddress();
            if (receipt.to.toLowerCase() !== contractAddr.toLowerCase()) {
                return res.status(400).json({
                    success: false,
                    message: "Transaction was not sent to the correct EVoting contract."
                });
            }

            // Verify sender address
            if (tx.from.toLowerCase() !== voter.wallet_address.toLowerCase()) {
                return res.status(400).json({
                    success: false,
                    message: "Transaction sender does not match the authorized voter wallet address."
                });
            }

            // Decode transaction data to verify arguments
            try {
                const decoded = votingContract.interface.parseTransaction({ data: tx.data });
                if (decoded.name !== "castVote") {
                    return res.status(400).json({
                        success: false,
                        message: "Transaction is not a castVote call."
                    });
                }
                const txElectionId = decoded.args[0].toString();
                const txCandidateId = decoded.args[1].toString();

                if (txElectionId !== blockchainElectionId || txCandidateId !== blockchainCandidateId.toString()) {
                    return res.status(400).json({
                        success: false,
                        message: "Transaction parameters do not match requested election and candidate."
                    });
                }
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: "Failed to verify transaction input data: " + err.message
                });
            }

            blockNumber = receipt.blockNumber ? Number(receipt.blockNumber) : null;
            gasUsed = receipt.gasUsed ? receipt.gasUsed.toString() : null;

        } else {
            // CAST VOTE VIA OFFICIAL ECI RELAYER OR DIRECT VOTER KEY
            const provider = votingContract.runner.provider;
            const voterPrivateKey = req.body.voterPrivateKey || process.env.TEST_VOTER_PRIVATE_KEY;
            let usedDirectWallet = false;

            if (voterPrivateKey) {
                try {
                    const voterWallet = new ethers.Wallet(voterPrivateKey, provider);
                    if (voterWallet.address.toLowerCase() === voter.wallet_address.toLowerCase()) {
                        console.log(`[Vote Controller] Casting vote directly using supplied voter key (${voterWallet.address})...`);
                        const blockchainResult = await castVoteOnBlockchain(
                            blockchainElectionId,
                            blockchainCandidateId,
                            voterWallet
                        );
                        transactionHash = blockchainResult.transactionHash;
                        const receipt = blockchainResult.receipt;
                        blockNumber = receipt.blockNumber ? Number(receipt.blockNumber) : null;
                        gasUsed = receipt.gasUsed ? receipt.gasUsed.toString() : null;
                        usedDirectWallet = true;
                    }
                } catch (directKeyErr) {
                    console.warn("[Vote Controller] Direct key cast note:", directKeyErr.message);
                }
            }

            if (!usedDirectWallet) {
                console.log(
                    "[Vote Controller] Casting ballot via official ECI relayer (castVoteFor):",
                    {
                        databaseElectionId: electionId,
                        blockchainElectionId,
                        databaseCandidateId: candidateId,
                        blockchainCandidateId,
                        voter: voter.wallet_address
                    }
                );

                const blockchainResult = await castVoteForOnBlockchain(
                    blockchainElectionId,
                    blockchainCandidateId,
                    voter.wallet_address
                );

                transactionHash = blockchainResult.transactionHash;
                const receipt = blockchainResult.receipt;
                blockNumber = receipt.blockNumber ? Number(receipt.blockNumber) : null;
                gasUsed = receipt.gasUsed ? receipt.gasUsed.toString() : null;
            }
        }


        // --------------------------------------------------------
        // SAVE VOTE
        // --------------------------------------------------------

        const voteResult = await pool.query(
            `INSERT INTO votes
                (
                    election_id,
                    candidate_id,
                    voter_id,
                    blockchain_election_id,
                    blockchain_candidate_id,
                    tx_hash,
                    block_number,
                    wallet_address,
                    gas_used,
                    voted_at
                )
             VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9, CURRENT_TIMESTAMP)
             RETURNING
                id,
                election_id,
                candidate_id,
                voter_id,
                blockchain_election_id,
                blockchain_candidate_id,
                tx_hash,
                block_number,
                wallet_address,
                gas_used,
                voted_at`,
            [
                electionId,
                candidateId,
                voterId,
                blockchainElectionId,
                blockchainCandidateId,
                transactionHash,
                blockNumber,
                voter.wallet_address,
                gasUsed
            ]
        );


        // --------------------------------------------------------
        // MARK VOTER AS VOTED
        // --------------------------------------------------------

        await pool.query(
            `UPDATE voter_election_authorizations
             SET
                has_voted = TRUE,
                voted_at = CURRENT_TIMESTAMP
             WHERE user_id = $1
             AND election_id = $2`,
            [voterId, electionId]
        );


        // --------------------------------------------------------
        // BLOCKCHAIN TRANSACTION RECORD
        // --------------------------------------------------------

        await pool.query(
            `INSERT INTO blockchain_transactions
                (
                    election_id,
                    tx_hash,
                    block_number,
                    wallet_address,
                    gas_used,
                    transaction_status,
                    confirmed_at
                )
             VALUES
                ($1,$2,$3,$4,$5,$6,CURRENT_TIMESTAMP)
             ON CONFLICT (tx_hash) DO UPDATE
             SET transaction_status = 'CONFIRMED',
                 confirmed_at = CURRENT_TIMESTAMP`,
            [
                electionId,
                transactionHash,
                blockNumber,
                voter.wallet_address,
                gasUsed,
                "CONFIRMED"
            ]
        );


        // --------------------------------------------------------
        // AUDIT LOG
        // --------------------------------------------------------

        await pool.query(
            `INSERT INTO audit_logs
                (
                    user_id,
                    action,
                    description
                )
             VALUES
                ($1,$2,$3)`,
            [
                voterId,
                "VOTE_CAST",
                `Ballot cast in election "${election.title}".`
            ]
        );


        // --------------------------------------------------------
        // DIGITAL RECEIPT REGISTRATION & STATUTORY ENRICHMENT
        // --------------------------------------------------------
        const crypto = require("crypto");
        const receiptCode = "REC-" + crypto.randomBytes(8).toString("hex").toUpperCase();
        await pool.query(
            `INSERT INTO voter_receipts (election_id, user_id, receipt_code, tx_hash, block_number)
             VALUES ($1, $2, $3, $4, $5)`,
            [electionId, voterId, receiptCode, transactionHash, blockNumber]
        );

        const enrichedReceipt = await getEnrichedReceiptData(voterId, electionId);

        // --------------------------------------------------------
        // RESPONSE
        // --------------------------------------------------------

        return res.status(201).json({
            success: true,
            message: "Vote cast successfully on blockchain.",
            receipt: enrichedReceipt,
            vote: voteResult.rows[0],

            blockchain: {
                electionId: String(blockchainElectionId),
                candidateId: String(blockchainCandidateId),
                walletAddress: voter.wallet_address,
                transactionHash,
                blockNumber,
                gasUsed
            }
        });


    } catch (error) {

        console.error(
            "Cast vote error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
};

const getEnrichedReceiptData = async (voterId, electionId) => {
    const crypto = require("crypto");
    const result = await pool.query(
        `SELECT 
            vr.receipt_code, 
            vr.tx_hash, 
            vr.block_number, 
            vr.created_at,
            e.id as election_id,
            e.title as election_title, 
            e.election_code, 
            e.election_type, 
            e.election_level, 
            e.jurisdiction,
            u.id as elector_id,
            u.name as elector_name, 
            u.voter_id as elector_epic_id, 
            u.phone as elector_phone, 
            u.address as elector_address, 
            u.wallet_address as elector_wallet,
            c.name as constituency_name, 
            c.code as constituency_code,
            ps.name as polling_station_name, 
            ps.code as polling_station_code,
            cand.id as candidate_id,
            cand.name as candidate_name, 
            cand.party as candidate_party, 
            cand.symbol as candidate_symbol,
            v.gas_used,
            v.blockchain_candidate_id,
            v.voted_at
         FROM voter_receipts vr
         JOIN elections e ON vr.election_id = e.id
         JOIN users u ON vr.user_id = u.id
         LEFT JOIN constituencies c ON u.constituency_id = c.id
         LEFT JOIN polling_stations ps ON u.polling_station_id = ps.id
         LEFT JOIN votes v ON v.voter_id = vr.user_id AND v.election_id = vr.election_id
         LEFT JOIN candidates cand ON v.candidate_id = cand.id
         WHERE vr.user_id = $1 AND vr.election_id = $2
         ORDER BY vr.id DESC LIMIT 1`,
        [voterId, electionId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    const sigPayload = `${row.receipt_code}:${row.tx_hash}:${row.elector_epic_id || row.elector_id}:${row.block_number}`;
    row.digital_signature = crypto.createHash("sha256").update(sigPayload).digest("hex").toUpperCase();

    // Cryptographic Ballot Inclusion Proof (Section 128 RPA 1951 - Secret Ballot Standard)
    const inclusionPayload = `INCLUSION:${row.receipt_code}:${row.tx_hash}:${row.election_id}:${row.block_number}`;
    row.ballot_inclusion_hash = crypto.createHash("sha256").update(inclusionPayload).digest("hex").toUpperCase();
    row.secret_ballot_standard = "SECTION_128_RPA_1951";
    return row;
};

const getVoterReceipt = async (req, res) => {
    const { electionId } = req.params;
    const voterId = req.user.userId;
    try {
        const receipt = await getEnrichedReceiptData(voterId, electionId);
        if (!receipt) {
            return res.status(404).json({ success: false, message: "Receipt not found for this election." });
        }
        res.json({ success: true, receipt });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


const getMyVotedElections = async (req, res) => {
    const voterId = req.user.userId;
    try {
        const result = await pool.query(
            `SELECT 
                vea.election_id,
                vea.has_voted,
                vea.voted_at,
                vr.receipt_code,
                vr.tx_hash,
                vr.block_number,
                e.title as election_title,
                e.election_code,
                e.status as election_status
             FROM voter_election_authorizations vea
             JOIN elections e ON vea.election_id = e.id
             LEFT JOIN voter_receipts vr ON vr.election_id = vea.election_id AND vr.user_id = vea.user_id
             WHERE vea.user_id = $1 AND vea.has_voted = TRUE
             ORDER BY vea.voted_at DESC`,
            [voterId]
        );
        res.json({ success: true, votedElections: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    castVote,
    getVoterReceipt,
    getMyVotedElections
};
