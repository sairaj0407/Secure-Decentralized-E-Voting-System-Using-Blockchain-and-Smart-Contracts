const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const pool = require("../config/database");
const bcrypt = require("bcrypt");

async function main() {
  const voters = await pool.query("SELECT id, name, voter_id, password_hash FROM users WHERE voter_id IN ('504060', '504048')");
  for (const u of voters.rows) {
    const match = await bcrypt.compare("Sairaj@123", u.password_hash || "");
    console.log(`User ${u.id} (${u.name}, voter_id ${u.voter_id}) password matches 'Sairaj@123':`, match);
    if (!match) {
      const newHash = await bcrypt.hash("Sairaj@123", 10);
      await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, u.id]);
      console.log(`Updated password for user ${u.id} to 'Sairaj@123'`);
    }
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
