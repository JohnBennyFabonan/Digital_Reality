import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcrypt";
import multer from "multer";

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage() });


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
  ssl: {rejectUnauthorized: false}
});

// --------------------
// RealState Login Route
// --------------------

app.post("/api/employee-login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ msg: "Email, password, and role are required" });
    }

    // Fetch user by email and role
    const query = `SELECT * FROM employeetbl WHERE email = $1 AND LOWER(usertype) = LOWER($2)`;
    const result = await pool.query(query, [email, role]);

    if (result.rows.length === 0) {
      return res.status(401).json({ msg: "Invalid email or role" });
    }

    const user = result.rows[0];

    // Check password
    const validPass = await bcrypt.compare(password, user.passwordhash);
    if (!validPass) {
      return res.status(401).json({ msg: "Invalid password" });
    }

    // Remove sensitive data before sending back
    delete user.passwordhash;

    res.json({ msg: "Login successful", user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


app.post("/api/customer-signup", async (req, res) => {
  const {
    firstname,
    lastname,
    phonenumber,
    email,
    dateofbirth,
    address,
    username,
    password,
  } = req.body;

  if (
    !firstname ||
    !lastname ||
    !phonenumber ||
    !email ||
    !dateofbirth ||
    !address ||
    !username ||
    !password
  ) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    // Check if email or username exists
    const checkQuery = `
      SELECT 1 FROM customertbl WHERE email = $1 OR username = $2
    `;
    const checkResult = await pool.query(checkQuery, [email, username]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ msg: "Email or username already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const passwordhash = await bcrypt.hash(password, saltRounds);

    // Insert user, registrationdate is now()
    const insertQuery = `
      INSERT INTO customertbl
      (firstname, lastname, phonenumber, email, dateofbirth, address, username, passwordhash, registrationdate) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING customer_id, firstname, lastname, phonenumber, email, dateofbirth, address, username, registrationdate
    `;
    const insertValues = [firstname, lastname, phonenumber, email, dateofbirth, address, username, passwordhash];

    const insertResult = await pool.query(insertQuery, insertValues);

    const newUser = insertResult.rows[0];

    return res.status(201).json({ user: newUser, msg: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// Customer Login Endpoint
app.post("/api/customer-login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required" });
  }

  try {
    const query = `
      SELECT customer_id, firstname, lastname, phonenumber, email, 
             dateofbirth, address, username, passwordhash, registrationdate
      FROM customertbl WHERE email = $1
    `;
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.passwordhash);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Remove password hash from response
    const { passwordhash, ...userWithoutPassword } = user;

    return res.json({ user: userWithoutPassword, msg: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ msg: "Server error" });
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
app.post("/api/add-employee", upload.single("image"), async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      phonenumber,
      dateofbirth,
      username,
      password,
      usertype,
    } = req.body;

    const imageBuffer = req.file ? req.file.buffer : null;

    const passwordhash = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO employeetbl 
      (firstname, lastname, email, phonenumber, dateofbirth, username, passwordhash, usertype, image_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      firstname,
      lastname,
      email,
      phonenumber,
      dateofbirth,
      username,
      passwordhash,
      usertype,
      imageBuffer,
    ]);

    res.status(201).json({ msg: "Employee added successfully", employee: result.rows[0] });

  } catch (err) {
    console.error("Add employee error:", err);
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
      "SELECT firstname, lastname, phonenumber FROM employeetbl WHERE usertype = 'Staff'"
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
      "SELECT employee_id, firstname, lastname, phonenumber FROM employeetbl WHERE usertype = 'Agent'"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch agents" });
  }
});

app.put("/api/customers/:id", async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, dateofbirth, phonenumber, username, password } = req.body;

  try {
    console.log("📅 Received DOB:", dateofbirth); // Debug log

    let updateQuery = `
      UPDATE customertbl 
      SET firstname = $1, lastname = $2, email = $3, dateofbirth = $4, 
          phonenumber = $5, username = $6
    `;
    let updateValues = [firstname, lastname, email, dateofbirth, phonenumber, username];
    
    // Add password update if provided
    if (password) {
      const passwordhash = await bcrypt.hash(password, 10);
      updateQuery += `, passwordhash = $7 WHERE customer_id = $8 RETURNING *`;
      updateValues.push(passwordhash, id);
    } else {
      updateQuery += ` WHERE customer_id = $7 RETURNING *`;
      updateValues.push(id);
    }

    const result = await pool.query(updateQuery, updateValues);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    const updatedUser = result.rows[0];
    // Format date for response if needed
    if (updatedUser.dateofbirth) {
      updatedUser.dateofbirth = new Date(updatedUser.dateofbirth).toISOString().split('T')[0];
    }
    
    // Remove password hash from response
    const { passwordhash, ...userWithoutPassword } = updatedUser;
    
    res.json({ user: userWithoutPassword, msg: "User updated successfully" });
  } catch (err) {
    console.error("Update user error:", err);
    
    // Handle unique constraint violations
    if (err.code === '23505') {
      return res.status(400).json({ msg: "Email or username already exists" });
    }
    
    res.status(500).json({ msg: "Server error" });
  }
});

// --------------------
// Test Route
// --------------------
app.get("/api", (req, res) => {
  res.json({ message: "Hello from Node backend!" });
});

pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database connected successfully:", result.rows[0].now);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
