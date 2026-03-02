// Minimal test for Vercel deployment
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Minimal backend working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    
    const result = await sql`SELECT COUNT(*) as count FROM users`;
    
    res.json({
      success: true,
      message: 'Database connection successful',
      userCount: result[0].count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Santé Initiative Backend - Minimal Test',
    status: 'working'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL) {
  // Vercel serverless
  module.exports = app;
} else {
  // Local development
  app.listen(PORT, () => {
    console.log(`Minimal backend running on port ${PORT}`);
  });
}
