const express = require("express")

const signoutRouter = express.Router();

signoutRouter.post('/api/v1/auth/signout', (req, res) => {
    req.session = null;

    res.send({});
});

module.exports = { signoutRouter };