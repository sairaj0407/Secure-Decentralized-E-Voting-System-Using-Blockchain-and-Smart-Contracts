const pool = require('../config/database');

async function run() {
    try {
        const u = await pool.query("SELECT * FROM users WHERE id = 3758");
        console.log("User 3758:", u.rows[0]);

        if (u.rows[0].constituency_id) {
            const c = await pool.query("SELECT * FROM constituencies WHERE id = $1", [u.rows[0].constituency_id]);
            console.log("Constituency:", c.rows[0]);
        }

        if (u.rows[0].polling_station_id) {
            const ps = await pool.query("SELECT * FROM polling_stations WHERE id = $1", [u.rows[0].polling_station_id]);
            console.log("Polling station:", ps.rows[0]);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
