const express = require("express");
const AWS = require('aws-sdk');
const { body } = require('express-validator');
const axios = require("axios")
const { validateRequest, BadRequestError, NotFoundError, NotAuthorisedError } = require("@bc_tickets/common");
const { businessRegistrationValidation } = require("../utils/business-registration-validation")
const { upload, cloudinary } = require("../utils/imageProcessing")
const db = require("../models/index")
const businessRouter = express.Router();
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate"
    // Configure the region 
AWS.config.update({ region: 'us-east-1' });
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const queueUrl = "https://sqs.us-east-1.amazonaws.com/322544062396/linxqueue";




//GET ALL BUSINESSES
businessRouter.get(
    '/api/v1/business',
    async(req, res) => {
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
        const businesses = await db.businesses.findAll({});

        res.status(200).send({ message: "Businesses Fetched", statuscode: 200, data: { businesses } });
    }
);

//REGISTER BUSINESSES
businessRouter.post(
    '/api/v1/business',
    businessRegistrationValidation,
    upload.fields([
        { name: "utilityBill", maxCount: 1 },
        { name: "registrationCertificate", maxCount: 1 },
        { name: "otherDocuments", maxCount: 1 },
        { name: "tinCertificate", maxCount: 1 },
    ]),
    async(req, res) => {

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


        const { rcNumber, name, tradingName, businessType, description, yearOfOperation, address, country, tin, state, alias, utilityBillType, userId, businessOwners } = req.body

        //check if business already exist
        const existingBusiness = await db.businesses.findOne({ where: { name } });
        if (existingBusiness) {
            throw new BadRequestError(`Business name ${name} already in use`);
        }

        // initialize file upload fields
        let imageData = {
            utilityBill: "",
            registrationCertificate: "",
            otherDocuments: "",
            tinCertificate: ""
        }

        //upload images
        // console.log(req.files)
        if (req.files.utilityBill) {
            console.log("ok")
            await cloudinary.uploader.upload(
                req.files.utilityBill[0].path, {
                    public_id: `utility-bill/${name.split(" ").join("-")}-utility-bill`,
                },
                (error, result) => {

                    console.log(result)
                    if (error) {
                        console.log("Error uploading utilityBill to cloudinary");
                    } else {
                        imageData.utilityBill = result.secure_url;

                    }

                }
            );
        }
        if (req.files.registrationCertificate) {
            await cloudinary.uploader.upload(
                req.files.registrationCertificate[0].path, {
                    public_id: `registration-certificate/${name.split(" ").join("-")}-registration-certificate`,
                },
                (error, result) => {
                    console.log(result)
                    if (error) {
                        console.log("Error uploading registration Certificate to cloudinary");
                    } else {
                        imageData.registrationCertificate = result.secure_url;

                    }

                }
            );
        }
        if (req.files.otherDocuments) {
            await cloudinary.uploader.upload(
                req.files.otherDocuments[0].path, {
                    public_id: `other-documents/${name.split(" ").join("-")}-other-documents`,
                },
                (error, result) => {


                    console.log(result)
                    if (error) {
                        console.log("Error uploading other Documents to cloudinary");
                    } else {
                        imageData.otherDocuments = result.secure_url;
                    }
                }
            );
        }

        if (req.files.tinCertificate) {
            await cloudinary.uploader.upload(
                req.files.tinCertificate[0].path, {
                    public_id: `tin-certificate/${name.split(" ").join("-")}-tin-certificate`,
                },
                (error, result) => {

                    console.log(result)
                    if (error) {
                        console.log("Error uploading other Documents to cloudinary");
                    } else {
                        imageData.tinCertificate = result.secure_url;
                    }
                }
            );
        }

        //let userId = req.user.id
        //create business
        let createdBusiness = await db.businesses.create({
            name,
            tradingName,
            businessType,
            description,
            yearOfOperation,
            address,
            country,
            tin,
            userId: userId || data.user.id,
            rcNumber,
            state,
            utilityBill: imageData.utilityBill,
            registrationCertificate: imageData.registrationCertificate,
            otherDocuments: imageData.otherDocuments,
            tinCertificate: imageData.tinCertificate,
            alias: alias.toUpperCase(),
            utilityBillType
        })

        //create business alias
        const businesAlias = await db.aliases.create({ name: alias.toUpperCase(), businessId: createdBusiness.id, userId: userId || data.user.id })

        //create business owners
        let partners = [];
        if (businessOwners.length) {
            for (let businessOwner of businessOwners) {
                let busnessOwnerDetails = {
                    firstName: businessOwner.firstName,
                    lastName: businessOwner.lastName,
                    email: businessOwner.email,
                    idType: businessOwner.idType,
                    idTypeImage: "",
                    businessId: createdBusiness.id
                }

                let createdBusinessOwner = await db.businessOwners.create(busnessOwnerDetails)
                partners.push(createdBusinessOwner)
            }

        }

        let returnData = {...createdBusiness.dataValues }

        returnData.alias = businesAlias
        returnData.owner = data.user
        returnData.partners = partners
        res.status(201).send({ message: "Business Created", statuscode: 201, type: "success", data: { business: returnData } });

    }
);

//GET  BUSINESSES BY USE ID
businessRouter.get(
    '/api/v1/business/:userId',
    //validateRequest,
    // authenticate,
    async(req, res) => {
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

        const { userId } = req.params;
        const business = await db.businesses.findAll({ where: { userId } });
        res.status(200).send({ message: `${business.length?"Business fetched":"You do not currently have any business setup"}`, statuscode: 200, data: { business } });
    }
);

//QUERY IF BUSINESS ALIAS ALREADY EXIST
businessRouter.get(
    '/api/v1/business/alias/:alias',
    async(req, res) => {


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

        const { alias } = req.params;

        //CHECK IF ALIAS ALREADY EXIST
        const existingAlias = await db.aliases.findOne({ where: { name: alias.toUpperCase() } });
        if (existingAlias) {
            throw new BadRequestError("Business alias already in use please choose another alias")
        }
        res.status(200).send({ message: `Business alias ${alias} available`, statuscode: 200, data: { alias } });
    }
);


//QUERY  CAC FOR RC NUMBER VALIDITY
businessRouter.get(
    '/api/v1/business/rc-number/:rcNumber',
    async(req, res) => {

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

        const { rcNumber } = req.params;

        //PING CAC API FOR RC NUMBER VALIDATION
        // const responseFromCAC= await axios.get("cacEndpoin");
        // if (foundRCNumber) {
        //     throw new BadRequestError("RC number not found in CAC database")
        // }
        res.status(200).send({ message: `RC number ${rcNumber} valid`, statuscode: 200, data: { rcNumber, businessDetails: {} } });
    }
);

//UPDATE BUSINESS DATA
businessRouter.patch(
    '/api/v1/business/:businessId',
    async(req, res) => {
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
    }
);

//upload.single("image")
businessRouter.post("/api/v1/business/upload", upload.single("image"), async(req, res) => {

    console.log("file", req.file)


    if (req.file) {

        console.log("images")
        await cloudinary.uploader.upload(
            req.file.path, {
                public_id: `image-bill/-utility-bill`,
            },
            (error, result) => {

                console.log(result)
                if (error) {
                    console.log("Error uploading utilityBill to cloudinary");
                } else {
                    // imageData.utilityBill = result.secure_url;

                }

            }
        );

    }
    res.send("ok")
})

businessRouter.post("/api/v1/business/sqs-test", async(req, res) => {
    console.log("posting data")
    let testingPayload = {
        name: "chinedu",
        gender: "M"
    }

    let sqsTesting = {
        MessageAttributes: {
            "userEmail": {
                DataType: "String",
                StringValue: "test@mail.com"
            },

        },
        MessageBody: JSON.stringify(testingPayload),
        //MessageDeduplicationId: "test",
        //MessageGroupId: "testing",
        QueueUrl: queueUrl
    };
    let sendSqsMessage = await sqs.sendMessage(sqsTesting).promise()
    console.log(sendSqsMessage)
    res.status(200).json({ data: sendSqsMessage })


})


module.exports = { businessRouter };