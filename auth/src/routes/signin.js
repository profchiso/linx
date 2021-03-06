const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require("axios")
const { validateRequest, BadRequestError } = require('@bc_tickets/common');
const { hashUserPassword, decryptPassword } = require("../utils/passwordHashing")
const { generateAccessToken } = require("../utils/generateAccessToken");
const { sendMailWithSendgrid, sendWithMailTrap, sendEmailWithMailgun } = require("../utils/emailing")
const { generateVerificationCode } = require("../utils/generateVerificationCode")
const { permissions } = require("../utils/permissions")
const db = require("../models/index")
const signinRouter = express.Router();

const BUSINESS_SERVICE_URL = process.env.BUSINESS_SERVICE_URL
const AUTH_URL = process.env.AUTH_URL
const STAFF_AUTH_URL = process.env.STAFF_AUTH_URL

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

        try {
            const { email, password, alias } = req.body

            //validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }



            //CHECK IF USER EXIST
            const existingUser = await db.User.findOne({ where: { email } });
            if (!existingUser) {
                return res.status(400).send({ message: `Invalid user credentials`, statuscode: 401, errors: [{ message: `Invalid user credentials` }] });
            }

            //COMPARE ENTERED PASSWORD WITH HASHED PASSWORD
            if (!(await decryptPassword(password, existingUser.password))) {
                return res.status(400).send({ message: `Invalid user credentials`, statuscode: 401, errors: [{ message: `Invalid user credentials` }] });

            }

            //JWT PAYLOAD FOR SIGINED IN USER
            const payLoad = {
                user: {
                    id: existingUser.id,
                    permissions,
                    type: "User"
                },
            };

            let accessToken = await generateAccessToken(payLoad);
            let verificationCode
            let myBusinesses = []
            if (existingUser.isVerified) {
                verificationCode = existingUser.verificationCode

                //get associated businesses
                let { data } = await axios.get(`${BUSINESS_SERVICE_URL}/my-businesses/${existingUser.id}`, {
                    headers: {
                        authorization: `Bearer ${accessToken}`,
                        authsource: "user"
                    }
                })
                console.log("data", data)
                myBusinesses = data.data.myBusinesses
                console.log("my businesses", myBusinesses)
            } else {
                //REGENERATE VERIFICATION TOKEN ON SIGIN IF USER IS NOT VERIFIED
                verificationCode = generateVerificationCode()
                const mailOptions = {
                    from: process.env.SENDER_EMAIL,
                    to: existingUser.email,
                    subject: `LinX Account`,
                    text: `Dear, ${existingUser.firstName} your account with LinX has not been verified, Please use the code:${verificationCode} to verify your LinX account`,
                };
                const updatedUser = await db.User.update({ verificationCode }, { where: { id: existingUser.id }, returning: true, plain: true })

                //SEND EMAIL CONTAINING VERIFICATION CODE TO USER
                await sendMailWithSendgrid(mailOptions)
            }
            existingUser.password = undefined

            existingUser.verificationCode = verificationCode

            res.status(200).send({ message: "Signin successful", statuscode: 200, data: { user: existingUser, accessToken, verificationCode, myBusinesses } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }

    }
);

module.exports = { signinRouter };