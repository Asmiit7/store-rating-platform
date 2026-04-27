const express = require('express');
const pool = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/admin — Admin dashboard stats
router.get('/admin', auth, authorize('admin'), async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const storesCount = await pool.query('SELECT COUNT(*) FROM stores');
    const ratingsCount = await pool.query('SELECT COUNT(*) FROM ratings');

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalStores: parseInt(storesCount.rows[0].count),
      totalRatings: parseInt(ratingsCount.rows[0].count),
    });
  } catch (err) {
    console.error('Admin dashboard error:', err.message);
    res.status(500).json({ error: 'Server error fetching dashboard.' });
  }
});

// GET /api/dashboard/store-owner — Store owner dashboard
router.get('/store-owner', auth, authorize('store_owner'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get stores owned by this user
    const stores = await pool.query(
      `SELECT s.id, s.name, s.email, s.address,
              COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as avg_rating,
              COUNT(r.id) as total_ratings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1
       GROUP BY s.id
       ORDER BY s.name`,
      [userId]
    );

    res.json({ stores: stores.rows });
  } catch (err) {
    console.error('Store owner dashboard error:', err.message);
    res.status(500).json({ error: 'Server error fetching dashboard.' });
  }
});

module.exports = router;
