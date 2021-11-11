const express = require('express');
const { currentUser } = require('@bc_tickets/common');

const currentUserRouter = express.Router();

currentUserRouter.get('/api/vi/auth/currentuser', currentUser, (req, res) => {
    res.send({ currentUser: req.currentUser || null });
});

module.exports = { currentUserRouter };