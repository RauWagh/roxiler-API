// transactionRoutes.js

const express = require('express');
const router = express.Router();

// Define your routes
router.get('/', (req, res) => {
    res.send('Transactions list');
});

// Export the router
module.exports = router;
