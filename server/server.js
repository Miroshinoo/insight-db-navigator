
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Global pool variable
let pool = null;

// Test database connection
app.post('/api/test-connection', async (req, res) => {
  const { host, port, database, username, password, ssl } = req.body;
  
  const testPool = new Pool({
    host,
    port: parseInt(port),
    database,
    user: username,
    password,
    ssl: ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    max: 1
  });

  try {
    const client = await testPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    await testPool.end();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Connection test failed:', error);
    await testPool.end();
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Connect to database
app.post('/api/connect', async (req, res) => {
  const { host, port, database, username, password, ssl } = req.body;
  
  // Close existing pool if any
  if (pool) {
    await pool.end();
  }
  
  pool = new Pool({
    host,
    port: parseInt(port),
    database,
    user: username,
    password,
    ssl: ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 10
  });

  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Connection failed:', error);
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all tables
app.get('/api/tables', async (req, res) => {
  if (!pool) {
    return res.status(400).json({ error: 'No database connection' });
  }

  try {
    const result = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    const tables = result.rows.map(row => row.tablename);
    res.json(tables);
  } catch (error) {
    console.error('Failed to fetch tables:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get table data
app.get('/api/tables/:tableName/data', async (req, res) => {
  if (!pool) {
    return res.status(400).json({ error: 'No database connection' });
  }

  const { tableName } = req.params;
  
  try {
    // Get column information
    const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);
    
    const columns = columnsResult.rows.map(row => row.column_name);
    
    // Get table data with limit for performance
    const dataResult = await pool.query(`SELECT * FROM "${tableName}" LIMIT 1000`);
    
    res.json({
      columns,
      rows: dataResult.rows
    });
  } catch (error) {
    console.error(`Failed to fetch data from table ${tableName}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to sanitize and format values
function sanitizeValue(value, columnName) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  // Handle date fields specially
  if (columnName && (columnName.includes('date') || columnName.includes('_at'))) {
    if (typeof value === 'string' && value.trim() === '') {
      return null;
    }
    // Try to parse the date, return null if invalid
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  }
  
  return value;
}

// Create record
app.post('/api/tables/:tableName/records', async (req, res) => {
  if (!pool) {
    return res.status(400).json({ error: 'No database connection' });
  }

  const { tableName } = req.params;
  const createData = req.body;
  
  try {
    // Remove internal fields
    const cleanData = { ...createData };
    delete cleanData._tableName;
    
    // Build INSERT query dynamically, excluding id field
    const fields = Object.keys(cleanData).filter(key => key !== 'id');
    const sanitizedValues = fields.map(field => sanitizeValue(cleanData[field], field));
    
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    const fieldNames = fields.map(field => `"${field}"`).join(', ');
    
    const query = `INSERT INTO "${tableName}" (${fieldNames}) VALUES (${placeholders}) RETURNING id`;
    
    console.log('Creating record with query:', query);
    console.log('Values:', sanitizedValues);
    
    const result = await pool.query(query, sanitizedValues);
    
    res.json({ success: true, id: result.rows[0]?.id });
  } catch (error) {
    console.error(`Failed to create record in table ${tableName}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update record
app.put('/api/tables/:tableName/records/:recordId', async (req, res) => {
  if (!pool) {
    return res.status(400).json({ error: 'No database connection' });
  }

  const { tableName, recordId } = req.params;
  const updateData = req.body;
  
  try {
    // Remove internal fields and id from update data
    const cleanData = { ...updateData };
    delete cleanData.id;
    delete cleanData._tableName;
    
    // Filter out fields that are empty, null, or undefined to avoid partial updates issues
    const fieldsToUpdate = Object.keys(cleanData).filter(key => {
      const value = cleanData[key];
      // Only include fields that have actual values or are explicitly being set to null/empty
      return value !== undefined;
    });
    
    if (fieldsToUpdate.length === 0) {
      return res.json({ success: true }); // Nothing to update
    }
    
    // Sanitize values
    const sanitizedValues = fieldsToUpdate.map(field => sanitizeValue(cleanData[field], field));
    
    // Build UPDATE query dynamically with proper parameterization
    const setClause = fieldsToUpdate.map((field, index) => `"${field}" = $${index + 2}`).join(', ');
    const values = [recordId, ...sanitizedValues];
    
    const query = `UPDATE "${tableName}" SET ${setClause} WHERE id = $1`;
    
    console.log('Updating record with query:', query);
    console.log('Values:', values);
    
    const result = await pool.query(query, values);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Failed to update record in table ${tableName}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create users table if it doesn't exist
app.post('/api/create-users-table', async (req, res) => {
  if (!pool) {
    return res.status(400).json({ error: 'No database connection' });
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);
    
    // Insert default admin user if table is empty
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO users (username, email, role) 
        VALUES ('admin', 'admin@example.com', 'admin')
      `);
    }
    
    res.json({ success: true, message: 'Users table created successfully' });
  } catch (error) {
    console.error('Failed to create users table:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`PostgreSQL API server running on port ${PORT}`);
});
