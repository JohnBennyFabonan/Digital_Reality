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
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
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
    location,
    description // Add description for the link
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

    console.log('Available agents found:', allAgents); // Debug log
    console.log('All agents result:', allAgentsResult.rows); // Debug log

    if (allAgents.length === 0) {
      return res.status(400).json({ 
        msg: 'No available agents for assignment',
        debug: {
          query: allAgentsQuery,
          result: allAgentsResult.rows
        }
      });
    }

    // Get current date and time for comparison
    const currentDateTime = new Date();
    const currentDate = currentDateTime.toISOString().split('T')[0];
    
    // Add 2 hours buffer to current time
    const bufferMinutes = 120; // 2 hours buffer
    const bufferTime = new Date(currentDateTime.getTime() + bufferMinutes * 60000);
    const bufferTimeString = bufferTime.toTimeString().split(' ')[0];

    console.log('Current date:', currentDate); // Debug log
    console.log('Current time:', currentDateTime.toTimeString().split(' ')[0]); // Debug log
    console.log('Buffer time:', bufferTimeString); // Debug log

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

    console.log('Busy agents found:', busyAgents); // Debug log
    console.log('Busy agents result:', busyAgentsResult.rows); // Debug log

    // Find available agents (not busy with current bookings within buffer period)
    const availableAgents = allAgents.filter(agentId => 
      !busyAgents.includes(agentId)
    );

    console.log('Available agents after busy filter:', availableAgents); // Debug log

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

    console.log('Selected agent ID:', randomAgentId); // Debug log
    console.log('Assignment type:', assignmentType); // Debug log

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

    // Insert images with link field - FIXED: use description instead of link
    const insertImagePromises = req.files.map(file => {
      const image_url = `/uploads/${file.filename}`;
      const insertImageQuery = `
        INSERT INTO properties_imagetbl (listing_id, image_url, link)
        VALUES ($1, $2, $3)
      `;
      return pool.query(insertImageQuery, [listing_id, image_url, description || null]);
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

// Add this GET endpoint to your existing server code
app.get('/api/admin-properties', async (req, res) => {
  try {
    const query = `
      SELECT 
        listing_id,
        employee_id,
        lot_name,
        lot_number,
        lot_type,
        price,
        location,
        lot_area,
        status,
        assigned_agent_id
      FROM propertiestbl
      ORDER BY listing_id DESC
    `;
    
    const result = await pool.query(query);
    
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching properties:', err);
    return res.status(500).json({ 
      msg: 'Server error', 
      error: err.message 
    });
  }
});

// Add this PUT endpoint for status updates
app.put('/api/admin-properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ msg: 'Status is required' });
    }

    // Convert any frontend status to lowercase DB version
    const dbStatus = status.toLowerCase(); 
    // Expected values: "available", "pending", "declined"

    const query = `
      UPDATE propertiestbl 
      SET status = $1 
      WHERE listing_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [dbStatus, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Property not found' });
    }

    return res.status(200).json({
      msg: 'Property updated successfully',
      property: result.rows[0]
    });

  } catch (err) {
    console.error('Error updating property:', err);
    return res.status(500).json({
      msg: 'Server error',
      error: err.message
    });
  }
});

app.get("/api/appointment-info", async (req, res) => {
  const { customer_id, listing_id } = req.query;

  if (!customer_id || !listing_id) {
    return res.status(400).json({ error: "customer_id and listing_id required" });
  }

  try {
    // Get customer info
    const customerQuery = `
      SELECT email, phonenumber
      FROM customertbl
      WHERE customer_id = $1
    `;
    const customerResult = await pool.query(customerQuery, [customer_id]);

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Get agent info using assigned_agent_id
    const agentQuery = `
      SELECT e.employee_id, e.firstname, e.lastname
      FROM propertiestbl p
      LEFT JOIN employeetbl e ON e.employee_id = p.assigned_agent_id
      WHERE p.listing_id = $1
    `;
    const agentResult = await pool.query(agentQuery, [listing_id]);

    const agent = agentResult.rows[0] || {};

    res.json({
      email: customerResult.rows[0].email,
      phonenumber: customerResult.rows[0].phonenumber,
      agent_firstname: agent.firstname || null,
      agent_lastname: agent.lastname || null,
      employee_id: agent.employee_id || null,
    });
  } catch (err) {
    console.error("GET appointment-info error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST book appointment
app.post("/api/book-appointment", async (req, res) => {
  const { customer_id, listing_id, employee_id, visitdate, visittime } = req.body;

  if (!customer_id || !listing_id || !employee_id || !visitdate || !visittime) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const insertQuery = `
      INSERT INTO bookingtbl
      (customer_id, listing_id, employee_id, visitdate, visittime, bookingstatus)
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [
      customer_id,
      listing_id,
      employee_id,
      visitdate,
      visittime,
    ]);

    res.json({
      success: true,
      message: "Booking created successfully",
      booking: result.rows[0],
    });
  } catch (err) {
    console.error("POST book-appointment error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// New API endpoint to get employee appointments for a specific date
// GET all booked times for a given employee + date
app.get('/api/employee-appointments', async (req, res) => {
  const { employee_id, date } = req.query;

  if (!employee_id || !date) {
    return res.status(400).json({ error: "Missing employee_id or date" });
  }

  try {
    const query = `
      SELECT visittime, COUNT(*) as booking_count
      FROM bookingtbl
      WHERE employee_id = $1
        AND visitdate = $2
        AND (bookingstatus IS NULL OR bookingstatus != 'cancelled')
      GROUP BY visittime
    `;

    const result = await pool.query(query, [employee_id, date]);

    const appointments = {};

    result.rows.forEach(row => {
      // Normalize time: "08:00:00" → "08:00"
      const normalized = row.visittime.slice(0, 5);
      appointments[normalized] = parseInt(row.booking_count);
    });

    return res.json({ appointments });

  } catch (error) {
    console.error("Error fetching employee appointments:", error);
    return res.status(500).json({ error: "Failed to fetch employee appointments" });
  }
});

app.get("/api/bookings/:customerId", async (req, res) => {
  const customerId = req.params.customerId;
  const status = req.query.status;

  let query = `
    SELECT 
      b.booking_id,
      b.customer_id,
      b.listing_id,
      b.employee_id,
      b.visitdate,
      b.visittime,
      b.bookingstatus,
      l.lot_name,
      l.location,
      l.price,
      l.lot_area,
      e.firstname AS agent_first_name,
      e.lastname AS agent_last_name
    FROM bookingtbl b
    JOIN propertiestbl l ON b.listing_id = l.listing_id
    LEFT JOIN employeetbl e ON b.employee_id = e.employee_id
  `;

  const conditions = [];
  const params = [];

  conditions.push("b.customer_id = $1");
  params.push(customerId);

  if (status) {
    conditions.push("b.bookingstatus = $" + (params.length + 1));
    params.push(status.toLowerCase());
  }

  if (conditions.length) {
    query += " WHERE " + conditions.join(" AND ");
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


// Example backend route to get appointments with joins
// Get appointments with correct column names
app.get('/api/agent/appointments', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        b.booking_id,
        b.visitdate as appointment_date,
        b.visittime as appointment_time,
        b.bookingstatus,
        u.firstname,
        u.lastname,
        u.phonenumber,
        u.email,
        u.address
      FROM bookingtbl b
      JOIN customertbl u ON b.customer_id = u.customer_id
      WHERE b.bookingstatus IN ('pending', 'approved', 'declined')
    `;
    
    // Add status filter if provided
    if (status && status !== 'all') {
      query += ` AND b.bookingstatus = $1`;
    }
    
    query += ` ORDER BY b.visitdate ASC`;
    
    let result;
    if (status && status !== 'all') {
      result = await pool.query(query, [status]);
    } else {
      result = await pool.query(query);
    }
    
    res.json(result.rows); // For PostgreSQL
    // For MySQL: res.json(result[0]); 
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve appointment route
app.put('/api/agent/appointments/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'UPDATE bookingtbl SET bookingstatus = $1 WHERE booking_id = $2';
    const result = await pool.query(query, ['approved', id]);
    res.json({ message: 'Appointment approved successfully' });
  } catch (error) {
    console.error('Error approving appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Decline appointment route
app.put('/api/agent/appointments/:id/decline', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'UPDATE bookingtbl SET bookingstatus = $1 WHERE booking_id = $2';
    const result = await pool.query(query, ['declined', id]);
    res.json({ message: 'Appointment declined successfully' });
  } catch (error) {
    console.error('Error declining appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get lot details for a booking/listing
app.get('/api/agent/properties/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;

    // Fetch lot details
    const lotQuery = `
      SELECT 
        listing_id,
        employee_id,
        lot_name,
        lot_number,
        lot_type,
        price,
        location,
        lot_area,
        status
      FROM propertiestbl
      WHERE listing_id = $1
    `;

    const lotResult = await pool.query(lotQuery, [listingId]);

    if (lotResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lot not found' });
    }

    const lotDetails = lotResult.rows[0];

    res.json(lotDetails);
  } catch (error) {
    console.error('Error fetching lot details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get the last image for a listing
app.get('/api/agent/properties/:listingId/images/last', async (req, res) => {
  try {
    const { listingId } = req.params;

    const imageQuery = `
      SELECT images_id, listing_id, image_url, link
      FROM properties_imagetbl
      WHERE listing_id = $1
      ORDER BY images_id DESC
      LIMIT 1
    `;

    const imageResult = await pool.query(imageQuery, [listingId]);

    if (imageResult.rows.length === 0) {
      return res.status(404).json({ error: 'No images found for this lot' });
    }

    res.json(imageResult.rows[0]);
  } catch (error) {
    console.error('Error fetching lot image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/agent/bookings/:bookingId/lot', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const query = `
      SELECT p.listing_id, p.lot_name, p.lot_number, p.lot_type,
             p.price, p.location, p.lot_area, p.status
      FROM bookingtbl b
      JOIN propertiestbl p ON b.listing_id = p.listing_id
      WHERE b.booking_id = $1
    `;

    const result = await pool.query(query, [bookingId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lot not found for this booking' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching lot for booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET property details
app.get('/api/properties/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM propertiestbl WHERE listing_id = $1`,
      [listingId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching property details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET property images
app.get('/api/properties/:listingId/images', async (req, res) => {
  try {
    const { listingId } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM properties_imagetbl WHERE listing_id = $1 ORDER BY images_id`,
      [listingId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching property images:', error);
    res.status(500).json({ error: 'Internal server error' });
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