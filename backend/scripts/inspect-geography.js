const pool = require("../config/database");

async function inspectGeo() {
  try {
    console.log("=== STATES ===");
    const states = await pool.query("SELECT * FROM states ORDER BY name ASC");
    console.log(`Total States: ${states.rows.length}`);
    console.table(states.rows.slice(0, 10));

    console.log("=== DISTRICTS SAMPLE ===");
    const districts = await pool.query("SELECT * FROM districts ORDER BY name ASC LIMIT 10");
    const distCount = await pool.query("SELECT COUNT(*) FROM districts");
    console.log(`Total Districts: ${distCount.rows[0].count}`);
    console.table(districts.rows);

    console.log("=== PARLIAMENTARY CONSTITUENCIES SAMPLE ===");
    const pcs = await pool.query("SELECT id, state_id, name, constituency_number, code FROM parliamentary_constituencies LIMIT 10");
    const pcCount = await pool.query("SELECT COUNT(*) FROM parliamentary_constituencies");
    console.log(`Total PCs: ${pcCount.rows[0].count}`);
    console.table(pcs.rows);

    console.log("=== ASSEMBLY CONSTITUENCIES SAMPLE ===");
    const acs = await pool.query("SELECT * FROM assembly_constituencies LIMIT 10");
    const acCount = await pool.query("SELECT COUNT(*) FROM assembly_constituencies");
    console.log(`Total ACs: ${acCount.rows[0].count}`);
    console.table(acs.rows);

    console.log("=== POLLING STATIONS COLUMNS ===");
    const psCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'polling_stations'");
    console.log("PS Columns:", psCols.rows.map(r => r.column_name));

    console.log("=== CHECK FOR FAKE/TEST DATA ===");
    const fakeKeywords = ["%test%", "%dummy%", "%fake%", "%sample%", "%demo%", "%mock%"];
    for (const table of ['states', 'districts', 'parliamentary_constituencies', 'assembly_constituencies', 'polling_stations', 'constituencies']) {
      const q = `SELECT id, name FROM ${table} WHERE name ILIKE ANY($1) LIMIT 10`;
      const res = await pool.query(q, [fakeKeywords]);
      console.log(`Fake/dummy in ${table}: ${res.rows.length}`);
      if (res.rows.length > 0) console.table(res.rows);
    }

    // Check states list
    const allStates = await pool.query("SELECT id, name, code, status FROM states ORDER BY name");
    console.log(`Total States: ${allStates.rows.length}`);
    console.table(allStates.rows);

    // Foreign keys to constituencies
    const fks = await pool.query(`
      SELECT tc.table_name, kcu.column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'constituencies'
    `);
    console.log("Foreign keys referencing constituencies:", fks.rows);

    // Check non-standard entries in constituencies
    const nonStd = await pool.query(`
      SELECT id, name, code, level, parent_id FROM constituencies 
      WHERE level != 'CONSTITUENCY' OR name ILIKE '%shirdi%' OR name ILIKE '%test%'
    `);
    console.log("Non-standard constituencies count:", nonStd.rows.length);
    console.table(nonStd.rows.slice(0, 15));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

inspectGeo();
