const pool = require("../config/database");

const {
    authorizeVoterOnBlockchain
} = require("../services/blockchainService");


// ============================================================
// AUTHORIZE VOTER FOR AN ELECTION
// ============================================================

const authorizeVoter = async (req, res) => {
    try {

        const voterId = req.body.voterId || req.body.userId || req.body.user_id || req.body.voter_id;
        const electionId = req.body.electionId || req.body.election_id;


        // --------------------------------------------------------
        // VALIDATE INPUT
        // --------------------------------------------------------

        if (!voterId || !electionId) {
            return res.status(400).json({
                success: false,
                message: "Voter ID and Election ID are required."
            });
        }


        // --------------------------------------------------------
        // GET VOTER
        // --------------------------------------------------------

        const voterResult = await pool.query(
            `SELECT
                id,
                name,
                email,
                role,
                is_verified,
                is_active,
                wallet_address
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


        // --------------------------------------------------------
        // CHECK VOTER ROLE
        // --------------------------------------------------------

        if (voter.role !== "VOTER") {
            return res.status(400).json({
                success: false,
                message: "Selected user is not a voter."
            });
        }


        // --------------------------------------------------------
        // CHECK ACTIVE STATUS
        // --------------------------------------------------------

        if (!voter.is_active) {
            return res.status(400).json({
                success: false,
                message: "Voter account is inactive."
            });
        }


        // --------------------------------------------------------
        // CHECK WALLET
        // --------------------------------------------------------

        if (!voter.wallet_address) {
            const { ethers } = require("ethers");
            const newWallet = ethers.Wallet.createRandom().address;
            await pool.query("UPDATE users SET wallet_address = $1 WHERE id = $2", [newWallet, voter.id]);
            voter.wallet_address = newWallet;
        }


        // --------------------------------------------------------
        // GET ELECTION
        // --------------------------------------------------------

        const electionResult = await pool.query(
            `SELECT
                id,
                title,
                status,
                start_time,
                end_time,
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


        // --------------------------------------------------------
        // CHECK BLOCKCHAIN MAPPING
        // --------------------------------------------------------

        if (!election.blockchain_election_id) {
            return res.status(400).json({
                success: false,
                message:
                    "This election is not linked to a blockchain election."
            });
        }


        // --------------------------------------------------------
        // CHECK ELECTION STATUS
        // --------------------------------------------------------

        if (
            election.status !== "DRAFT" &&
            election.status !== "UPCOMING" &&
            election.status !== "ACTIVE"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Voters cannot be authorized for an election that is ${election.status}.`
            });
        }


        // --------------------------------------------------------
        // CHECK DUPLICATE AUTHORIZATION
        // --------------------------------------------------------

        const existingAuthorization = await pool.query(
            `SELECT
                id,
                is_authorized,
                has_voted
             FROM voter_election_authorizations
             WHERE user_id = $1
             AND election_id = $2`,
            [
                voterId,
                electionId
            ]
        );


        if (existingAuthorization.rows.length > 0 && existingAuthorization.rows[0].is_authorized) {
            return res.status(409).json({
                success: false,
                message:
                    "Voter is already authorized for this election."
            });
        }


        // --------------------------------------------------------
        // REGISTER VOTER ON BLOCKCHAIN
        // --------------------------------------------------------

        console.log(
            "Authorizing voter on blockchain:",
            {
                databaseElectionId: election.id,
                blockchainElectionId:
                    election.blockchain_election_id,
                voterId: voter.id,
                voterName: voter.name,
                walletAddress: voter.wallet_address
            }
        );


        const blockchainResult =
            await authorizeVoterOnBlockchain(
                election.blockchain_election_id,
                voter.wallet_address
            );


        // --------------------------------------------------------
        // BLOCKCHAIN TRANSACTION DETAILS
        // --------------------------------------------------------

        const transactionHash =
            blockchainResult.transactionHash;

        const receipt =
            blockchainResult.receipt;


        const blockNumber =
            receipt.blockNumber
                ? Number(receipt.blockNumber)
                : null;

        const gasUsed =
            receipt.gasUsed
                ? receipt.gasUsed.toString()
                : null;


        console.log(
            "Voter authorized on blockchain:",
            {
                transactionHash,
                blockNumber,
                gasUsed
            }
        );


        // --------------------------------------------------------
        // SAVE AUTHORIZATION IN DATABASE
        // --------------------------------------------------------

        const result = await pool.query(
            `INSERT INTO voter_election_authorizations
                (
                    user_id,
                    election_id,
                    is_authorized,
                    has_voted,
                    authorized_at
                )
             VALUES
                ($1, $2, TRUE, FALSE, NOW())
             ON CONFLICT (user_id, election_id)
             DO UPDATE SET is_authorized = TRUE, authorized_at = NOW()
             RETURNING
                id,
                user_id,
                election_id,
                is_authorized,
                has_voted,
                authorized_at,
                created_at`,
            [
                voterId,
                electionId
            ]
        );


        const authorization =
            result.rows[0];


        // --------------------------------------------------------
        // SAVE BLOCKCHAIN TRANSACTION
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
                ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
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
                ($1, $2, $3)`,
            [
                req.user.userId,
                "VOTER_AUTHORIZED",
                `Voter "${voter.name}" authorized for election "${election.title}" and registered on blockchain.`
            ]
        );


        // --------------------------------------------------------
        // RESPONSE
        // --------------------------------------------------------

        res.status(201).json({

            success: true,

            message:
                "Voter authorized successfully and registered on blockchain.",

            authorization,

            blockchain: {

                electionId:
                    String(election.blockchain_election_id),

                walletAddress:
                    voter.wallet_address,

                transactionHash,

                blockNumber,

                gasUsed

            }

        });


    } catch (error) {

        console.error(
            "Authorize voter error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Internal server error.",

            error:
                error.message

        });

    }
};


// ============================================================
// GET AUTHORIZED VOTERS FOR AN ELECTION
// ============================================================

const getAuthorizedVoters = async (req, res) => {

    try {

        const { electionId } = req.params;


        const result = await pool.query(
            `SELECT
                u.id AS user_id,
                u.name,
                u.email,
                u.voter_id AS voter_number,
                u.wallet_address,
                u.is_verified,
                u.is_active,
                u.created_at AS registered_at,
                vea.id AS authorization_id,
                COALESCE(vea.is_authorized, FALSE) AS is_authorized,
                COALESCE(vea.has_voted, FALSE) AS has_voted,
                vea.authorized_at,
                vea.voted_at
             FROM users u
             LEFT JOIN voter_election_authorizations vea
                ON vea.user_id = u.id AND vea.election_id = $1
             WHERE u.role = 'VOTER'
             ORDER BY u.id ASC`,
            [electionId]
        );


        res.json({

            success: true,

            electionId,

            voters: result.rows

        });


    } catch (error) {

        console.error(
            "Get authorized voters error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }

};


// ============================================================
// BATCH AUTHORIZE ALL PENDING VOTERS FOR AN ELECTION
// ============================================================

const batchAuthorizeVoters = async (req, res) => {
    try {
        const electionId = req.body.electionId || req.body.election_id;
        if (!electionId) {
            return res.status(400).json({ success: false, message: "Election ID is required." });
        }

        const electionResult = await pool.query(
            "SELECT id, title, status, blockchain_election_id FROM elections WHERE id = $1",
            [electionId]
        );

        if (electionResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Election not found." });
        }

        const election = electionResult.rows[0];

        if (election.status !== "DRAFT" && election.status !== "UPCOMING" && election.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message: `Voters cannot be authorized for an election that is ${election.status}.`
            });
        }

        if (!election.blockchain_election_id) {
            return res.status(400).json({
                success: false,
                message: "This election is not linked to a blockchain election."
            });
        }

        const pendingVoters = await pool.query(
            `SELECT u.id, u.name, u.email, u.wallet_address
             FROM users u
             WHERE u.role = 'VOTER' AND u.is_active = TRUE
             AND NOT EXISTS (
                 SELECT 1 FROM voter_election_authorizations vea
                 WHERE vea.user_id = u.id AND vea.election_id = $1 AND vea.is_authorized = TRUE
             )`,
            [electionId]
        );

        const { ethers } = require("ethers");
        let authorizedCount = 0;
        const errors = [];

        for (const voter of pendingVoters.rows) {
            try {
                let wallet = voter.wallet_address;
                if (!wallet) {
                    wallet = ethers.Wallet.createRandom().address;
                    await pool.query("UPDATE users SET wallet_address = $1 WHERE id = $2", [wallet, voter.id]);
                }

                await authorizeVoterOnBlockchain(
                    election.blockchain_election_id,
                    wallet
                );

                await pool.query(
                    `INSERT INTO voter_election_authorizations (user_id, election_id, is_authorized, authorized_at)
                     VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP)
                     ON CONFLICT (user_id, election_id)
                     DO UPDATE SET is_authorized = TRUE, authorized_at = CURRENT_TIMESTAMP`,
                    [voter.id, electionId]
                );

                authorizedCount++;
            } catch (err) {
                console.error(`Batch authorize error for voter ${voter.id}:`, err.message);
                errors.push({ voterId: voter.id, error: err.message });
            }
        }

        await pool.query(
            "INSERT INTO audit_logs (user_id, action, description) VALUES ($1, $2, $3)",
            [
                req.user.userId,
                "BATCH_VOTER_AUTHORIZATION",
                `Batch authorized ${authorizedCount} electors for election "${election.title}".`
            ]
        );

        res.json({
            success: true,
            message: `Successfully authorized ${authorizedCount} electors on blockchain.`,
            authorizedCount,
            totalPending: pendingVoters.rows.length,
            errors
        });
    } catch (error) {
        console.error("Batch authorize error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ============================================================
// CHECK WHETHER CURRENT VOTER IS AUTHORIZED
// ============================================================

const checkVoterAuthorization = async (req, res) => {

    try {

        const { electionId } = req.params;


        const result = await pool.query(
            `SELECT
                vea.id,
                vea.user_id,
                vea.election_id,
                vea.is_authorized,
                vea.has_voted,
                vea.authorized_at,
                vea.voted_at
             FROM voter_election_authorizations vea
             WHERE vea.user_id = $1
             AND vea.election_id = $2`,
            [
                req.user.userId,
                electionId
            ]
        );


        if (result.rows.length === 0) {

            return res.json({

                success: true,

                authorized: false,

                message:
                    "Voter is not authorized for this election."

            });

        }


        const authorization =
            result.rows[0];


        res.json({

            success: true,

            authorized:
                authorization.is_authorized,

            hasVoted:
                authorization.has_voted,

            authorization

        });


    } catch (error) {

        console.error(
            "Check authorization error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }

};


module.exports = {

    authorizeVoter,

    batchAuthorizeVoters,

    getAuthorizedVoters,

    checkVoterAuthorization

};