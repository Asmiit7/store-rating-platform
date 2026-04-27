const express = require('express');
const cors = require('cors');
require('dotenv').config();

const initDb = require('./config/initDb');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/stores');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize DB and start server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
