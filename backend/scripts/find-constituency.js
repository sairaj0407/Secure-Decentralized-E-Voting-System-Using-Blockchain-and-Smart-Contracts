const pool = require('../config/database');

async function run() {
    try {
        const c = await pool.query("SELECT id, name, code FROM constituencies WHERE name ILIKE '%shirdi%' OR name ILIKE '%ahmednagar%' OR name ILIKE '%kopargaon%' LIMIT 10");
        console.log("Constituencies:");
        console.table(c.rows);

        const ac = await pool.query("SELECT id, name, code, district_id FROM assembly_constituencies WHERE name ILIKE '%shirdi%' OR name ILIKE '%ahmednagar%' OR name ILIKE '%kopargaon%' LIMIT 10");
        console.log("Assembly Constituencies:");
        console.table(ac.rows);

        const pc = await pool.query("SELECT id, name, code FROM parliamentary_constituencies WHERE name ILIKE '%shirdi%' OR name ILIKE '%ahmednagar%' LIMIT 10");
        console.log("Parliamentary Constituencies:");
        console.table(pc.rows);

        const d = await pool.query("SELECT id, name, state_id FROM districts WHERE name ILIKE '%ahmednagar%' OR name ILIKE '%ahilyanagar%' LIMIT 10");
        console.log("Districts:");
        console.table(d.rows);

        const s = await pool.query("SELECT id, name FROM states WHERE name ILIKE '%maharashtra%' LIMIT 5");
        console.log("States:");
        console.table(s.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
