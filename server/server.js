
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

// Update record
app.put('/api/tables/:tableName/records/:recordId', async (req, res) => {
  if (!pool) {
    return res.status(400).json({ error: 'No database connection' });
  }

  const { tableName, recordId } = req.params;
  const updateData = req.body;
  
  try {
    // Build UPDATE query dynamically
    const fields = Object.keys(updateData).filter(key => key !== 'id');
    const setClause = fields.map((field, index) => `"${field}" = $${index + 2}`).join(', ');
    const values = [recordId, ...fields.map(field => updateData[field])];
    
    const query = `UPDATE "${tableName}" SET ${setClause} WHERE id = $1`;
    
    await pool.query(query, values);
    res.json({ success: true });
  } catch (error) {
    console.error(`Failed to update record in table ${tableName}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`PostgreSQL API server running on port ${PORT}`);
});
