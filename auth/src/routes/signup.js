const express = require("express");
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const { validateRequest, BadRequestError } = require("@bc_tickets/common");
const { generateVerificationCode } = require("../utils/generateVerificationCode")
const { hashUserPassword, decryptPassword } = require("../utils/passwordHashing")
const { sendMailWithSendgrid, sendWithMailTrap, sendEmailWithMailgun } = require("../utils/emailing")
const { generateAccessToken } = require("../utils/generateAccessToken");
const { authenticate } = require("../utils/authService")
const db = require("../models/index")
const signupRouter = express.Router();


signupRouter.post(
    '/api/v1/auth/signup', [
        body('firstName').notEmpty().withMessage('Firstname cannot be empty'),
        body('lastName').notEmpty().withMessage('Lastname cannot be empty'),
        body('email').isEmail().withMessage('Email must be valid'),
        body('phone').notEmpty().withMessage('Phone number cannot be empty'),
        body('password')
        .trim()
        .isLength({ min: 8, max: 20 })
        .withMessage('Password must be between 8 and 20 characters'),
    ],
    validateRequest,
    async(req, res) => {
        const { firstName, lastName, email, phone, password } = req.body;
        let verificationCode = generateVerificationCode();
        let hashedPassword = await hashUserPassword(password)
        const existingUser = await db.User.findOne({ where: { email } });

        if (existingUser) {
            throw new BadRequestError('Email already in use');
        }
        let newUser = { firstName, lastName, phone, password: hashedPassword, verificationCode, email }

        const user = await db.User.create(newUser);
        console.log(user)
        user.password = undefined;
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: `LinX Account`,
            text: `Dear, ${user.firstName} your account with LinX was created successfull, Please use the code:${user.verificationCode} to verify your account`,
        };
        //await sendMailWithSendgrid(mailOptions)
        await sendMailWithSendgrid(mailOptions)
        const payLoad = {
            user: {
                id: user.id,
            },
        };
        const accessToken = await generateAccessToken(payLoad)
        res.cookie("accessToken", accessToken, {
            expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), //expires in 2days
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https', //used only in production
        });
        res.status(201).send({ message: "User created", statuscode: 201, type: "success", data: { user, accessToken } });
    }
);

signupRouter.post(
    '/api/v1/auth/verify', [
        body('verificationCode').notEmpty().withMessage('Verification code cannot be empty'),
    ],
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
signupRouter.post(
    '/api/v1/auth/verify/resend',
    validateRequest,
    authenticate,
    async(req, res) => {

        let id = req.user.id
        const existingUser = await db.User.findOne({ where: { id, } });
        if (!existingUser) {
            throw new BadRequestError('Incorect Verification Code');
        }
        let verificationCode = generateVerificationCode()

        const updatedUser = await db.User.update({ verificationCode }, { where: { id, verificationCode } })
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: existingUser.email,
            subject: `LinX Account`,
            text: `Dear ${existingUser.firstName}, 
            Your LinX account has been created successfully. Please use the following code:
            ${verificationCode} to verify your account.
            Thank you.`,
        };
        existingUser.verificationCode = verificationCode

        await sendWithMailTrap(mailOptions)
        existingUser.password = undefined
        res.status(200).send({ message: "Verification code resent", statuscode: 200, data: { user: existingUser, verificationCode } });
    }
);

signupRouter.post(
    '/api/v1/auth/signin', [body('email').isEmail().withMessage('Email must be valid'), body('password').notEmpty().withMessage('Password cannot be empty'), ],
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

        let accessToken = await generateAccessToken(payLoad);

        res.status(200).send({ user: existingUser, accessToken });
    }
);

module.exports = { signupRouter };