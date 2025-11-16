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

// ✅ Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'https://your-frontend-app.onrender.com' // Replace with your actual frontend URL
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Robust Database Configuration
const getDatabaseConfig = () => {
  console.log('🔧 Database Configuration:');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Not present');
  console.log('   PG_HOST:', process.env.PG_HOST || 'Not set');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');

  // Priority 1: Use DATABASE_URL (for Render production)
  if (process.env.DATABASE_URL) {
    console.log('   Using DATABASE_URL for connection');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    };
  }

  // Priority 2: Use individual environment variables (for local development)
  if (process.env.PG_HOST) {
    console.log('   Using individual PG_* variables for connection');
    const config = {
      host: process.env.PG_HOST,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      port: process.env.PG_PORT || 5432,
    };

    // Only use SSL for external databases (like Render PostgreSQL)
    if (process.env.PG_HOST.includes('render.com') || process.env.PG_HOST.includes('supabase') || process.env.PG_HOST.includes('aws')) {
      config.ssl = { rejectUnauthorized: false };
      console.log('   SSL enabled for external database');
    }

    return config;
  }

  // No database configuration found
  console.error('   ❌ No database configuration found!');
  return null;
};

const dbConfig = getDatabaseConfig();
if (!dbConfig) {
  console.error('💥 FATAL: No database configuration provided. Please set DATABASE_URL or PG_* environment variables.');
  process.exit(1);
}

const pool = new Pool(dbConfig);

// ✅ Enhanced Database Connection with Retry Logic
const connectDB = async (maxRetries = 5, retryDelay = 2000) => {
  let retries = maxRetries;
  
  while (retries > 0) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as current_time, version() as version');
      console.log('✅ Database connected successfully:');
      console.log('   Time:', result.rows[0].current_time);
      console.log('   Version:', result.rows[0].version.split(',')[0]); // Just first line of version
      client.release();
      return true;
    } catch (error) {
      retries--;
      console.error(`❌ Database connection failed (${retries} retries left):`, error.message);
      
      if (retries === 0) {
        console.error('💥 Could not connect to database after all retries');
        return false;
      }
      
      console.log(`   Retrying in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

// ✅ Enhanced Health Check Endpoint
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'checking...'
  };

  try {
    await pool.query('SELECT 1 as health_check');
    healthCheck.database = 'connected';
    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.status = 'ERROR';
    healthCheck.database = 'disconnected';
    healthCheck.error = error.message;
    res.status(500).json(healthCheck);
  }
});

// ✅ Database Test Endpoint
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        NOW() as current_time,
        version() as version,
        current_database() as database,
        current_user as user
    `);
    
    res.json({
      success: true,
      database: 'connected',
      details: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Check your database connection and SSL configuration'
    });
  }
});

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Real Estate Backend API",
    status: "running",
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: "/health",
      testDb: "/test-db",
      api: "/api"
    }
  });
});

// --------------------
// YOUR EXISTING ROUTES (Keep all your current routes below)
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

// ... Keep all your other existing routes exactly as they are ...

// ✅ Enhanced Server Startup
const startServer = async () => {
  try {
    console.log('🚀 Starting Real Estate Server...');
    console.log('📋 Configuration:');
    console.log('   Port:', PORT);
    console.log('   Environment:', process.env.NODE_ENV || 'development');
    
    // Connect to database
    const dbConnected = await connectDB();
    
    if (!dbConnected) {
      console.log('⚠️  Starting server without database connection...');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log('✨ Server started successfully!');
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`🔍 Health: http://localhost:${PORT}/health`);
      console.log(`🗄️  DB Test: http://localhost:${PORT}/test-db`);
      
      if (!dbConnected) {
        console.log('❌ Database is not connected - API endpoints will fail');
      }
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();