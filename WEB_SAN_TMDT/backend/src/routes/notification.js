const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get notifications
router.get('/', authenticateToken, async (req, res) => {
  res.json({ success: true, message: 'Notifications placeholder' });
});

module.exports = router;
