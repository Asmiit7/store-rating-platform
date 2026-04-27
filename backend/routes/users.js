const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { auth, authorize } = require('../middleware/auth');
const { validateUserCreate } = require('../middleware/validate');

const router = express.Router();

// GET /api/users — List users with filters (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, email, address, role, sortBy, sortOrder } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
        CASE WHEN u.role = 'store_owner' THEN (
          SELECT COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)
          FROM ratings r
          JOIN stores s ON r.store_id = s.id
          WHERE s.owner_id = u.id
        ) ELSE NULL END as rating
      FROM users u WHERE 1=1
    `;
    const params = [];

    if (name) {
      params.push(`%${name}%`);
      query += ` AND u.name ILIKE $${params.length}`;
    }
    if (email) {
      params.push(`%${email}%`);
      query += ` AND u.email ILIKE $${params.length}`;
    }
    if (address) {
      params.push(`%${address}%`);
      query += ` AND u.address ILIKE $${params.length}`;
    }
    if (role) {
      params.push(role);
      query += ` AND u.role = $${params.length}`;
    }

    // Sorting
    const allowedSort = ['name', 'email', 'address', 'role', 'created_at'];
    const column = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY u.${column} ${order}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({ error: 'Server error fetching users.' });
  }
});

// GET /api/users/:id — Get user details (admin only)
router.get('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at
       FROM users u WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = result.rows[0];

    // If store owner, include their store rating
    if (user.role === 'store_owner') {
      const ratingResult = await pool.query(
        `SELECT COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as avg_rating
         FROM ratings r
         JOIN stores s ON r.store_id = s.id
         WHERE s.owner_id = $1`,
        [id]
      );
      user.rating = parseFloat(ratingResult.rows[0].avg_rating);
    }

    res.json(user);
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ error: 'Server error fetching user.' });
  }
});

// POST /api/users — Create user (admin only)
router.post('/', auth, authorize('admin'), validateUserCreate, async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role`,
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create user error:', err.message);
    res.status(500).json({ error: 'Server error creating user.' });
  }
});

// DELETE /api/users/:id — Delete user (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name, email', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully.', user: result.rows[0] });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ error: 'Server error deleting user.' });
  }
});

module.exports = router;
