const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const { validateRequest, BadRequestError } = require('@bc_tickets/common');
const { hashUserPassword, decryptPassword } = require("../utils/passwordHashing")
const { generateAccessToken } = require("../utils/generateAccessToken");
const { sendMailWithSendgrid, sendWithMailTrap, sendEmailWithMailgun } = require("../utils/emailing")
const { generateVerificationCode } = require("../utils/generateVerificationCode")
const db = require("../models/index")
const signinRouter = express.Router();

//SIGIN IN USER
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
            //CHECK IF USER EXIST
        const existingUser = await db.User.findOne({ where: { email } });
        if (!existingUser) {
            throw new BadRequestError('Invalid user credentials')
        }

        //COMPARE ENTERED PASSWORD WITH HASHED PASSWORD
        if (!(await decryptPassword(password, existingUser.password))) {
            throw new BadRequestError('Invalid user credentials');
        }

        //JWT PAYLOAD FOR SIGINED IN USER
        const payLoad = {
            user: {
                id: existingUser.id,
            },
        };


        let verificationCode
        if (existingUser.isVerified) {
            verificationCode = existingUser.verificationCode
        } else {
            //REGENERATE VERIFICATION TOKEN ON SIGIN IF USER IS NOT VERIFIED
            verificationCode = generateVerificationCode()
            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: existingUser.email,
                subject: `LinX Account`,
                text: `Dear, ${existingUser.firstName} your account with LinX has not been verified, Please use the code:${verificationCode} to verify you account`,
            };
            const updatedUser = await db.User.update({ verificationCode }, { where: { id: existingUser.id }, returning: true, plain: true })

            //SEND EMAIL CONTAINING VERIFICATION CODE TO USER
            await sendMailWithSendgrid(mailOptions)
        }
        existingUser.password = undefined

        existingUser.verificationCode = verificationCode
        let accessToken = await generateAccessToken(payLoad);
        res.status(200).send({ message: "Signin successful", statuscode: 200, data: { user: existingUser, accessToken, verificationCode } });
    }
);

module.exports = { signinRouter };