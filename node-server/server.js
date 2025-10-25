import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcrypt";

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
});

// --------------------
// RealState Login Route
// --------------------
app.post("/api/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log("Login attempt:", req.body);

    // Case-insensitive role comparison
    const userResult = await pool.query(
      "SELECT * FROM usertbl WHERE email=$1 AND LOWER(role)=LOWER($2)",
      [email, role]
    );

    if (!userResult.rows.length) {
      console.log("No user found for email:", email, "role:", role);
      return res.status(401).json({ msg: "User not found" });
    }

    const user = userResult.rows[0];
    console.log("Found user:", user.email, user.role, "hashed password:", user.password);

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) return res.status(401).json({ msg: "Incorrect password" });

    // Successful login
    res.status(200).json({
      msg: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        username: user.username,
        image: user.image,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// --------------------
// Add Staff Route
// --------------------
app.post("/api/add-staff", async (req, res) => {
  try {
    const { name, email, phone, address, username, password, role, image } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO usertbl (name, email, phone, address, username, password, role, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [
      name,
      email,
      phone,
      address,
      username,
      hashedPassword,
      role || null,
      image || null,
    ]);

    res.status(201).json({ msg: "Staff added successfully", staff: result.rows[0] });
  } catch (err) {
    console.error("Add staff error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// --------------------
// Test Route
// --------------------
app.get("/api", (req, res) => {
  res.json({ message: "Hello from Node backend!" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
