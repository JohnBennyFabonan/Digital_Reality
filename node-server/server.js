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
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
}));
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
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, phone, address, username, password } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !phone || !address || !username || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // ✅ Check if user already exists
    const exists = await pool.query(
      "SELECT * FROM usertbl WHERE email=$1 OR username=$2",
      [email, username]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ msg: "Email or username already registered" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert user
    const insertQuery = `
      INSERT INTO usertbl (name, email, phone, address, username, password, role)
      VALUES ($1, $2, $3, $4, $5, $6, 'Customer')
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [
      name,
      email,
      phone,
      address,
      username,
      hashedPassword,
    ]);

    res.status(201).json({ msg: "Signup successful", user: result.rows[0] });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* =======================================================
   🔐 CUSTOMER LOGIN
======================================================= */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // ✅ Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ msg: "Email, password, and role are required" });
    }

    // ✅ Query user by email and role
    const result = await pool.query("SELECT * FROM usertbl WHERE email=$1 AND role=$2", [
      email,
      role,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ msg: "User not found for this role" });
    }

    const user = result.rows[0];

    // ✅ Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ msg: "Incorrect password" });
    }

    // ✅ Success
    res.status(200).json({
      msg: "Login successful",
      user: {
        id: user.userid,
        name: user.name,
        email: user.email,
        role: user.role,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 🧠 Get customer info by ID
app.get("/api/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT name, address, email, phone, username FROM usertbl WHERE id = $1 AND role = 'Customer'",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ msg: "Customer not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error fetching customer info" });
  }
});

// --------------------
// Add Staff Route
// --------------------
app.post("/api/add-user", async (req, res) => {
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

app.post("/api/logout", (req, res) => {
  // If you’re using sessions:
  if (req.session) {
    req.session.destroy(() => {
      res.status(200).json({ msg: "Logged out successfully" });
    });
  } else {
    // If not using sessions, just respond success
    res.status(200).json({ msg: "Logged out successfully" });
  }
});

// Fetch all staff from usertbl
app.get("/api/staff", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT name, address, phone FROM usertbl WHERE role = 'Staff'"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

// Fetch all agents from usertbl
app.get("/api/agents", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, address, phone FROM usertbl WHERE role = 'Agent'"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch agents" });
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
