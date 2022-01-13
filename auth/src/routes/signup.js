const express = require("express");
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const { validateRequest, BadRequestError } = require("@bc_tickets/common");
const { generateVerificationCode } = require("../utils/generateVerificationCode")
const { hashUserPassword, decryptPassword } = require("../utils/passwordHashing")
const { sendMailWithSendgrid, sendWithMailTrap, sendEmailWithMailgun } = require("../utils/emailing")
const { generateAccessToken } = require("../utils/generateAccessToken");
const { authenticate } = require("../utils/authService")
const { signUpValidations } = require("../utils/signUpValidation")
const db = require("../models/index")
const signupRouter = express.Router();

//SIGIN UP USER
signupRouter.post(
    '/api/v1/auth/signup',
    signUpValidations,
    validateRequest,
    async(req, res) => {
        try {
            const { firstName, lastName, email, phone, password } = req.body;
            let verificationCode = generateVerificationCode();

            //HAS USER PASSWORD
            let hashedPassword = await hashUserPassword(password)

            //CHECK IF USER ALREADY EXIST
            const existingUser = await db.User.findOne({ where: { email } });

            if (existingUser) {
                throw new BadRequestError('Email already in use');
            }
            let newUser = { firstName, lastName, phone, password: hashedPassword, verificationCode, email }
            const user = await db.User.create(newUser);


            let msg = `${user.firstName}, 
        Your LinX account has been created successfully. Please use the following code:
        ${user.verificationCode} to verify your account.
        Thank you.`

            user.password = undefined;
            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: user.email,
                subject: `LinX Account`,
                text: msg,
            };

            //SEND MAIL CONTAINING VERIFICATION CODE UPON SIGNUP
            await sendMailWithSendgrid(mailOptions)
            const payLoad = {
                user: {
                    id: user.id,
                },
            };

            //GENERATE ACCESS TOKEN
            const accessToken = await generateAccessToken(payLoad)
            res.cookie("accessToken", accessToken, {
                expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), //expires in 2days
                httpOnly: true,
                secure: req.secure || req.headers['x-forwarded-proto'] === 'https', //used only in production
            });
            res.status(201).send({ message: "User created", statuscode: 201, type: "success", data: { user, accessToken } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })


        }

    }
);


//VERIFY USER ACCOUNT
signupRouter.post(
    '/api/v1/auth/verify', [
        body('verificationCode').notEmpty().withMessage('Verification code cannot be empty'),
    ],
    validateRequest,
    authenticate,
    async(req, res) => {
        try {
            const { verificationCode } = req.body;

            let id = req.user.id

            //CHECK IF VERIFICATION CODE IS CORRECT
            const existingUser = await db.User.findOne({ where: { id, verificationCode } });
            if (!existingUser) {
                throw new BadRequestError('Incorrect Verification Code');
            }

            //UPDATE VERIFICATION STATUS TO TRUE
            const updatedUser = await db.User.update({ isVerified: true }, { where: { id, verificationCode }, returning: true, plain: true })
            existingUser.password = undefined
            updatedUser.password = undefined
            existingUser.verificationCode = verificationCode

            res.status(200).send({ message: "User verified", statuscode: 200, data: { user: updatedUser } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }

    }
);

//RESEND VERIFICATION CODE
signupRouter.post(
    '/api/v1/auth/verify/resend',
    validateRequest,
    authenticate,
    async(req, res) => {

        try {
            let id = req.user.id
            const existingUser = await db.User.findOne({ where: { id, } });
            if (!existingUser) {
                throw new BadRequestError('Incorect Verification Code');
            }

            let verificationCode = generateVerificationCode()

            const updatedUser = await db.User.update({ verificationCode }, { where: { id }, returning: true, plain: true })

            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: existingUser.email,
                subject: `LinX Account`,
                text: `Dear ${existingUser.firstName}, 
             Please use the following code:
            ${verificationCode} to verify your LinX account.
            Thank you.`,
            };
            existingUser.verificationCode = verificationCode

            let userData = {...updatedUser[1].dataValues }

            userData.password = undefined

            await sendMailWithSendgrid(mailOptions)
            existingUser.password = undefined
            res.status(200).send({ message: "Verification code resent", statuscode: 200, data: { user: userData, verificationCode } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }
    }
);

//AUTHENTICATE REQUESTS
signupRouter.get(
    '/api/v1/auth/authenticate',
    authenticate,
    async(req, res) => {
        try {
            res.status(200).send({ user: req.user });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }


    }
);


//AUTHENTICATE REQUESTS
signupRouter.get(
    '/api/v1/auth/authenticate',
    authenticate,
    async(req, res) => {
        try {
            res.status(200).send({ user: req.user });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }


    }
);

//GET ALL USERS
signupRouter.get(
    '/api/v1/auth/users',

    async(req, res) => {
        try {
            const users = await db.User.findAll({});
            res.status(200).send({ message: "Users Fetched", statuscode: 200, data: { users } });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }


    }
);

//GET A USER
signupRouter.get(
    '/api/v1/auth/users/:id',

    async(req, res) => {
        try {

            const { id } = req.params;
            const user = await db.User.findOne({ where: { id } });
            console.log(user)
            res.status(200).send({ message: "User Fetched", statuscode: 200, data: { user } });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }


    }
);


module.exports = { signupRouter };