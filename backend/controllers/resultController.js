const pool = require("../config/database");

const {
    getBlockchainElectionResults
} = require("../services/blockchainService");


const getElectionResults = async (req, res) => {
    try {

        const { electionId } = req.params;


        // ============================================================
        // GET ELECTION
        // ============================================================

        const electionResult = await pool.query(
            `
            SELECT
                id,
                title,
                description,
                status,
                blockchain_election_id,
                contract_address
            FROM elections
            WHERE id = $1
            `,
            [electionId]
        );


        if (electionResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Election not found."
            });

        }


        const election = electionResult.rows[0];


        // ============================================================
        // GET REAL BLOCKCHAIN RESULTS
        // ============================================================

        let blockchainResults = null;


        try {

            blockchainResults =
                await getBlockchainElectionResults(
                    election.blockchain_election_id
                );


        } catch (blockchainError) {

            console.error(
                "Blockchain results error:",
                blockchainError.message
            );

        }


        // ============================================================
        // GET DATABASE CANDIDATE RESULTS
        // ============================================================

        const result = await pool.query(
            `
            SELECT
                c.id,
                c.name,
                c.party,
                c.symbol,
                COUNT(v.id)::integer AS votes
            FROM candidates c
            LEFT JOIN votes v
                ON v.candidate_id = c.id
                AND v.election_id = c.election_id
            WHERE c.election_id = $1
            GROUP BY
                c.id,
                c.name,
                c.party,
                c.symbol
            ORDER BY votes DESC, c.id ASC
            `,
            [electionId]
        );


        const totalVotes = result.rows.reduce(
            (total, candidate) =>
                total + Number(candidate.votes),
            0
        );


        // ============================================================
        // FINAL RESPONSE
        // ============================================================

        res.json({

            success: true,


            election,


            databaseResults: {

                totalVotes,

                candidates: result.rows.map(candidate => ({

                    id: candidate.id,

                    name: candidate.name,

                    party: candidate.party,

                    symbol: candidate.symbol,

                    votes: Number(candidate.votes)

                }))

            },


            blockchainResults,


            blockchainVerified:
                blockchainResults !== null

        });


    } catch (error) {

        console.error(
            "Get election results error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Internal server error."

        });

    }
};


module.exports = {

    getElectionResults

};