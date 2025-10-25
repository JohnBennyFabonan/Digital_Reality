// db.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",        // your PostgreSQL username
  host: "localhost",       // or your host address
  database: "realestatedb", // your database name
  password: "password", // your PostgreSQL password
  port: 5433,              // default PostgreSQL port
});

export default pool;
