// Simple database seeding script using existing db connection
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('🚀 Seeding database with sample data...\n');
    
    // Use the existing database connection
    const { sql } = require('./src/db');
    
    // Check if products already exist
    const existingProducts = await sql`SELECT COUNT(*) as count FROM products`;
    console.log(`📊 Current products: ${existingProducts[0].count}`);
    
    if (parseInt(existingProducts[0].count) === 0) {
      // Insert sample products
      await sql`
        INSERT INTO products (name, description, power, price, stock_quantity, stock_standard, stock_metal, stock_fashion) VALUES
        ('Reading Glasses +1.00', 'Low power for early presbyopia', '+1.00', 15000.00, 78, 30, 28, 20),
        ('Reading Glasses +1.50', 'For mild difficulty with near vision', '+1.50', 15000.00, 95, 40, 35, 20),
        ('Reading Glasses +2.00', 'Standard reading glasses', '+2.00', 15000.00, 142, 60, 52, 30),
        ('Reading Glasses +2.50', 'For moderate presbyopia', '+2.50', 15000.00, 87, 35, 32, 20),
        ('Reading Glasses +3.00', 'High power for advanced presbyopia', '+3.00', 15000.00, 64, 25, 24, 15),
        ('Reading Glasses +3.50', 'Very high power for severe presbyopia', '+3.50', 18000.00, 42, 18, 14, 10)
      `;
      console.log('✅ Sample products inserted successfully!');
      
      // Show the products
      const products = await sql`SELECT name, power, price, stock_quantity FROM products ORDER BY power`;
      console.log('\n📋 Available Products:');
      products.forEach(product => {
        console.log(`  • ${product.name} - UGX ${product.price} (Stock: ${product.stock_quantity})`);
      });
    } else {
      console.log('✅ Products already exist in database');
      
      // Show existing products
      const products = await sql`SELECT name, power, price, stock_quantity FROM products ORDER BY power`;
      console.log('\n📋 Existing Products:');
      products.forEach(product => {
        console.log(`  • ${product.name} - UGX ${product.price} (Stock: ${product.stock_quantity})`);
      });
    }
    
    // Check other tables
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`\n📊 Users: ${userCount[0].count}`);
    
    const screeningCount = await sql`SELECT COUNT(*) as count FROM screenings`;
    console.log(`📊 Screenings: ${screeningCount[0].count}`);
    
    console.log('\n✅ Database seeding completed!');
    
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error.message);
    console.error('Full error:', error);
  }
}

seedDatabase();
