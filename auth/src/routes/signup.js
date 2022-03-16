const express = require("express");
const axios = require("axios")
const { body, validationResult } = require('express-validator');
const { generateVerificationCode } = require("../utils/generateVerificationCode")
const { hashUserPassword, decryptPassword } = require("../utils/passwordHashing")
const { sendMailWithSendgrid } = require("../utils/emailing")
const { upload, cloudinary } = require("../utils/imageProcessing")
const { generateAccessToken } = require("../utils/generateAccessToken");
const { authenticate } = require("../utils/authService")
const { signUpValidations } = require("../utils/signUpValidation")
const { userCreationMail } = require("../utils/userCreationEmail")
const { permissions } = require("../utils/permissions")
const db = require("../models/index")
const signupRouter = express.Router();
const AUTH_URL = process.env.AUTH_URL
const STAFF_AUTH_URL = process.env.STAFF_AUTH_URL

//SIGIN UP USER
signupRouter.post(
    '/api/v1/auth/signup',
    signUpValidations,

    async(req, res) => {
        try {

            //validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { firstName, lastName, email, phone, password } = req.body;
            let verificationCode = generateVerificationCode();

            //HAS USER PASSWORD
            let hashedPassword = await hashUserPassword(password)

            //CHECK IF USER ALREADY EXIST
            const existingUser = await db.User.findOne({ where: { email } });

            if (existingUser) {
                return res.status(400).send({ message: `Email already in use`, statuscode: 401, errors: [{ message: `Email already in use` }] });

            }
            let newUser = { firstName, lastName, phone, password: hashedPassword, verificationCode, email }
            const user = await db.User.create(newUser);

            let mailTemplateOption = {
                firstName,
                lastName,
                verificationCode
            }
            let html = await userCreationMail(mailTemplateOption)


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
                html
            };

            //SEND MAIL CONTAINING VERIFICATION CODE UPON SIGNUP
            await sendMailWithSendgrid(mailOptions)
            const payLoad = {
                user: {
                    id: user.id,
                    permissions,
                    type: "User"
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
    //authenticate,
    async(req, res) => {
        try {
            console.log(req.headers.authsource)
            console.log(req.headers.authorization)

            let authUser

            if (!req.headers.authsource) {
                return res.status(400).send({ message: `authSource header required`, statuscode: 400, errors: [{ message: `authSource header required` }] });
            }

            if (req.headers.authsource.toLowerCase() === "user") {

                const { data } = await axios.get(`${AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })

                if (!data.user) {
                    return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
                }
                authUser = data.user

            } else if (req.headers.authsource.toLowerCase() === "staff") {

                const { data } = await axios.get(`${STAFF_AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })
                if (!data.user) {
                    return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
                }
                authUser = data.user

            } else {
                return res.status(400).send({ message: `Invalid authSource in headers value, can only be staff or user`, statuscode: 400, errors: [{ message: `Invalid authSource query parameter value, can only be staff or user` }] });
            }



            const { verificationCode } = req.body;
            //validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            let id = authUser.id

            //CHECK IF VERIFICATION CODE IS CORRECT
            const existingUser = await db.User.findOne({ where: { id, verificationCode } });
            if (!existingUser) {
                return res.status(400).send({ message: `Incorect Verification Code`, statuscode: 401, errors: [{ message: `Incorect Verification Code` }] });

                // throw new BadRequestError('Incorrect Verification Code');
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

    //authenticate,
    async(req, res) => {

        try {

            let authUser

            if (!req.headers.authsource) {
                return res.status(400).send({ message: `authSource header required`, statuscode: 400, errors: [{ message: `authSource header required` }] });
            }

            if (req.headers.authsource.toLowerCase() === "user") {

                const { data } = await axios.get(`${AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })

                if (!data.user) {
                    return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
                }
                authUser = data.user

            } else if (req.headers.authsource.toLowerCase() === "staff") {

                const { data } = await axios.get(`${STAFF_AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })
                if (!data.user) {
                    return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
                }
                authUser = data.user

            } else {
                return res.status(400).send({ message: `Invalid authSource in headers value, can only be staff or user`, statuscode: 400, errors: [{ message: `Invalid authSource query parameter value, can only be staff or user` }] });
            }







            let id = authUser.id
            const existingUser = await db.User.findOne({ where: { id, } });
            if (!existingUser) {
                return res.status(400).send({ message: `Incorect Verification Code`, statuscode: 401, errors: [{ message: `Incorect Verification Code` }] });
                //throw new BadRequestError('Incorect Verification Code');
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

// //AUTHENTICATE REQUESTS
// signupRouter.get(
//     '/api/v1/auth/authenticate',
//     authenticate,
//     async(req, res) => {
//         try {
//             res.status(200).send({ user: req.user });

//         } catch (error) {
//             console.log(error)
//             res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

//         }


//     }
// );


//AUTHENTICATE REQUESTS
signupRouter.get(
    '/api/v1/auth/authenticate',
    authenticate,
    async(req, res) => {
        try {
            console.log("auth user", req.user)

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
            let authUser

            if (!req.headers.authsource) {
                return res.status(400).send({ message: `authSource header required`, statuscode: 400, errors: [{ message: `authSource header required` }] });
            }

            if (req.headers.authsource.toLowerCase() === "user") {

                const { data } = await axios.get(`${AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })

                if (!data.user) {
                    return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
                }
                authUser = data.user

            } else if (req.headers.authsource.toLowerCase() === "staff") {

                const { data } = await axios.get(`${STAFF_AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })
                if (!data.user) {
                    return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
                }
                authUser = data.user

            } else {
                return res.status(400).send({ message: `Invalid authSource in headers value, can only be staff or user`, statuscode: 400, errors: [{ message: `Invalid authSource query parameter value, can only be staff or user` }] });
            }

            const users = await db.User.findAll({ where: req.query, });
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
    //authenticate,
    async(req, res) => {
        try {
            let authUser

            if (!req.headers.authsource) {
                return res.status(400).send({ message: `authSource header required`, statuscode: 400, errors: [{ message: `authSource header required` }] });
            }

            if (req.headers.authsource.toLowerCase() === "user") {

                const { data } = await axios.get(`${AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })

                if (!data.user) {
                    return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
                }
                authUser = data.user

            } else if (req.headers.authsource.toLowerCase() === "staff") {

                const { data } = await axios.get(`${STAFF_AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })
                if (!data.user) {
                    return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
                }
                authUser = data.user

            } else {
                return res.status(400).send({ message: `Invalid authSource in headers value, can only be staff or user`, statuscode: 400, errors: [{ message: `Invalid authSource query parameter value, can only be staff or user` }] });
            }


            const { id } = req.params;
            const user = await db.User.findOne({ where: { id } });

            res.status(200).send({ message: "User Fetched", statuscode: 200, data: { user } });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }


    }
);

//GET A USER
signupRouter.patch(
    '/api/v1/auth/users/:id',
    authenticate,
    upload.fields([
        { name: "profilePix", maxCount: 1 },
        { name: "idImage", maxCount: 1 },
    ]),

    async(req, res) => {
        try {

            const { id } = req.params;
            const user = await db.User.findOne({ where: { id } });
            if (!user) {
                return res.status(404).json({ message: "User not found", statuscode: 500, errors: [{ message: "User not found" }] })

            }

            delete req.body.password
            if (req.body.profilePix) {

                await cloudinary.uploader.upload(
                    req.body.profilePix, {
                        public_id: `users/profile-pix/${user.lastName}-${user.firstName}-profile-Pix`,
                    },
                    (error, result) => {
                        if (error) {
                            console.log("Error uploading utilityBill to cloudinary");
                        } else {
                            req.body.profilePix = result.secure_url;

                        }

                    }
                );
                //upload profile pix

            }
            if (req.body.idImage) {
                //upload id pix
                await cloudinary.uploader.upload(
                    req.body.idImage, {
                        public_id: `users/idImage/${user.lastName}-${user.firstName}-idImage`,
                    },
                    (error, result) => {
                        if (error) {
                            console.log("Error uploading utilityBill to cloudinary");
                        } else {
                            req.body.idImage = result.secure_url;

                        }

                    }
                );

            }

            if (req.files) {
                if (req.files.profilePix) {

                    await cloudinary.uploader.upload(
                        req.files.profilePix[0].path, {
                            public_id: `users/profile-pix/${user.lastName}-${user.firstName}-profile-Pix`,
                        },
                        (error, result) => {
                            if (error) {
                                console.log("Error uploading utilityBill to cloudinary");
                            } else {
                                req.body.profilePix = result.secure_url;

                            }

                        }
                    );
                }

                if (req.files.idImage) {

                    await cloudinary.uploader.upload(
                        req.files.idImage[0].path, {
                            public_id: `users/idImage/${user.lastName}-${user.firstName}-idImage`,
                        },
                        (error, result) => {
                            if (error) {
                                console.log("Error uploading utilityBill to cloudinary");
                            } else {
                                req.body.idImage = result.secure_url;

                            }

                        }
                    );
                }

            }

            const updatedUser = await db.User.update(req.body, { where: { id }, returning: true, plain: true })
            res.status(200).send({ message: `User info updated`, statuscode: 200, data: { user: updatedUser[1] } });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }


    }
);

signupRouter.patch("/api/v1/auth/update-password",
    //authenticate,
    async(req, res) => {
        try {

            let authUser

            if (!req.headers.authsource) {
                return res.status(400).send({ message: `authSource header required`, statuscode: 400, errors: [{ message: `authSource header required` }] });
            }

            if (req.headers.authsource.toLowerCase() === "user") {

                const { data } = await axios.get(`${AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })

                if (!data.user) {
                    return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
                }
                authUser = data.user

            } else if (req.headers.authsource.toLowerCase() === "staff") {

                const { data } = await axios.get(`${STAFF_AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })
                if (!data.user) {
                    return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
                }
                authUser = data.user

            } else {
                return res.status(400).send({ message: `Invalid authSource in headers value, can only be staff or user`, statuscode: 400, errors: [{ message: `Invalid authSource query parameter value, can only be staff or user` }] });
            }




            const { oldPassword, newPassword, newConfirmPassword } = req.body;

            const user = await db.User.findOne({ where: { id: authUser.id } });
            console.log("user", user)
            if (!user) {
                return res.status(404).json({ message: "User not found", statuscode: 404, errors: [{ message: "User not found" }] })

            }

            // check if passwaord matches the one in the database

            let passwordIsMatch = await decryptPassword(oldPassword, user.password);
            if (!passwordIsMatch) {
                return res.status(401).json({ message: "The password you entered is incorrect", statuscode: 401, errors: [{ message: "The password you entered is incorrect" }] })
            }
            if (newPassword !== newConfirmPassword) {

                return res.status(401).json({ message: "Password do not match", statuscode: 401, errors: [{ message: "Password do not match" }] })
            }
            hashedNewPassword = await hashUserPassword(newPassword);

            const updatedUser = await db.User.update({ password: hashedNewPassword }, { where: { id: authUser.id }, returning: true, plain: true })

            //log user in by assigning him a token
            const payLoad = {
                user: {
                    id: updatedUser[1].id,
                },
            };
            let accessToken = await generateAccessToken(payLoad);
            return res.status(200).json({ message: "Password updated successsfully", statuscode: 200, data: { user: updatedUser[1], accessToken } });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: err.message || "Something went wrong" }] })
        }
    })


module.exports = { signupRouter };