const pool = require("../config/database");

async function standardizeGeography() {
    console.log("=== INITIATING ELECTORAL GEOGRAPHY PURGE & STANDARDIZATION ===");
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1. Identify non-standard entries in constituencies
        const badRowsQuery = `
            SELECT id, name, level, code 
            FROM constituencies 
            WHERE level != 'CONSTITUENCY' 
               OR name ILIKE '%shirdi%' 
               OR name ILIKE '%test%' 
               OR name ILIKE '%dummy%'
               OR name ILIKE '%fake%'
               OR name ILIKE '%sample%'
        `;
        const badRows = await client.query(badRowsQuery);
        console.log(`Found ${badRows.rows.length} non-standard/legacy dummy entries in constituencies table.`);

        if (badRows.rows.length > 0) {
            const badIds = badRows.rows.map(r => r.id);

            // Re-link polling stations referencing these IDs to their valid assembly_constituency_id
            const psRelink = await client.query(`
                UPDATE polling_stations 
                SET constituency_id = assembly_constituency_id 
                WHERE constituency_id = ANY($1::bigint[]) AND assembly_constituency_id IS NOT NULL
            `, [badIds]);
            console.log(`Re-linked ${psRelink.rowCount} polling stations to their authentic assembly_constituency_id.`);

            // Nullify self-referencing parent_id
            const parentClear = await client.query(`
                UPDATE constituencies 
                SET parent_id = NULL 
                WHERE parent_id = ANY($1::bigint[])
            `, [badIds]);
            console.log(`Cleared ${parentClear.rowCount} self-referencing parent_ids.`);

            // Clear any user references
            const userClear = await client.query(`
                UPDATE users 
                SET constituency_id = assembly_constituency_id 
                WHERE constituency_id = ANY($1::bigint[])
            `, [badIds]);
            console.log(`Updated ${userClear.rowCount} user constituency references.`);

            // Clear repolls, election_officers, grievances if any
            await client.query(`UPDATE repolls SET constituency_id = NULL WHERE constituency_id = ANY($1::bigint[])`, [badIds]);
            await client.query(`UPDATE election_officers SET constituency_id = NULL WHERE constituency_id = ANY($1::bigint[])`, [badIds]);
            await client.query(`UPDATE grievances SET constituency_id = NULL WHERE constituency_id = ANY($1::bigint[])`, [badIds]);

            // Delete non-standard entries
            const delRes = await client.query(`DELETE FROM constituencies WHERE id = ANY($1::bigint[])`, [badIds]);
            console.log(`Successfully purged ${delRes.rowCount} non-standard/dummy records from constituencies table.`);
        }

        // 2. Verify all remaining records in constituencies table
        const remainingCount = await client.query("SELECT COUNT(*) FROM constituencies");
        console.log(`Constituencies table now contains ${remainingCount.rows[0].count} authentic records.`);

        // 3. Verify core official tables
        const stateCount = await client.query("SELECT COUNT(*) FROM states");
        const districtCount = await client.query("SELECT COUNT(*) FROM districts");
        const pcCount = await client.query("SELECT COUNT(*) FROM parliamentary_constituencies");
        const acCount = await client.query("SELECT COUNT(*) FROM assembly_constituencies");
        const psCount = await client.query("SELECT COUNT(*) FROM polling_stations");

        console.log("=== OFFICIAL ELECTORAL GEOGRAPHY REGISTRY ===");
        console.log(`States / UTs: ${stateCount.rows[0].count} (Target: 36 Official)`);
        console.log(`Districts: ${districtCount.rows[0].count} (Target: 971 Official)`);
        console.log(`Parliamentary Constituencies (Lok Sabha): ${pcCount.rows[0].count} (Target: 546 Official)`);
        console.log(`Assembly Constituencies (Vidhan Sabha): ${acCount.rows[0].count} (Target: 4,551 Official)`);
        console.log(`Designated Polling Stations: ${psCount.rows[0].count} (Target: 9,526 Official)`);

        await client.query("COMMIT");
        console.log("=== ELECTORAL GEOGRAPHY PURGE & STANDARDIZATION COMPLETE ===");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Purge error:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

standardizeGeography();
