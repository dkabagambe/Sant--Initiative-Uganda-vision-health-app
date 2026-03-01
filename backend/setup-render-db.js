const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config();

// Get the database URL from command line argument or environment
const dbUrl = process.argv[2] || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ Please provide DATABASE_URL as argument or environment variable');
  console.log('Usage: node setup-render-db.js "postgresql://user:pass@host:5432/dbname"');
  console.log('Or set DATABASE_URL environment variable');
  process.exit(1);
}

const sql = neon(dbUrl);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Render database...\n');
    
    // Read and execute the SQL setup file
    const sqlContent = fs.readFileSync('./render-db-setup.sql', 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sql`${statement}`;
          console.log('✓ Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          // Some statements might fail if they already exist, that's okay
          if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
            console.log('⚠️ Warning:', error.message);
          }
        }
      }
    }
    
    // Verify setup
    const productCount = await sql`SELECT COUNT(*) as count FROM products`;
    console.log('\n✅ Database setup completed successfully!');
    console.log(`📊 Products created: ${productCount[0].count}`);
    
    // Show sample products
    const products = await sql`SELECT name, power, price, stock_quantity FROM products ORDER BY power`;
    console.log('\n📋 Available Products:');
    products.forEach(product => {
      console.log(`  • ${product.name} - UGX ${product.price} (Stock: ${product.stock_quantity})`);
    });
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
