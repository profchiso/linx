const express = require("express");
const { body } = require('express-validator');
const db = require("../models/index")
const businessRouter = express.Router();


businessRouter.get(
    '/api/v1/business',
    validateRequest,
    authenticate,
    async(req, res) => {
        res.status(201).send({ message: "Business Created", statuscode: 201, type: "success", data: { user, accessToken } });
    }
);

businessRouter.post(
    '/api/v1/business/:userId',
    validateRequest,
    authenticate,
    async(req, res) => {
        const { verificationCode } = req.body;

        let id = req.user.id

        const existingUser = await db.User.findOne({ where: { id, verificationCode } });
        if (!existingUser) {
            throw new BadRequestError('Incorrect Verification Code');
        }
        const updatedUser = await db.User.update({ isVerified: true }, { where: { id, verificationCode } })
        existingUser.password = undefined
        existingUser.verificationCode = verificationCode

        res.status(200).send({ message: "User verified", statuscode: 200, data: { user: existingUser } });
    }
);
businessRouter.patch(
    '/api/v1/business/:businessId',
    validateRequest,
    authenticate,
    async(req, res) => {

        res.status(200).send({ message: "Verification code resent", statuscode: 200, data: { user: existingUser, verificationCode } });
    }
);


module.exports = { businessRouter };