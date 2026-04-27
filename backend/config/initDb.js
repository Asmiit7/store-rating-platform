const pool = require('./db');
const bcrypt = require('bcryptjs');

const initDb = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        address VARCHAR(400),
        role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'store_owner')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table ready');

    // Create stores table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        address VARCHAR(400),
        owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Stores table ready');

    // Create ratings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, store_id)
      );
    `);
    console.log('✅ Ratings table ready');

    // Seed a default admin if none exists
    const adminCheck = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@1234', 10);
      await pool.query(
        `INSERT INTO users (name, email, password_hash, address, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        ['System Administrator User', 'admin@storerating.com', hashedPassword, '123 Admin Street, City', 'admin']
      );
      console.log('✅ Default admin created (admin@storerating.com / Admin@1234)');
    }

    console.log('🚀 Database initialization complete');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    throw err;
  }
};

module.exports = initDb;
