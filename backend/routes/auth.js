const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
const { validateSignup, validatePasswordUpdate } = require('../middleware/validate');

const router = express.Router();

// POST /api/auth/signup — Register normal user
router.post('/signup', validateSignup, async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role) 
       VALUES ($1, $2, $3, $4, 'user') RETURNING id, name, email, role`,
      [name, email, hashedPassword, address]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// POST /api/auth/login — Login (all roles)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// PUT /api/auth/password — Update password (authenticated)
router.put('/password', auth, validatePasswordUpdate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const validPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, req.user.id]);

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Password update error:', err.message);
    res.status(500).json({ error: 'Server error during password update.' });
  }
});

// POST /api/auth/forgot-password — Reset password (verify by email + address)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, address, newPassword } = req.body;

    if (!email || !address || !newPassword) {
      return res.status(400).json({ error: 'Email, address, and new password are required.' });
    }

    // Validate new password
    if (newPassword.length < 8 || newPassword.length > 16) {
      return res.status(400).json({ error: 'Password must be 8-16 characters.' });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter.' });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one special character.' });
    }

    // Find user by email and verify address matches
    const result = await pool.query('SELECT id, address FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with that email.' });
    }

    const user = result.rows[0];
    if (!user.address || user.address.toLowerCase().trim() !== address.toLowerCase().trim()) {
      return res.status(401).json({ error: 'Address does not match our records.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, user.id]);

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ error: 'Server error during password reset.' });
  }
});

// DELETE /api/auth/account — Delete own account (any authenticated user)
router.delete('/account', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    console.error('Delete account error:', err.message);
    res.status(500).json({ error: 'Server error deleting account.' });
  }
});

module.exports = router;
