import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcrypt";
import multer from "multer";
import path from 'path';
import fs from 'fs';

dotenv.config();
console.log("CHECK ENV:", process.env.PG_USER, process.env.PG_HOST);

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage() });
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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
  ssl: false
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
  // If you're using sessions:
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

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer config for multiple images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Use timestamp + original name to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadMultiple = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB per file
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});

// Create new property with multiple images
app.post('/api/properties', uploadMultiple.array('images', 10), async (req, res) => {
  const {
    lot_name,
    lot_number,
    lot_type,
    price,
    province,
    lot_area,
    area_unit,
    location
  } = req.body;

  const employee_id = 1; // creator - from auth/session

  if (!lot_name || !lot_type || !price || !province || !lot_area) {
    return res.status(400).json({ msg: 'Required fields missing' });
  }

  if (!req.files || req.files.length < 4 || req.files.length > 10) {
    return res.status(400).json({ msg: 'Please upload between 4 and 10 images.' });
  }

  try {
    // Get only agents (usertype = 'agent') with status 'Available'
    const allAgentsQuery = `
      SELECT employee_id 
      FROM employeetbl 
      WHERE usertype = 'Agent' AND status = 'Available'
    `;
    const allAgentsResult = await pool.query(allAgentsQuery);
    const allAgents = allAgentsResult.rows.map(row => row.employee_id);

    if (allAgents.length === 0) {
      return res.status(400).json({ msg: 'No available agents for assignment' });
    }

    // Get current date and time for comparison
    const currentDateTime = new Date();
    const currentDate = currentDateTime.toISOString().split('T')[0];
    
    // Add 2 hours buffer to current time
    const bufferMinutes = 120; // 2 hours buffer
    const bufferTime = new Date(currentDateTime.getTime() + bufferMinutes * 60000);
    const bufferTimeString = bufferTime.toTimeString().split(' ')[0];

    // Get agents with active bookings that overlap with current date/time (with buffer)
    const busyAgentsQuery = `
      SELECT DISTINCT employee_id, visittime
      FROM bookingtbl 
      WHERE employee_id IS NOT NULL 
      AND bookingstatus IN ('Pending', 'Confirmed', 'Scheduled')
      AND visitdate = $1
      AND visittime BETWEEN $2 AND $3
    `;
    const busyAgentsResult = await pool.query(busyAgentsQuery, [
      currentDate, 
      currentDateTime.toTimeString().split(' ')[0], 
      bufferTimeString
    ]);
    const busyAgents = busyAgentsResult.rows.map(row => row.employee_id);

    // Find available agents (not busy with current bookings within buffer period)
    const availableAgents = allAgents.filter(agentId => 
      !busyAgents.includes(agentId)
    );

    let randomAgentId;
    let assignmentType;

    if (availableAgents.length > 0) {
      // Pick random agent from available agents
      randomAgentId = availableAgents[Math.floor(Math.random() * availableAgents.length)];
      assignmentType = 'Available Agent (Not Busy in Next 2 Hours)';
    } else {
      // If all agents are busy, pick from all available status agents
      randomAgentId = allAgents[Math.floor(Math.random() * allAgents.length)];
      assignmentType = 'All Agents Busy - Random Assignment from Available Status Agents';
    }

    // Insert property
    const insertPropertyQuery = `
      INSERT INTO propertiestbl
      (employee_id, lot_name, lot_number, lot_type, price, location, lot_area, status, assigned_agent_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING listing_id
    `;
    
    const propertyResult = await pool.query(insertPropertyQuery, [
      employee_id,
      lot_name,
      lot_number || null,
      lot_type,
      parseFloat(price),
      location || province,
      `${lot_area} ${area_unit}`,
      'Pending',
      randomAgentId
    ]);

    const listing_id = propertyResult.rows[0].listing_id;

    // Insert images
    const insertImagePromises = req.files.map(file => {
      const image_url = `/uploads/${file.filename}`;
      const insertImageQuery = `
        INSERT INTO properties_imagetbl (listing_id, image_url)
        VALUES ($1, $2)
      `;
      return pool.query(insertImageQuery, [listing_id, image_url]);
    });

    await Promise.all(insertImagePromises);

    return res.status(201).json({ 
      msg: 'Property added successfully', 
      listing_id, 
      assigned_agent_id: randomAgentId,
      assignment_type: assignmentType,
      available_agents_count: availableAgents.length,
      total_agents_count: allAgents.length,
      busy_agents_count: busyAgents.length
    });

  } catch (err) {
    console.error('Error adding property:', err);
    return res.status(500).json({ 
      msg: 'Server error', 
      error: err.message
    });
  }
});

// Get properties with agent names
app.get('/api/get/properties', async (req, res) => {
  try {
    const propertiesQuery = `
      SELECT 
        p.listing_id,
        p.location,
        p.lot_area,
        p.assigned_agent_id,
        e.firstname as agent_name,
        (
          SELECT image_url 
          FROM properties_imagetbl 
          WHERE listing_id = p.listing_id 
          LIMIT 1
        ) as primary_image
      FROM propertiestbl p
      LEFT JOIN employeetbl e ON p.assigned_agent_id = e.employee_id
      ORDER BY p.listing_id DESC
    `;
    
    const propertiesResult = await pool.query(propertiesQuery);
    
    const propertiesWithAgentNames = propertiesResult.rows.map(row => ({
      listing_id: row.listing_id,
      location: row.location,
      lot_area: row.lot_area,
      assigned_agent_id: row.assigned_agent_id,
      agent_name: row.agent_name, // This will be the agent's name
      image: row.primary_image
    }));

    return res.status(200).json(propertiesWithAgentNames);

  } catch (err) {
    console.error('Error fetching properties:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET all available properties
app.get('/api/lot_properties', async (req, res) => {
  try {
    console.log('📦 Fetching properties...');
    
    const query = `
      SELECT DISTINCT 
        p.listing_id,
        p.lot_name,
        p.lot_number,
        p.lot_type,
        p.price,
        p.location,
        p.lot_area,
        p.status,
        (
          SELECT pi.image_url 
          FROM properties_imagetbl pi 
          WHERE pi.listing_id = p.listing_id 
          LIMIT 1
        ) as main_image
      FROM propertiestbl p
      WHERE p.status = 'Available'
      ORDER BY p.listing_id DESC
    `;
    
    const result = await pool.query(query);
    console.log(`✅ Found ${result.rows.length} properties`);
    
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get property images by listing_id
// Get property images by listing_id - FIXED VERSION
app.get('/api/property-images/:listing_id', async (req, res) => {
  try {
    const { listing_id } = req.params;
    console.log(`🖼️ Fetching images for listing: ${listing_id}`);
    
    const query = `
      SELECT image_url 
      FROM properties_imagetbl 
      WHERE listing_id = $1 
      ORDER BY images_id 
      LIMIT 4
    `;
    
    const result = await pool.query(query, [listing_id]);
    console.log(`✅ Found ${result.rows.length} images for listing ${listing_id}`);
    
    res.json({ 
      images: result.rows.map(img => img.image_url),
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching property images:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Add this route to your existing Express app
app.get('/api/properties/:listingId', async (req, res) => {
  try {
    const listingId = req.params.listingId;
    console.log('🔍 Fetching property details for ID:', listingId);

    // Fetch property basic info
    const propertyQuery = `
      SELECT 
        listing_id,
        location, 
        lot_area, 
        price,
        assigned_agent_id,
        lot_name,
        lot_number,
        lot_type,
        status
      FROM propertiestbl 
      WHERE listing_id = $1
    `;

    const propertyResult = await pool.query(propertyQuery, [listingId]);
    
    if (propertyResult.rows.length === 0) {
      console.log('❌ No property found with ID:', listingId);
      return res.status(404).json({ 
        message: 'Property not found' 
      });
    }

    const property = propertyResult.rows[0];
    const assignedAgentId = property.assigned_agent_id;

    console.log('✅ Property found:', {
      listing_id: property.listing_id,
      location: property.location,
      lot_area: property.lot_area,
      price: property.price,
      assigned_agent_id: assignedAgentId
    });

    // Fetch property images (limit to 4)
    const imagesQuery = `
      SELECT 
        image_url,
        link as virtual_tour_link
      FROM properties_imagetbl 
      WHERE listing_id = $1 
      LIMIT 4
    `;

    const imagesResult = await pool.query(imagesQuery, [listingId]);
    console.log('📸 Images found:', imagesResult.rows.length);

    let agentInfo = {
      name: 'No agent assigned',
      phone: 'Not available',
      email: 'Not available'
    };

    // Fetch agent info if assigned_agent_id exists
    if (assignedAgentId) {
      const agentQuery = `
        SELECT 
          firstname,
          lastname,
          phonenumber,
          email
        FROM employeetbl 
        WHERE employee_id = $1
      `;

      const agentResult = await pool.query(agentQuery, [assignedAgentId]);
      
      if (agentResult.rows.length > 0) {
        const agentData = agentResult.rows[0];
        agentInfo = {
          name: `${agentData.firstname} ${agentData.lastname}`,
          phone: agentData.phonenumber || 'Not Available',
          email: agentData.email || 'Not Available'
        };
        console.log('👤 Agent found:', agentInfo.name);
      }
    }

    const responseData = {
      listing_id: property.listing_id,
      location: property.location,
      lot_area: property.lot_area,
      price: property.price,
      lot_name: property.lot_name,
      lot_number: property.lot_number,
      lot_type: property.lot_type,
      status: property.status,
      images: imagesResult.rows,
      virtual_tour_link: imagesResult.rows[0]?.virtual_tour_link || '',
      agent_info: agentInfo
    };

    console.log('✅ SUCCESS: Sending property details');
    res.json(responseData);

  } catch (error) {
    console.error('❌ Error fetching property details:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
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
    console.log("✅ Database connection successful:", result.rows[0].now);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});