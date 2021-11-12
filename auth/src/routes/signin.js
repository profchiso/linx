const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const { validateRequest, BadRequestError } = require('@bc_tickets/common');
const { hashUserPassword, decryptPassword } = require("../utils/passwordHashing")
const { generateAccessToken } = require("../utils/generateAccessToken");
const { sendMailWithSendgrid, sendWithMailTrap } = require("../utils/emailing")
const { generateVerificationCode } = require("../utils/generateVerificationCode")
const db = require("../models/index")
const signinRouter = express.Router();

signinRouter.post(
    '/api/v1/auth/signin', [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password')
        .trim()
        .notEmpty()
        .withMessage('You must supply a password'),
    ],
    validateRequest,
    async(req, res) => {
        const { email, password, alias } = req.body
        const existingUser = await db.User.findOne({ where: { email } });
        if (!existingUser) {
            throw new BadRequestError('Invalid user credentials')
        }

        if (!(await decryptPassword(password, existingUser.password))) {
            throw new BadRequestError('Invalid user credentials');
        }
        const payLoad = {
            user: {
                id: existingUser.id,
            },
        };
        let verificationCode
        if (existingUser.isVerified) {
            verificationCode = existingUser.verificationCode
        } else {
            verificationCode = generateVerificationCode()
            const mailOptions = {
                from: 'olaludesunkanmi@yahoo.com',
                to: existingUser.email,
                subject: `LinX Account`,
                text: `Dear, ${existingUser.firstName} your has not been verified, Please use the code:${verificationCode} to verify you account`,
            };
            await sendWithMailTrap(mailOptions)
        }

        existingUser.password = undefined
            //existingUser.verificationCode = undefined
        let accessToken = await generateAccessToken(payLoad);
        res.status(200).send({ message: "Signin successful", statuscode: 200, data: { user: existingUser, accessToken, verificationCode } });
    }
);

module.exports = { signinRouter };