const express = require("express");
const { validationResult } = require('express-validator');
const axios = require("axios")

const { staffRegistrationValidation } = require("../utils/staff-registration-validation")
const { upload, cloudinary } = require("../utils/imageProcessing")
const { sendDataToAWSQueue } = require("../utils/sendDataToQueue");
const { hashUserPassword, decryptPassword, } = require("../utils/passwordHashing")
const { generateRandomLengthPassword } = require("../utils/generateRandomPassword")
const { generateEntityId } = require("../utils/generateEntityId")
const { sendMailWithSendgrid } = require("../utils/emailing")
const { staffCreationMail } = require("../utils/staffCreationMailTamplate")
const { permissions } = require("../utils/permissions")
const db = require("../models/index")
const staffRouter = express.Router();
const AUTH_URL = process.env.AUTH_URL
const queueUrl = process.env.STAFF_CREATION_QUEUE;

//GET ALL STAFF
staffRouter.get(
    '/api/v1/staff',
    async(req, res) => {
        try {
            //authenticate user
            const { data } = await axios.get(`${AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })
                //check if user is not authenticated
            if (!data.user) {
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
            }


            //get all registered businesses
            const staff = await db.staff.findAll({ where: req.query });

            let myStaff = [];
            if (staff.length > 0) {
                for (let b of staff) {
                    delete b.dataValues.password
                    myStaff.push(b.dataValues)
                }

            }

            res.status(200).send({ message: "All staff Fetched", statuscode: 200, data: { staffs: myStaff } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }
    }
);

//REGISTER A STAFF
staffRouter.post(
    '/api/v1/staff',
    staffRegistrationValidation,
    upload.fields([
        { name: "profilePix", maxCount: 1 },

    ]),
    async(req, res) => {

        try {
            //authenticate user
            const { data } = await axios.get(`${AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })
                //check if user is not authenticated
            if (!data.user) {
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
            }



            const { firstName, lastName, email, phoneNumber, dataOfBirth, address, country, state, lga, bankName, accountName, accountNumber, role, employmentType, businessId, paymentAccount, password, businessTradingName, businessAlias, companyStaffId } = req.body


            //request body validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // initialize file upload fields
            let imageData = {
                profilePix: "",
            }

            //upload images
            //upload images in base64 string
            if (req.body.profilePix) {

                await cloudinary.uploader.upload(
                    req.body.profilePix, {
                        public_id: `staff-profile-pix/${firstName}-${lastName}`,
                    },
                    (error, result) => {


                        if (error) {
                            console.log(error)
                            console.log("Error uploading staff profile pix to cloudinary");
                        } else {
                            imageData.profilePix = result.secure_url;

                        }

                    }
                );
            }


            //upload images in  file format
            if (req.files) {
                if (req.files.profilePix) {

                    await cloudinary.uploader.upload(
                        req.files.profilePix[0].path, {
                            public_id: `staff-profile-pix/${firstName}-${lastName}`,
                        },
                        (error, result) => {


                            if (error) {
                                console.log(error)
                                console.log("Error uploading staff profile pix to cloudinary");
                            } else {
                                imageData.profilePix = result.secure_url;

                            }

                        }
                    );
                }


            }

            //hashpassword
            let tempPassword = await generateRandomLengthPassword(8) //generate password for staff to login
            let hashedPassword = await hashUserPassword(tempPassword) // has generated password


            //generate staffid
            let formattedBusinessAlias = businessAlias.toUpperCase()
            const staff = await db.staff.findAll({ where: { businessId } });
            let staffSerialNumber = generateEntityId(staff.length)
            let staffId = `${formattedBusinessAlias}${staffSerialNumber}`



            //create staff
            let createdStaff = await db.staff.create({
                firstName,
                lastName,
                email,
                phoneNumber,
                dataOfBirth,
                profilePix: imageData.profilePix,
                address,
                country,
                state,
                lga,
                bankName,
                accountName,
                accountNumber,
                role: role || "staff",
                employmentType,
                businessId,
                businessTradingName,
                businessAlias: formattedBusinessAlias,
                companyStaffId: companyStaffId || "",
                password: hashedPassword,
                staffId
            })


            let returnData = {...createdStaff.dataValues }
            delete returnData.password

            let awsQueuePayload = {
                staffId: createdStaff.id,
                userId: data.user.id,
                businessId,
                phoneNumber,
                name: `${firstName} ${lastName}`,
                email: email,
                walletCategory: "staff"
            }
            console.log("queue payload", awsQueuePayload)
            let queueResponse = await sendDataToAWSQueue(awsQueuePayload, queueUrl)


            //send staff login details
            let msg = `Dear ${firstName} ${lastName}, 
            You have been registered on linx platform by ${businessTradingName} . Please use the following details
            staffId:${staffId},
            company Alias: ${businessAlias},
            password: ${tempPassword}
            to login into your account.
            Please change your password after you login
            Thank you.`

            let mailTemplateOptions = {
                firstName,
                lastName,
                employmentType,
                role,
                businessTradingName,
                businessAlias,
                password: tempPassword
            }
            let html = await staffCreationMail(mailTemplateOptions)

            //user.password = undefined;
            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: email,
                subject: `${businessTradingName} Staff Registration`,
                text: msg,
                html
            };

            await sendMailWithSendgrid(mailOptions)


            res.status(201).send({ message: "Staff Created", statuscode: 201, type: "success", data: { staff: returnData } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }

    }
);




//GET  STAFF FOR BUSINESS
staffRouter.get(
    '/api/v1/staff/business/:businessId',

    async(req, res) => {
        //authenticate user
        try {
            const { data } = await axios.get(`${AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })
                //check if user is not authenticated
            if (!data.user) {
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
            }

            const { businessId } = req.params;
            const staff = await db.staff.findAll({ where: { businessId } });
            let myStaff = [];
            if (staff.length > 0) {
                for (let b of staff) {
                    b.dataValues.wallet = 0.00
                    delete b.dataValues.password
                    myStaff.push(b.dataValues)
                }

            }


            res.status(200).send({ message: `${myStaff.length?"Staff fetched":"You do not currently have any staff"}`, statuscode: 200, data: { myStaff } });

        } catch (error) {
            console.log(error)

        }

    }
);

//GET A STAFF
staffRouter.get(
    '/api/v1/staff/:staffId',
    async(req, res) => {

        try {
            //authenticate user
            const { data } = await axios.get(`${AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })
                //check if user is not authenticated
            if (!data.user) {
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
            }

            const { staffId } = req.params;


            const foundStaff = await db.staff.findOne({ where: { id: staffId } });

            res.status(200).send({ message: `Staff fetched`, statuscode: 200, data: { staff: foundStaff } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }

    }
);


//UPDATE STAFF DETAILS
staffRouter.patch(
    '/api/v1/staff/:staffId',
    upload.fields([
        { name: "profilePix", maxCount: 1 },

    ]),
    async(req, res) => {

        try {
            //authenticate user
            const { data } = await axios.get(`${AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })
                //check if user is not authenticated
            if (!data.user) {
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
            }

            const { staffId } = req.params;
            if (req.body.profilePix) {

                await cloudinary.uploader.upload(
                    req.body.profilePix, {
                        public_id: `staff-profile-pix/${firstName}-${lastName}`,
                    },
                    (error, result) => {


                        if (error) {
                            console.log(error)
                            console.log("Error uploading staff profile pix to cloudinary");
                        } else {
                            req.body.profilePix = result.secure_url;

                        }

                    }
                );
            }


            //upload images in  file format
            if (req.files) {
                if (req.files.profilePix) {

                    await cloudinary.uploader.upload(
                        req.files.profilePix[0].path, {
                            public_id: `staff-profile-pix/${firstName}-${lastName}`,
                        },
                        (error, result) => {


                            if (error) {
                                console.log(error)
                                console.log("Error uploading staff profile pix to cloudinary");
                            } else {
                                req.body.profilePix = result.secure_url;

                            }

                        }
                    );
                }


            }

            const updatedStaff = await db.staff.update(req.body, { where: { id: staffId }, returning: true, plain: true })

            res.status(200).send({ message: `Staff info updated`, statuscode: 200, data: { staff: updatedStaff[1] } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }


    }
);

//STAFF LOGIN
staffRouter.post(
    '/api/v1/staff/login',
    async(req, res) => {

        try {
            //authenticate user
            const { data } = await axios.get(`${AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })
                //check if user is not authenticated
            if (!data.user) {
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
            }

            const { staffId } = req.params;

            const updatedStaff = await db.staff.update(req.body, { where: { id: staffId }, returning: true, plain: true })

            res.status(200).send({ message: `Staff info updated`, statuscode: 200, data: { staff: updatedStaff[1] } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }


    }
);

//STAFF CHANGE PASSWORD
staffRouter.patch("/api/v1/auth/update-password",
    authenticate,
    async(req, res) => {
        try {
            const { oldPassword, newPassword, newConfirmPassword } = req.body;
            console.log("request body", req.body)

            console.log("req.user.id", req.user.id)
                //get the user from the user collection
            const staff = await db.staff.findOne({ where: { id: req.user.id } });
            console.log("user", user)
            if (!staff) {
                return res.status(404).json({ message: "Staff not found", statuscode: 404, errors: [{ message: "Staff not found" }] })

            }

            // check if passwaord matches the one in the database

            let passwordIsMatch = await decryptPassword(oldPassword, staff.password);
            if (!passwordIsMatch) {
                return res.status(401).json({ message: "The password you entered is incorrect", statuscode: 401, errors: [{ message: "The password you entered is incorrect" }] })
            }
            if (newPassword !== newConfirmPassword) {

                return res.status(401).json({ message: "Password do not match", statuscode: 401, errors: [{ message: "Password do not match" }] })
            }
            hashedNewPassword = await hashUserPassword(newPassword);

            const updatedStaff = await db.staff.update({ password: hashedNewPassword }, { where: { id: req.user.id }, returning: true, plain: true })

            //log user in by assigning him a token
            const payLoad = {
                user: {
                    id: updatedStaff[1].id,
                },
            };
            let accessToken = await generateAccessToken(payLoad);
            return res.status(200).json({ message: "Password updated successsfully", statuscode: 200, data: { user: updatedStaff[1], accessToken } });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: err.message || "Something went wrong" }] })
        }
    })


//STAFF RESET PASSWORD
staffRouter.post(
    '/api/v1/staff/reset-password',
    async(req, res) => {

        try {
            //authenticate user
            const { data } = await axios.get(`${AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })
                //check if user is not authenticated
            if (!data.user) {
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
            }

            const { staffId } = req.params;

            const updatedStaff = await db.staff.update(req.body, { where: { id: staffId }, returning: true, plain: true })

            res.status(200).send({ message: `Staff info updated`, statuscode: 200, data: { staff: updatedStaff[1] } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }


    }
);

//create role
staffRouter.post("/api/v1/staff/roles/:businessId", async(req, res) => {
    const { businessId } = req.params



})

//DELETE STAFF
staffRouter.delete(
    '/api/v1/staff/:staffId',
    async(req, res) => {

        try {
            //authenticate user
            const { data } = await axios.get(`${AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })
                //check if user is not authenticated
            if (!data.user) {
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
            }

            const { staffId } = req.params

            await db.staff.destroy({ where: { staffId } });

            res.status(204).send({ message: "Staff deleted", statuscode: 204, data: { staff: {} } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }

    }
);

staffRouter.get("/api/v1/staff/roles-permissions/:businessId", async(req, res) => {
    try {
        const { businessId } = req.params

        let roles = await db.roles.findAll({ where: { businessId } })

        res.status(200).send({ message: `All roles permissions`, statuscode: 200, data: { roles, permissions } });

    } catch (error) {

    }


})


module.exports = { staffRouter };