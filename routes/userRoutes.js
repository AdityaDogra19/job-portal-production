const express = require('express');
const router = express.Router();
const { updateOpenToWork } = require('../controllers/userController');
const { checkAuth } = require('../middlewares/authMiddleware');

// @route   PUT /api/users/open-to-work
router.put('/open-to-work', checkAuth, updateOpenToWork);

module.exports = router;
