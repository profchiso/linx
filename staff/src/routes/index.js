const express = require("express");
const AWS = require('aws-sdk');
const { body } = require('express-validator');
const axios = require("axios")
const { validateRequest, BadRequestError, NotFoundError, NotAuthorisedError } = require("@bc_tickets/common");
const { staffRegistrationValidation } = require("../utils/staff-registration-validation")
const { upload, cloudinary } = require("../utils/imageProcessing")
const db = require("../models/index")
const staffRouter = express.Router();
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate"
    // Configure the region 
AWS.config.update({ region: 'us-east-1' });
AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const queueUrl = "https://sqs.us-east-1.amazonaws.com/322544062396/linxqueue";




//GET ALL STAFF
staffRouter.get(
    '/api/v1/staff',
    async(req, res) => {
        try {
            //authenticate user
            // const { data } = await axios.get(`${AUTH_URL}`, {
            //         headers: {
            //             authorization: req.headers.authorization
            //         }
            //     })
            //     //check if user is not authenticated
            // if (!data.user) {
            //     throw new NotAuthorisedError()
            // }


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
            // const { data } = await axios.get(`${AUTH_URL}`, {
            //         headers: {
            //             authorization: req.headers.authorization
            //         }
            //     })
            //     //check if user is not authenticated
            // if (!data.user) {
            //     throw new NotAuthorisedError()
            // }



            const { firstName, lastName, email, phoneNumber, dataOfBirth, profilePix, address, country, state, lga, bankName, accountName, accountNumber, role, employmentType, businessId, paymentAccount } = req.body



            // initialize file upload fields
            let imageData = {
                utilityBill: "",
                registrationCertificate: "",
                otherDocuments: "",
                tinCertificate: ""
            }

            //upload images
            //upload images in base64 string
            if (req.body.utilityBill) {

                await cloudinary.uploader.upload(
                    req.body.utilityBill, {
                        public_id: `utility-bill/${name.split(" ").join("-")}-utility-bill`,
                    },
                    (error, result) => {


                        if (error) {
                            console.log("Error uploading utilityBill to cloudinary");
                        } else {
                            imageData.utilityBill = result.secure_url;

                        }

                    }
                );
            }


            //upload images in  file format
            if (req.files) {
                if (req.files.utilityBill) {

                    await cloudinary.uploader.upload(
                        req.files.utilityBill[0].path, {
                            public_id: `utility-bill/${name.split(" ").join("-")}-utility-bill`,
                        },
                        (error, result) => {


                            if (error) {
                                console.log("Error uploading utilityBill to cloudinary");
                            } else {
                                imageData.utilityBill = result.secure_url;

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
            })


            let returnData = {...createdStaff.dataValues }

            // let businessCreatedPayload = {
            //     businesId: `${createdBusiness.id}`,
            //     userId: `${data.user.id}`
            // }

            // let businessCreatedMessage = {
            //     MessageAttributes: {
            //         "businessId": {
            //             DataType: "String",
            //             StringValue: `${createdBusiness.id}`
            //         },
            //         "userId": {
            //             DataType: "String",
            //             StringValue: `${data.user.id}`
            //         },
            //         "alias": {
            //             DataType: "String",
            //             StringValue: businesAlias.name
            //         },

            //     },
            //     MessageBody: JSON.stringify(businessCreatedPayload),
            //     //MessageDeduplicationId: "test",
            //     //MessageGroupId: "testing",
            //     QueueUrl: queueUrl
            // };
            // let sendSqsMessage = await sqs.sendMessage(businessCreatedMessage).promise()
            // console.log(sendSqsMessage)


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
            // const { data } = await axios.get(`${AUTH_URL}`, {
            //         headers: {
            //             authorization: req.headers.authorization
            //         }
            //     })
            //     //check if user is not authenticated
            // if (!data.user) {
            //     throw new NotAuthorisedError()
            // }

            const { businessId } = req.params;
            const staff = await db.staff.findAll({ where: { businessId } });
            let myStaff = [];
            if (staff.length > 0) {
                for (let b of business) {
                    b.dataValues.wallet = 0.00
                    myBusinesses.push(b.dataValues)
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

            //CHECK IF ALIAS ALREADY EXIST
            const foundStaff = await db.staff.findOne({ where: { id: staffId } });
            if (foundStaff) {
                throw new NotFoundError()
            }
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

            res.status(200).send({ message: `Staff info updated`, statuscode: 200, data: { staff: updatedStaff } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }


    }
);

//DELETE STAFF
staffRouter.delete(
    '/api/v1/business/:businessId',
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

            const { businessId } = req.params

            const existingBusiness = await db.businesses.findOne({ where: { businessId } });
            if (!existingBusiness) {
                throw new BadRequestError('Invalid business id');
            }
            const updatedBusiness = await db.businesses.update(req.body, { where: { id: businessId }, returning: true, plain: true })

            res.status(200).send({ message: "Business updated successfully", statuscode: 200, data: { business: updatedBusiness } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }

    }
);


module.exports = { staffRouter };