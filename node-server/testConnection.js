import pool from "./db.js";

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Database connected successfully!");
    console.log("Current time:", res.rows[0]);
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  } finally {
    await pool.end();
  }
})();
    