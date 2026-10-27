const express = require('express');
const { generateToken, verifyToken } = require('../utils/jwt');
const { getUserByUsername } = require('../utils/db');
const asyncHandler = require('../utils/asyncHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Login endpoint
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = await getUserByUsername(username);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user.id, user.username, user.role);
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email
    }
  });
}));

// Verify token endpoint
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    user: req.user,
    valid: true
  });
});

module.exports = router;
