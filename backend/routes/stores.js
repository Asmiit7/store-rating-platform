const express = require('express');
const pool = require('../config/db');
const { auth, authorize } = require('../middleware/auth');
const { validateStoreCreate } = require('../middleware/validate');

const router = express.Router();

// GET /api/stores — List stores with search/filter
router.get('/', auth, async (req, res) => {
  try {
    const { name, address, sortBy, sortOrder } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as overall_rating,
        COUNT(r.id) as total_ratings
    `;

    // If user role, include their submitted rating
    if (req.user.role === 'user') {
      query += `,
        (SELECT rating FROM ratings WHERE user_id = $1 AND store_id = s.id) as user_rating,
        (SELECT id FROM ratings WHERE user_id = $1 AND store_id = s.id) as user_rating_id
      `;
    }

    query += `
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;

    const params = req.user.role === 'user' ? [userId] : [];

    if (name) {
      params.push(`%${name}%`);
      query += ` AND s.name ILIKE $${params.length}`;
    }
    if (address) {
      params.push(`%${address}%`);
      query += ` AND s.address ILIKE $${params.length}`;
    }

    query += ' GROUP BY s.id';

    // Sorting
    const allowedSort = ['name', 'email', 'address', 'overall_rating'];
    const column = allowedSort.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    if (sortBy === 'overall_rating') {
      query += ` ORDER BY overall_rating ${order}`;
    } else {
      query += ` ORDER BY s.${column} ${order}`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get stores error:', err.message);
    res.status(500).json({ error: 'Server error fetching stores.' });
  }
});

// POST /api/stores — Create store (admin only)
router.post('/', auth, authorize('admin'), validateStoreCreate, async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Check if store email already exists
    const existing = await pool.query('SELECT id FROM stores WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Store email already registered.' });
    }

    // If ownerId provided, verify user is a store_owner
    if (ownerId) {
      const owner = await pool.query("SELECT id FROM users WHERE id = $1 AND role = 'store_owner'", [ownerId]);
      if (owner.rows.length === 0) {
        return res.status(400).json({ error: 'Owner must be a user with store_owner role.' });
      }
    }

    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, address, ownerId || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create store error:', err.message);
    res.status(500).json({ error: 'Server error creating store.' });
  }
});

// GET /api/stores/:id — Get store details
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT s.*, 
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as overall_rating,
        COUNT(r.id) as total_ratings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get store error:', err.message);
    res.status(500).json({ error: 'Server error fetching store.' });
  }
});

// GET /api/stores/:id/ratings — Get ratings for a store (store owner or admin)
router.get('/:id/ratings', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // If store owner, verify they own this store
    if (req.user.role === 'store_owner') {
      const storeCheck = await pool.query(
        'SELECT id FROM stores WHERE id = $1 AND owner_id = $2',
        [id, req.user.id]
      );
      if (storeCheck.rows.length === 0) {
        return res.status(403).json({ error: 'You do not own this store.' });
      }
    }

    const result = await pool.query(
      `SELECT r.id, r.rating, r.created_at, r.updated_at,
              u.name as user_name, u.email as user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get store ratings error:', err.message);
    res.status(500).json({ error: 'Server error fetching ratings.' });
  }
});

// POST /api/stores/:id/rate — Submit or update rating (normal user)
router.post('/:id/rate', auth, authorize('user'), async (req, res) => {
  try {
    const storeId = req.params.id;
    const userId = req.user.id;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    // Check if store exists
    const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    // Upsert: insert or update
    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET rating = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, storeId, rating]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Rate store error:', err.message);
    res.status(500).json({ error: 'Server error submitting rating.' });
  }
});

module.exports = router;
