const express = require("express");
const { validationResult } = require('express-validator');
const axios = require("axios")

const { staffRegistrationValidation } = require("../utils/staff-registration-validation")
const { upload, cloudinary } = require("../utils/imageProcessing")
const { sendDataToAWSQueue } = require("../utils/sendDataToQueue");
const { hashUserPassword, decryptPassword, } = require("../utils/passwordHashing")
const { generateAccessToken } = require("../utils/generateAccessToken")
const { generateRandomLengthPassword } = require("../utils/generateRandomPassword")
const { generateEntityId } = require("../utils/generateEntityId")
const { sendMailWithSendgrid } = require("../utils/emailing")
const { staffCreationMail } = require("../utils/staffCreationMailTamplate")
const { permissions } = require("../utils/permissions")
const { authenticate } = require("../utils/authService")
const db = require("../models/index")
const staffRouter = express.Router();
const AUTH_URL = process.env.AUTH_URL
const STAFF_AUTH_URL = process.env.STAFF_AUTH_URL
const BUSINESS_SERVICE_URL = process.env.BUSINESS_SERVICE_URL
const queueUrl = process.env.STAFF_CREATION_QUEUE;

//GET ALL STAFF
staffRouter.get(
    '/api/v1/staff',
    async(req, res) => {
        try {
            //authenticate user

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

            //get all registered businesses
            const staff = await db.staff.findAll({ where: req.query, include: ["role"] });

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
            console.log(authUser.id)



            const { firstName, lastName, email, phoneNumber, dataOfBirth, address, country, state, lga, bankName, accountName, accountNumber, roleName, roleId, employmentType, businessId, paymentAccount, password, businessTradingName, businessAlias, companyStaffId, designation } = req.body


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
                roleName: roleName || "staff",
                roleId,
                employmentType,
                businessId,
                businessTradingName,
                businessAlias: formattedBusinessAlias,
                companyStaffId: companyStaffId || "",
                password: hashedPassword,
                staffId,
                designation
                // userId: authUser.id,
            })




            let returnData = {...createdStaff.dataValues }
            delete returnData.password


            let awsQueuePayload = {
                staffId: createdStaff.id,
                userId: authUser.id,
                businessId,
                phoneNumber,
                name: `${firstName} ${lastName}`,
                email: email,
                walletCategory: "staff",
                alias: businessAlias,
            }

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
                roleName,
                businessTradingName,
                businessAlias,
                password: tempPassword,
                staffId
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
            console.log(authUser)



            const { businessId } = req.params;
            const staff = await db.staff.findAll({ where: { businessId }, include: ["role"] });
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


            const { staffId } = req.params;


            const foundStaff = await db.staff.findOne({ where: { id: staffId }, include: ["role"] });
            let staffRoleDetails = await db.roles.findOne({ where: { id: foundStaff.roleId }, include: ["permissions"] })
                //console.log("permissions", staffRoleDetails.permissions)
            console.log("permissions", staffRoleDetails.dataValues.permissions)

            foundStaff.permissions = staffRoleDetails.dataValues.permissions
                // console.log(foundStaff)

            const staffObj = {...foundStaff.dataValues }
            staffObj.permissions = staffRoleDetails.dataValues.permissions

            res.status(200).send({ message: `Staff fetched`, statuscode: 200, data: { staff: staffObj } });

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
    '/api/v1/business-staff/login',
    async(req, res) => {

        try {
            const { staffId, password, businessAlias } = req.body





            //CHECK IF staff EXIST
            const existingStaff = await db.staff.findOne({ where: { staffId, businessAlias }, include: ["role"] });
            if (!existingStaff) {
                return res.status(400).send({ message: `Invalid user credentials`, statuscode: 400, errors: [{ message: `Invalid user credentials` }] });
            }

            //COMPARE ENTERED PASSWORD WITH HASHED PASSWORD
            if (!(await decryptPassword(password, existingStaff.password))) {
                return res.status(400).send({ message: `Invalid user credentials`, statuscode: 400, errors: [{ message: `Invalid user credentials` }] });

            }

            //get staff permissions
            let staffRoleDetails = await db.roles.findOne({ where: { id: existingStaff.roleId }, include: ["permissions"] })

            //JWT PAYLOAD FOR SIGINED IN USER
            const payLoad = {
                user: {
                    id: existingStaff.id,
                    role: existingStaff.roleName,
                    permissions: staffRoleDetails.permissions,
                    type: "Staff"
                },
            };


            let accessToken = await generateAccessToken(payLoad);

            let { data } = await axios.get(`${BUSINESS_SERVICE_URL}/api/v1/business/${existingStaff.businessId}`, {
                headers: {
                    authorization: `Bearer ${accessToken}`,
                    authsource: "staff"
                }
            })
            console.log("staff business", data)


            existingStaff.password = undefined



            res.status(200).send({ message: "Signin successful", statuscode: 200, data: { staff: existingStaff, accessToken, business: data.business } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }


    }
);


//AUTHENTICATE REQUESTS
staffRouter.get(
    '/api/v1/authenticate-staff/authenticate',
    authenticate,
    async(req, res) => {
        try {
            console.log("auth user from staff", req.user)

            res.status(200).send({ user: req.user });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }


    }
);

//STAFF CHANGE PASSWORD
staffRouter.patch("/api/v1/business-staff/update-password",
    // authenticate,
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
            console.log("request body", req.body)

            console.log("req.user.id", authUser.id)
                //get the user from the user collection
            const staff = await db.staff.findOne({ where: { id: authUser.id } });
            console.log("user", user)
            if (!staff) {
                return res.status(404).json({ message: "Staff not found", statuscode: 404, errors: [{ message: "Staff not found" }] })

            }

            // check if passwaord matches the one in the database

            let passwordIsMatch = await decryptPassword(oldPassword, staff.password);
            if (!passwordIsMatch) {
                return res.status(400).json({ message: "The password you entered is incorrect", statuscode: 400, errors: [{ message: "The password you entered is incorrect" }] })
            }
            if (newPassword !== newConfirmPassword) {

                return res.status(400).json({ message: "Password do not match", statuscode: 400, errors: [{ message: "Password do not match" }] })
            }
            hashedNewPassword = await hashUserPassword(newPassword);

            const updatedStaff = await db.staff.update({ password: hashedNewPassword }, { where: { id: authUser.id }, returning: true, plain: true })

            //log staff in by assigning him a token
            let staffDetails = await db.staff.findOne({ where: { id: authUser.id }, include: ["role"] })
            let staffRoleDetails = await db.roles.findOne({ where: { id: staffDetails.roleId }, include: ["permissions"] })

            //JWT PAYLOAD FOR SIGINED IN staff
            const payLoad = {
                user: {
                    id: staffDetails.id,
                    role: staffDetails.role,
                    permissions: staffRoleDetails.permissions,
                    type: "Staff"
                },
            };
            let accessToken = await generateAccessToken(payLoad);
            return res.status(200).json({ message: "Password updated successsfully", statuscode: 200, data: { staff: staffDetails, accessToken } });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: err.message || "Something went wrong" }] })
        }
    })


//STAFF RESET PASSWORD
staffRouter.post(
    '/api/v1/business-staff/reset-password',
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



            const { staffId } = req.params;

            const updatedStaff = await db.staff.update(req.body, { where: { id: staffId }, returning: true, plain: true })

            res.status(200).send({ message: `Staff info updated`, statuscode: 200, data: { staff: updatedStaff[1] } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }


    }
);

//create role for a business
staffRouter.post("/api/v1/staff/business/roles", async(req, res) => {
    const { name, businessId, permissions } = req.body
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



    try {
        let roleObj = {
            name,
            businessId: Number(businessId)
        }

        const createdRole = await db.roles.create(roleObj)

        if (permissions && permissions.length) {
            for (let permission of permissions) {
                let permissionObj = {
                    permissionName: permission.permissionName,
                    roleName: name,
                    businessId,
                    description: permission.description,
                    roleId: createdRole.dataValues.id
                }
                let createdPermissions = await db.permissions.create(permissionObj)
                console.log(createdPermissions)

            }
        }


        let justCreatedRole = await db.roles.findOne({ where: { id: createdRole.dataValues.id }, include: ["permissions"] })

        res.status(201).send({ message: `Role created`, statuscode: 201, data: { role: justCreatedRole } });

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

    }




})

//DELETE STAFF
staffRouter.delete(
    '/api/v1/staff/:staffId',
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



            const { staffId } = req.params

            await db.staff.destroy({ where: { staffId } });

            res.status(204).send({ message: "Staff deleted", statuscode: 204, data: { staff: {} } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }

    }
);


//not sure what is happening here
staffRouter.get("/api/v1/staff/business/roles/:roleId/:businessId/permissions", async(req, res) => {
    try {
        const { roleId, businessId } = req.params


        let roles = await db.roles.findAll({ where: { businessId: Number(businessId), } })
        console.log(roles)

        res.status(200).send({ message: `All roles and permissions`, statuscode: 200, data: { roles, permissions } });

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

    }


})

//GET ALL ROLES AND PERMISSIONS FOR A BUSINESS
staffRouter.get("/api/v1/staff/business/roles-permissions/:businessId", async(req, res) => {


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


        const { businessId } = req.params


        let roles = await db.roles.findAll({ where: { businessId: Number(businessId) }, include: ["permissions"] })
        res.status(200).send({ message: `All roles and permissions`, statuscode: 200, data: { roles, permissions } });

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })
    }
})




module.exports = { staffRouter };