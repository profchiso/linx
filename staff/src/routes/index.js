const express = require("express");
const AWS = require('aws-sdk');
const { body } = require('express-validator');
const axios = require("axios")
const { validateRequest, BadRequestError, NotFoundError, NotAuthorisedError } = require("@bc_tickets/common");
const { staffRegistrationValidation } = require("../utils/staff-registration-validation")
const { upload, cloudinary } = require("../utils/imageProcessing")
const db = require("../models/index")
const staffRouter = express.Router();
const AUTH_URL = process.env.AUTH_URL
    // Configure the region 
AWS.config.update({ region: 'us-east-1' });
AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
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
                throw new NotAuthorisedError()
            }


            //get all registered businesses
            const staff = await db.staff.findAll({});

            res.status(200).send({ message: "All staff Fetched", statuscode: 200, data: { staff } });

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
                throw new NotAuthorisedError()
            }



            const { firstName, lastName, email, phoneNumber, dataOfBirth, address, country, state, lga, bankName, accountName, accountNumber, role, employmentType, businessId, paymentAccount } = req.body



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



            //create staff
            let createdStaff = await db.staff.create({
                firstName,
                lastName,
                email,
                phoneNumber,
                dataOfBirth,
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
                profilePix: imageData.profilePix
            })


            let returnData = {...createdStaff.dataValues }

            let awsQueuePayload = {
                staffId: createdStaff.id,
                userId: data.user.id,
                businessId,
                phoneNumber,
                name: `${firstName} ${lastName}`,
                email: email,
                walletType: "Staff"
            }
            console.log("queue payload", awsQueuePayload)
            let queueResponse = await sendDataToAWSQueue(awsQueuePayload, queueUrl)
            console.log("staff creation queue successfull", queueResponse);

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
    //validateRequest,
    // authenticate,
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
                throw new NotAuthorisedError()
            }

            const { businessId } = req.params;
            const staff = await db.staff.findAll({ where: { businessId } });
            let myStaff = [];
            if (staff.length > 0) {
                for (let b of staff) {
                    b.dataValues.wallet = 0.00
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
                throw new NotAuthorisedError()
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
                throw new NotAuthorisedError()
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
                throw new NotAuthorisedError()
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


module.exports = { staffRouter };