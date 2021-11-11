const express = require('express');
const { currentUser } = require('@bc_tickets/common');
const { authenticate } = require("../utils/authService")

const currentUserRouter = express.Router();

currentUserRouter.get('/api/vi/auth/currentuser', currentUser, authenticate, async(req, res) => {
    res.status(200).send({ message: "User fetched", statuscode: 200, data: { user: req.user || null } });
});

module.exports = { currentUserRouter };