const pool = require("../config/database");

const {
    registerCandidateOnBlockchain
} = require("../services/blockchainService");


// ============================================================
// ADD CANDIDATE
// ============================================================

const addCandidate = async (req, res) => {
    try {

        const electionId = req.body.electionId || req.body.election_id;
        const name = req.body.name;
        const party = req.body.party;
        const symbol = req.body.symbol;
        const imageUrl = req.body.imageUrl || req.body.image_url;
        const manifesto = req.body.manifesto;


        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        if (!electionId || !name) {
            return res.status(400).json({
                success: false,
                message: "Election ID and candidate name are required."
            });
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


        // --------------------------------------------------------
        // CHECK ELECTION STATUS
        // --------------------------------------------------------

        if (
            election.status !== "DRAFT" &&
            election.status !== "UPCOMING"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Candidates cannot be added after the election has started."
            });
        }


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


        console.log(
            "Registering candidate on blockchain:",
            {
                databaseElectionId: election.id,
                blockchainElectionId:
                    election.blockchain_election_id,
                candidate: name
            }
        );


        // --------------------------------------------------------
        // REGISTER CANDIDATE ON BLOCKCHAIN FIRST
        // --------------------------------------------------------

        const blockchainResult =
            await registerCandidateOnBlockchain(
                election.blockchain_election_id,
                name,
                party || "",
                symbol || "",
                manifesto || ""
            );


        // --------------------------------------------------------
        // EXTRACT BLOCKCHAIN TRANSACTION DETAILS
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
            "Candidate registered on blockchain:",
            {
                transactionHash,
                blockNumber,
                gasUsed
            }
        );


        const education = req.body.education || null;
        const totalAssets = req.body.totalAssets || req.body.total_assets || null;
        const totalLiabilities = req.body.totalLiabilities || req.body.total_liabilities || null;
        const criminalCasesCount = parseInt(req.body.criminalCasesCount || req.body.criminal_cases_count) || 0;
        const affidavitSummary = req.body.affidavitSummary || req.body.affidavit_summary || null;

        // --------------------------------------------------------
        // SAVE CANDIDATE IN DATABASE
        // --------------------------------------------------------

        const result = await pool.query(
            `INSERT INTO candidates
                (
                    election_id,
                    name,
                    party,
                    symbol,
                    image_url,
                    manifesto,
                    education,
                    total_assets,
                    total_liabilities,
                    criminal_cases_count,
                    affidavit_summary
                )
             VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING
                id,
                election_id,
                name,
                party,
                symbol,
                image_url,
                manifesto,
                education,
                total_assets,
                total_liabilities,
                criminal_cases_count,
                affidavit_summary,
                created_at`,
            [
                electionId,
                name,
                party || null,
                symbol || null,
                imageUrl || null,
                manifesto || null,
                education,
                totalAssets,
                totalLiabilities,
                criminalCasesCount,
                affidavitSummary
            ]
        );


        const candidate = result.rows[0];


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
                process.env.BLOCKCHAIN_ADMIN_WALLET ||
                    null,
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
                "CANDIDATE_ADDED",
                `Candidate "${name}" added to election "${election.title}" and registered on blockchain.`
            ]
        );


        // --------------------------------------------------------
        // RESPONSE
        // --------------------------------------------------------

        res.status(201).json({
            success: true,
            message:
                "Candidate added successfully and registered on blockchain.",

            candidate,

            blockchain: {
                electionId:
                    String(election.blockchain_election_id),
                transactionHash,
                blockNumber,
                gasUsed
            }
        });


    } catch (error) {

        console.error(
            "Add candidate error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
};



// ============================================================
// GET ALL CANDIDATES FOR AN ELECTION
// ============================================================

const getCandidatesByElection = async (req, res) => {

    try {

        const { electionId } = req.params;


        const electionResult = await pool.query(
            `SELECT
                id,
                title
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


        const result = await pool.query(
            `SELECT
                id,
                election_id,
                name,
                party,
                symbol,
                image_url,
                manifesto,
                education,
                total_assets,
                total_liabilities,
                criminal_cases_count,
                affidavit_summary,
                created_at
             FROM candidates
             WHERE election_id = $1
             ORDER BY id`,
            [electionId]
        );


        res.json({
            success: true,
            election: electionResult.rows[0],
            candidates: result.rows
        });


    } catch (error) {

        console.error(
            "Get candidates error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Internal server error."
        });

    }
};



// ============================================================
// GET CANDIDATE BY ID
// ============================================================

const getCandidateById = async (req, res) => {

    try {

        const { id } = req.params;


        const result = await pool.query(
            `SELECT
                c.id,
                c.election_id,
                c.name,
                c.party,
                c.symbol,
                c.image_url,
                c.manifesto,
                c.education,
                c.total_assets,
                c.total_liabilities,
                c.criminal_cases_count,
                c.affidavit_summary,
                c.created_at,
                e.title AS election_title
             FROM candidates c
             JOIN elections e
                ON c.election_id = e.id
             WHERE c.id = $1`,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Candidate not found."
            });

        }


        res.json({
            success: true,
            candidate: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Get candidate error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Internal server error."
        });

    }
};



// ============================================================
// GET ALL CANDIDATES ACROSS ALL ELECTIONS
// ============================================================

const getAllCandidates = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                c.id,
                c.election_id,
                c.name,
                c.party,
                c.symbol,
                c.image_url,
                c.manifesto,
                c.education,
                c.total_assets,
                c.total_liabilities,
                c.criminal_cases_count,
                c.affidavit_summary,
                c.created_at,
                e.title AS election_title,
                e.status AS election_status
             FROM candidates c
             LEFT JOIN elections e
                ON c.election_id = e.id
             ORDER BY c.election_id DESC, c.id ASC`
        );

        res.json({
            success: true,
            candidates: result.rows
        });
    } catch (error) {
        console.error("Get all candidates error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

module.exports = {
    addCandidate,
    getCandidatesByElection,
    getCandidateById,
    getAllCandidates
};