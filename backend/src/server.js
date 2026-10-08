import "dotenv/config";
import app from "./app.js";
import pool from "./config/db.js";

const port = Number(process.env.PORT || 5000);

try {
  await pool.query("SELECT 1");
  app.listen(port, () => {
    console.log(`MEIL ESG API listening at http://localhost:${port}`);
  });
} catch (error) {
  console.error("Could not connect to MySQL. Check DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in backend/.env.");
  console.error(error.code || "Database connection failed.");
  process.exit(1);
}
