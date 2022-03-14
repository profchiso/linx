const express = require("express");
const axios = require("axios")
const { validationResult } = require("express-validator")

const { RegisteredBusinessRegistrationValidation, freelanceBusinessRegistrationValidation, UnregisteredBusinessRegistrationValidation } = require("../utils/business-registration-validation")
const { upload, cloudinary } = require("../utils/imageProcessing")
const { sendDataToAWSQueue } = require("../utils/sendDataToQueue")
const db = require("../models/index");
const businessRouter = express.Router();
const AUTH_URL = process.env.AUTH_URL
const queueUrl = process.env.BUSINESS_CREATION_QUEUE




//GET ALL BUSINESSES
businessRouter.get(
    '/api/v1/business',
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
            const businesses = await db.businesses.findAll({ where: req.query, include: ["businessOwners", "directors", "secretaries", "witnesses"] });

            res.status(200).send({ message: "Businesses Fetched", statuscode: 200, data: { businesses } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }
    }
);

//GET A  business
businessRouter.get(
    '/api/v1/business/:id',
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


            const foundBusiness = await db.businesses.findOne({ where: { id }, include: ["businessOwners", "directors", "secretaries", "witnesses"] });

            res.status(200).send({ message: `business fetched`, statuscode: 200, data: { business: foundBusiness } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }

    }
);

//REGISTER BUSINESSES(REGISTERED)

businessRouter.post(
    '/api/v1/business/registered',
    RegisteredBusinessRegistrationValidation,
    upload.fields([
        { name: "utilityBillImage", maxCount: 1 },
        { name: "registrationCertificate", maxCount: 1 },
        { name: "otherDocuments", maxCount: 1 },
        { name: "tinCertificate", maxCount: 1 },
        { name: "businessLogo", maxCount: 1 },
    ]),
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

            //request body validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }


            const { rcNumber, name, tradingName, businessType, description, yearOfOperation, address, country, tin, state, alias, utilityBillType, userId, } = req.body

            //check if business already exist
            const existingBusiness = await db.businesses.findOne({ where: { name } });

            if (existingBusiness) {
                return res.status(400).send({ message: `Business name ${name} already in use`, statuscode: 400, errors: [{ message: `Business name ${name} already in use` }] });
                //throw new BadRequestError(`Business name ${name} already in use`);
            }

            // initialize file upload fields
            let imageData = {
                utilityBillImage: "",
                registrationCertificate: "",
                otherDocuments: "",
                tinCertificate: "",
                businessLogo: ""
            }

            //upload images
            //upload images in base64 string
            if (req.body.utilityBillImage) {

                await cloudinary.uploader.upload(
                    req.body.utilityBillImage, {
                        public_id: `utility-bill/${name.split(" ").join("-")}-utility-bill`,
                    },
                    (error, result) => {


                        if (error) {
                            console.log("Error uploading utilityBill to cloudinary");
                        } else {
                            imageData.utilityBillImage = result.secure_url;

                        }

                    }
                );
            }

            if (req.body.businessLogo) {

                await cloudinary.uploader.upload(
                    req.body.businessLogo, {
                        public_id: `businessLogo/${name.split(" ").join("-")}-businessLogo`,
                    },
                    (error, result) => {


                        if (error) {
                            console.log("Error uploading businessLogo to cloudinary");
                        } else {
                            imageData.businessLogo = result.secure_url;

                        }

                    }
                );
            }
            if (req.body.registrationCertificate) {
                await cloudinary.uploader.upload(
                    req.body.registrationCertificate, {
                        public_id: `registration-certificate/${name.split(" ").join("-")}-registration-certificate`,
                    },
                    (error, result) => {

                        if (error) {
                            console.log("Error uploading registration Certificate to cloudinary");
                        } else {
                            imageData.registrationCertificate = result.secure_url;

                        }

                    }
                );
            }
            if (req.body.otherDocuments) {
                await cloudinary.uploader.upload(
                    req.body.otherDocuments, {
                        public_id: `other-documents/${name.split(" ").join("-")}-other-documents`,
                    },
                    (error, result) => {
                        if (error) {
                            console.log("Error uploading other Documents to cloudinary");
                        } else {
                            imageData.otherDocuments = result.secure_url;
                        }
                    }
                );
            }

            if (req.body.tinCertificate) {
                await cloudinary.uploader.upload(
                    req.body.tinCertificate, {
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


            //upload images in  file format
            if (req.files) {
                if (req.files.utilityBillImage) {

                    await cloudinary.uploader.upload(
                        req.files.utilityBillImage[0].path, {
                            public_id: `utility-bill/${name.split(" ").join("-")}-utility-bill`,
                        },
                        (error, result) => {


                            if (error) {
                                console.log("Error uploading utilityBill to cloudinary");
                            } else {
                                imageData.utilityBillImage = result.secure_url;

                            }

                        }
                    );
                }

                if (req.files.businessLogo) {

                    await cloudinary.uploader.upload(
                        req.body.businessLogo, {
                            public_id: `businessLogo/${name.split(" ").join("-")}-businessLogo`,
                        },
                        (error, result) => {


                            if (error) {
                                console.log("Error uploading businessLogo to cloudinary");
                            } else {
                                imageData.businessLogo = result.secure_url;

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
            }


            //userId = req.user.id
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
                userId: authUser.user.id || userId,
                rcNumber,
                state,
                utilityBillImage: imageData.utilityBillImage,
                registrationCertificate: imageData.registrationCertificate,
                otherDocuments: imageData.otherDocuments,
                tinCertificate: imageData.tinCertificate,
                alias: alias.toUpperCase(),
                utilityBillType,
                email: req.body.businessEmail || data.user.email,
                businessEmail: req.body.businessEmail || data.user.email,
                businessPhoneNumber: req.body.businessPhoneNumber || "",
                businessCategory: "Registered",
                businessLogo: imageData.businessLogo
            })

            //create business alias

            const businesAlias = await db.aliases.create({ name: alias.toUpperCase(), businessId: createdBusiness.id, userId: authUser.user.id })

            //create business owners
            let partners = [];

            if (req.body.businessOwners && req.body.businessOwners.length) {

                for (let businessOwner of req.body.businessOwners) {


                    let busnessOwnerDetails = {
                        firstName: businessOwner.firstName,
                        lastName: businessOwner.lastName,
                        middleName: businessOwner.lastName || "",
                        dateOfBirth: businessOwner.dateOfBirth || "",
                        phone: businessOwner.phone || "",
                        email: businessOwner.email,
                        idType: businessOwner.idType,
                        idTypeImage: "",
                        businessId: createdBusiness.id
                    }

                    if (businessOwner.idTypeImage) {
                        await cloudinary.uploader.upload(
                            businessOwner.idTypeImage, {
                                public_id: `partnerid-image/${businessOwner.firstName}-${businessOwner.lastName}-idTypeImage`,
                            },
                            (error, result) => {


                                if (error) {
                                    console.log("Error uploading partner id image to cloudinary");
                                } else {
                                    busnessOwnerDetails.idTypeImage = result.secure_url;

                                }

                            }
                        );
                    }




                    let createdBusinessOwner = await db.businessOwners.create(busnessOwnerDetails)
                    partners.push(createdBusinessOwner)
                }

            }

            let returnData = {...createdBusiness.dataValues }

            returnData.alias = businesAlias.dataValues
            returnData.owner = data.user
            returnData.businessOwners = partners


            let awsQueuePayload = {
                businessId: createdBusiness.id,
                userId: authUser.user.id || userId,
                alias: alias.toUpperCase(),
                tradingName,
                name: tradingName || "",
                email: req.body.businessEmail || data.user.email,
                walletCategory: "business"
            }
            console.log("queue payload", awsQueuePayload)
            let queueResponse = await sendDataToAWSQueue(awsQueuePayload, queueUrl)
            console.log("Business creation queue successfull", queueResponse);

            res.status(201).send({ message: "Registered Business Created", statuscode: 201, type: "success", data: { business: returnData } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }



    }
);

//REGISTER BUSINESSES(FREELANCE)
businessRouter.post(
    '/api/v1/business/freelance',
    freelanceBusinessRegistrationValidation,
    upload.fields([
        { name: "utilityBillImage", maxCount: 1 },
        { name: "businessLogo", maxCount: 1 },

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

            //request body validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }


            const { tradingName, alias, businessType, description, yearOfOperation, address, country, state, businessEmail, utilityBillType, businessOwners } = req.body

            //check if business already exist
            const existingBusiness = await db.businesses.findOne({ where: { tradingName } });

            if (existingBusiness) {
                return res.status(400).send({ message: `Trading name ${tradingName} already in use`, statuscode: 400, data: [] });

            }

            // initialize file upload fields
            let imageData = {
                utilityBillImage: "",
                businessLogo: "",
            }

            //upload images
            //upload images in base64 string
            if (req.body.utilityBillImage) {

                await cloudinary.uploader.upload(
                    req.body.utilityBillImage, {
                        public_id: `utility-bill/${tradingName.split(" ").join("-")}-utility-bill`,
                    },
                    (error, result) => {


                        if (error) {
                            console.log("Error uploading utilityBill to cloudinary");
                        } else {
                            imageData.utilityBillImage = result.secure_url;

                        }

                    }
                );
            }

            if (req.body.businessLogo) {

                await cloudinary.uploader.upload(
                    req.body.businessLogo, {
                        public_id: `businessLogo/${name.split(" ").join("-")}-businessLogo`,
                    },
                    (error, result) => {


                        if (error) {
                            console.log("Error uploading businessLogo to cloudinary");
                        } else {
                            imageData.businessLogo = result.secure_url;

                        }

                    }
                );
            }






            //upload images in  file format
            if (req.files) {
                if (req.files.utilityBillImage) {

                    await cloudinary.uploader.upload(
                        req.files.utilityBillImage[0].path, {
                            public_id: `utility-bill/${tradingName.split(" ").join("-")}-utility-bill`,
                        },
                        (error, result) => {


                            if (error) {
                                console.log("Error uploading utilityBill to cloudinary");
                            } else {
                                imageData.utilityBillImage = result.secure_url;

                            }

                        }
                    );
                }
                if (req.files.businessLogo) {

                    await cloudinary.uploader.upload(
                        req.body.businessLogo, {
                            public_id: `businessLogo/${tradingName.split(" ").join("-")}-businessLogo`,
                        },
                        (error, result) => {


                            if (error) {
                                console.log("Error uploading businessLogo to cloudinary");
                            } else {
                                imageData.businessLogo = result.secure_url;

                            }

                        }
                    );
                }
            }


            //let userId = req.user.id
            //create business
            let createdFreelanceBusiness = await db.businesses.create({
                tradingName,
                businessType,
                description,
                yearOfOperation,
                address,
                country,
                userId: authUser.user.id,
                state,
                utilityBillImage: imageData.utilityBillImage,
                alias: alias.toUpperCase(),
                utilityBillType,
                email: businessEmail || data.user.email,
                businessEmail: businessEmail || data.user.email,
                businessCategory: "Freelance",
                businessLogo: imageData.businessLogo,
                businessPhoneNumber: req.body.businessPhoneNumber || ""
            })

            //create business alias
            const businesAlias = await db.aliases.create({ name: alias.toUpperCase(), businessId: createdFreelanceBusiness.id, userId: authUser.user.id })

            //create business owners
            let partners = [];

            if (req.body.businessOwners && req.body.businessOwners.length) {
                for (let businessOwner of req.body.businessOwners) {
                    let busnessOwnerDetails = {
                        firstName: businessOwner.firstName,
                        lastName: businessOwner.lastName,
                        email: businessOwner.email,
                        idType: businessOwner.idType,
                        idTypeImage: "",
                        businessId: createdFreelanceBusiness.id
                    }

                    if (businessOwner.idTypeImage) {
                        await cloudinary.uploader.upload(
                            businessOwner.idTypeImage, {
                                public_id: `partnerid-image/${businessOwner.firstName}-${businessOwner.lastName}-idTypeImage`,
                            },
                            (error, result) => {


                                if (error) {
                                    console.log("Error uploading partner id image to cloudinary");
                                } else {
                                    busnessOwnerDetails.idTypeImage = result.secure_url;

                                }

                            }
                        );
                    }




                    let createdBusinessOwner = await db.businessOwners.create(busnessOwnerDetails)
                    partners.push(createdBusinessOwner)
                }

            }

            let returnData = {...createdFreelanceBusiness.dataValues }

            returnData.alias = businesAlias.dataValues
            returnData.owner = data.user
            returnData.businessOwners = partners

            let awsQueuePayload = {
                businessId: createdFreelanceBusiness.id,
                userId: data.user.id || userId,
                alias: alias.toUpperCase(),
                tradingName,
                name: tradingName || "",
                email: req.body.businessEmail || data.user.email,
                walletCategory: "business"
            }
            console.log("queue payload", awsQueuePayload)
            let queueResponse = await sendDataToAWSQueue(awsQueuePayload, queueUrl)


            res.status(201).send({ message: " Freelance Business Created", statuscode: 201, type: "success", data: { business: returnData } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }



    }
);

//REGISTER BUSINESSES(UNREGISTERED)
businessRouter.post(
    '/api/v1/business/unregistered',
    UnregisteredBusinessRegistrationValidation,
    upload.fields([
        { name: "utilityBillImage", maxCount: 1 },
        { name: "businessLogo", maxCount: 1 },

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
            //request body validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }


            const { tradingName, alias, businessOwners } = req.body

            //check if business already exist
            const existingBusiness = await db.businesses.findOne({ where: { tradingName } });

            if (existingBusiness) {
                return res.status(400).send({ message: `Trading name ${tradingName} already in use`, statuscode: 400, errors: [{ message: `Trading name ${tradingName} already in use` }] });

            }
            console.log("business owner", req.body)


            // initialize file upload fields
            let imageData = {
                utilityBillImage: "",
                businessLogo: ""
            }

            //upload images
            //upload images in base64 string
            if (req.body.utilityBillImage) {

                await cloudinary.uploader.upload(
                    req.body.utilityBillImage, {
                        public_id: `utility-bill/${tradingName.split(" ").join("-")}-utility-bill`,
                    },
                    (error, result) => {


                        if (error) {
                            console.log("Error uploading utilityBill to cloudinary");
                        } else {
                            imageData.utilityBillImage = result.secure_url;

                        }

                    }
                );
            }

            if (req.body.businessLogo) {

                await cloudinary.uploader.upload(
                    req.body.businessLogo, {
                        public_id: `businessLogo/${tradingName.split(" ").join("-")}-businessLogo`,
                    },
                    (error, result) => {


                        if (error) {
                            console.log("Error uploading businessLogo to cloudinary");
                        } else {
                            imageData.businessLogo = result.secure_url;

                        }

                    }
                );
            }


            //upload images in  file format
            if (req.files) {
                if (req.files.utilityBillImage) {

                    await cloudinary.uploader.upload(
                        req.files.utilityBillImage[0].path, {
                            public_id: `utility-bill/${tradingName.split(" ").join("-")}-utility-bill`,
                        },
                        (error, result) => {


                            if (error) {
                                console.log("Error uploading utilityBill to cloudinary");
                            } else {
                                imageData.utilityBillImage = result.secure_url;

                            }

                        }
                    );
                }

                if (req.files.businessLogo) {

                    await cloudinary.uploader.upload(
                        req.body.businessLogo, {
                            public_id: `businessLogo/${tradingName.split(" ").join("-")}-businessLogo`,
                        },
                        (error, result) => {


                            if (error) {
                                console.log("Error uploading businessLogo to cloudinary");
                            } else {
                                imageData.businessLogo = result.secure_url;

                            }

                        }
                    );
                }


            }


            //let userId = req.user.id
            //create business
            delete req.body.utilityBillImage
            delete req.body.businessLogo
            console.log(req.body)
            const createdUnregisteredBusiness = db.businesses.create({
                ...req.body,
                ...req.imageData,
                userId: data.user.id,
                businessCategory: "Unregistered",
                businessLogo: imageData.businessLogo,
                alias: alias.toUpperCase(),
                email: req.body.businessEmail || data.user.email,
                businessEmail: req.body.businessEmail || data.user.email,
                businessPhoneNumber: req.body.businessPhoneNumber || ""
            })


            //create business alias
            const businesAlias = await db.aliases.create({ name: alias.toUpperCase(), businessId: createdUnregisteredBusiness.id, userId: data.user.id, }) // data.user.id || userId
            console.log("business", businesAlias)
                //create business owners
            let partners = [];

            if (req.body.businessOwners && req.body.businessOwners.length) {
                for (let businessOwner of req.body.businessOwners) {
                    let busnessOwnerDetails = {
                        firstName: businessOwner.firstName,
                        lastName: businessOwner.lastName,
                        middleName: businessOwner.middleName || "",
                        email: businessOwner.email,
                        phone: businessOwner.phone || "",
                        dateOfBirth: businessOwner.dateOfBirth || "",
                        gender: businessOwner.gender || "",
                        nationality: businessOwner.nationality || "",
                        state: businessOwner.state || "",
                        lga: businessOwner.lga || "",
                        address: businessOwner.address || "",
                        occupation: businessOwner.occupation || "",
                        share: businessOwner.share || 0,
                        shareAlloted: businessOwner.shareAlloted || 0,
                        idType: businessOwner.idType,
                        idNumber: businessOwner.idNumber || "",
                        idImage: "",
                        signature: "",
                        businessId: createdUnregisteredBusiness.id
                    }

                    if (businessOwner.idImage) {
                        await cloudinary.uploader.upload(
                            businessOwner.idImage, {
                                public_id: `partnerid-image/${businessOwner.firstName}-${businessOwner.lastName}-idTypeImage`,
                            },
                            (error, result) => {


                                if (error) {
                                    console.log("Error uploading partner id image to cloudinary");
                                } else {
                                    busnessOwnerDetails.idImage = result.secure_url;

                                }

                            }
                        );
                    }

                    if (businessOwner.signature) {
                        await cloudinary.uploader.upload(
                            businessOwner.signature, {
                                public_id: `partnerid-signature/${businessOwner.firstName}-${businessOwner.lastName}-signature`,
                            },
                            (error, result) => {


                                if (error) {
                                    console.log("Error uploading partner id image to cloudinary");
                                } else {
                                    busnessOwnerDetails.signature = result.secure_url;

                                }

                            }
                        );
                    }

                    let createdBusinessOwner = await db.businessOwners.create(busnessOwnerDetails)
                    partners.push(createdBusinessOwner)
                }

            }


            if (req.body.directors && req.body.directors.length) {
                for (let director of req.body.directors) {
                    let directorDetails = {
                        firstName: director.firstName,
                        lastName: director.lastName,
                        middleName: director.middleName || "",
                        email: director.email,
                        phone: director.phone || "",
                        dateOfBirth: director.dateOfBirth || "",
                        gender: director.gender || "",
                        nationality: director.nationality || "",
                        state: director.state || "",
                        lga: director.lga || "",
                        address: director.address || "",
                        occupation: director.occupation || "",
                        share: director.share || 0,
                        idType: director.idType,
                        idNumber: director.idNumber || "",
                        idImage: "",
                        signature: "",
                        businessId: createdUnregisteredBusiness.id
                    }

                    if (director.idImage) {
                        await cloudinary.uploader.upload(
                            director.idImage, {
                                public_id: `directors/${director.firstName}-${director.lastName}-idTypeImage`,
                            },
                            (error, result) => {


                                if (error) {
                                    console.log("Error uploading partner id image to cloudinary");
                                } else {
                                    directorDetails.idImage = result.secure_url;

                                }

                            }
                        );
                    }




                    let createdDirectors = await db.directors.create(directorDetails)

                }

            }

            if (req.body.secretaries && req.body.secretaries.length) {
                for (let secretary of req.body.secretaries) {
                    let secretaryDetails = {
                        firstName: secretary.firstName,
                        lastName: secretary.lastName,
                        middleName: secretary.middleName || "",
                        email: secretary.email,
                        phone: secretary.phone || "",
                        dateOfBirth: secretary.dateOfBirth || "",
                        gender: secretary.gender || "",
                        nationality: secretary.nationality || "",
                        state: secretary.state || "",
                        lga: secretary.lga || "",
                        address: secretary.address || "",
                        occupation: secretary.occupation || "",
                        // share: secretary.share || 0,
                        idType: secretary.idType,
                        idNumber: secretary.idNumber || "",
                        idImage: "",
                        signature: "",
                        businessId: createdUnregisteredBusiness.id
                    }

                    if (secretary.idImage) {
                        await cloudinary.uploader.upload(
                            secretary.idImage, {
                                public_id: `secretary/${secretary.firstName}-${secretary.lastName}-idImage`,
                            },
                            (error, result) => {


                                if (error) {
                                    console.log("Error uploading partner id image to cloudinary");
                                } else {
                                    secretaryDetails.idImage = result.secure_url;

                                }

                            }
                        );
                    }




                    let createdSecretary = await db.secretaries.create(secretaryDetails)

                }

            }

            if (req.body.witnesses && req.body.witnesses.length) {
                for (let witness of req.body.witnesses) {
                    let witnessDetails = {
                        firstName: witness.firstName,
                        lastName: witness.lastName,
                        middleName: witness.middleName || "",
                        email: witness.email,
                        phone: witness.phone || "",
                        dateOfBirth: witness.dateOfBirth || "",
                        gender: witness.gender || "",
                        nationality: witness.nationality || "",
                        state: witness.state || "",
                        lga: witness.lga || "",
                        address: witness.address || "",
                        occupation: witness.occupation || "",
                        // share: witness.share || 0,
                        // idType: witness.idType,
                        // idNumber: witness.idNumber || "",
                        // idTypeImage: "",
                        signature: "",
                        businessId: createdUnregisteredBusiness.id
                    }

                    if (witness.signature) {
                        await cloudinary.uploader.upload(
                            witness.signature, {
                                public_id: `witness/${ witness.firstName}-${ witness.lastName}-signature`,
                            },
                            (error, result) => {


                                if (error) {
                                    console.log("Error uploading partner id image to cloudinary");
                                } else {
                                    witnessDetails.signature = result.secure_url;

                                }

                            }
                        );
                    }

                    let createdwitness = await db.witnesses.create(witnessDetails)

                }

            }

            let returnData = {...createdUnregisteredBusiness.dataValues }
            console.log("created", returnData)


            returnData.alias = businesAlias
                // returnData.owner = data.user
            returnData.partners = partners

            let awsQueuePayload = {
                businessId: createdUnregisteredBusiness.id,
                userId: data.user.id,
                alias: alias.toUpperCase(),
                tradingName,
                name: tradingName || "",
                email: req.body.businessEmail || data.user.email,
                walletCategory: "business"
            }
            console.log("queue payload", awsQueuePayload)
            let queueResponse = await sendDataToAWSQueue(awsQueuePayload, queueUrl)
            console.log("Business creation queue successfull", queueResponse);

            res.status(201).send({ message: "Business Created", statuscode: 201, type: "success", data: { business: returnData } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }



    }
);


//GET  BUSINESSES BY USE ID
businessRouter.get(
    '/api/v1/business/my-businesses/:userId',
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
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, errors: [{ message: `Access denied, you are not authenticated` }] });
            }

            const { userId } = req.params;
            const business = await db.businesses.findAll({ where: { userId }, include: ["businessOwners", "directors", "secretaries", "witnesses"] });
            let myBusinesses = [];
            if (business.length > 0) {
                for (let b of business) {
                    b.dataValues.wallet = 0.00
                    myBusinesses.push(b.dataValues)
                }

            }


            res.status(200).send({ message: `${business.length?"Business fetched":"You do not currently have any business setup"}`, statuscode: 200, data: { myBusinesses } });

        } catch (error) {
            console.log(error)

        }

    }
);

//QUERY IF BUSINESS ALIAS ALREADY EXIST
businessRouter.get(
    '/api/v1/business/alias/:alias',
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

            const { alias } = req.params;

            //CHECK IF ALIAS ALREADY EXIST
            const existingAlias = await db.aliases.findOne({ where: { name: alias.toUpperCase() } });
            if (existingAlias) {
                return res.status(400).send({ message: `Business alias  ${alias} already in use please choose another alias`, statuscode: 400, errors: [{ message: `Business alias  ${alias} already in use please choose another alias` }] });
                //throw new BadRequestError(`Business alias  ${alias} already in use please choose another alias`)
            }
            res.status(200).send({ message: `Business alias ${alias} available`, statuscode: 200, data: { alias } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }



    }
);


//QUERY  CAC FOR RC NUMBER VALIDITY
businessRouter.get(
    '/api/v1/business/rc-number/:rcNumber',
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

            const { rcNumber } = req.params;

            //PING CAC API FOR RC NUMBER VALIDATION
            // const responseFromCAC= await axios.get("cacEndpoin");
            // if (foundRCNumber) {
            //     throw new BadRequestError("RC number not found in CAC database")
            // }
            res.status(200).send({ message: `RC number ${rcNumber} valid`, statuscode: 200, data: { rcNumber, businessDetails: {} } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }


    }
);

//UPDATE BUSINESS DATA
businessRouter.patch(
    '/api/v1/business/:businessId',
    upload.fields([
        { name: "utilityBillImage", maxCount: 1 },
        { name: "registrationCertificate", maxCount: 1 },
        { name: "otherDocuments", maxCount: 1 },
        { name: "tinCertificate", maxCount: 1 },
        { name: "businessLogo", maxCount: 1 },
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

            const { businessId } = req.params

            const existingBusiness = await db.businesses.findOne({ where: { businessId } });
            if (!existingBusiness) {
                return res.status(400).send({ message: `Invalid business id  ${businessId} `, statuscode: 400, errors: [{ message: `Invalid business id  ${businessId}` }] });
                //throw new BadRequestError('Invalid business id');
            }


            //upload images
            //upload images in base64 string
            if (req.body.utilityBillImage) {

                await cloudinary.uploader.upload(
                    req.body.utilityBillImage, {
                        public_id: `utility-bill/${name.split(" ").join("-")}-utility-bill`,
                    },
                    (error, result) => {


                        if (error) {
                            console.log("Error uploading utilityBill to cloudinary");
                        } else {
                            req.body.utilityBillImage = result.secure_url;

                        }

                    }
                );
            }

            if (req.body.businessLogo) {

                await cloudinary.uploader.upload(
                    req.body.businessLogo, {
                        public_id: `businessLogo/${name.split(" ").join("-")}-businessLogo`,
                    },
                    (error, result) => {


                        if (error) {
                            console.log("Error uploading businessLogo to cloudinary");
                        } else {
                            req.body.businessLogo = result.secure_url;

                        }

                    }
                );
            }
            if (req.body.registrationCertificate) {
                await cloudinary.uploader.upload(
                    req.body.registrationCertificate, {
                        public_id: `registration-certificate/${name.split(" ").join("-")}-registration-certificate`,
                    },
                    (error, result) => {

                        if (error) {
                            console.log("Error uploading registration Certificate to cloudinary");
                        } else {
                            req.body.registrationCertificate = result.secure_url;

                        }

                    }
                );
            }
            if (req.body.otherDocuments) {
                await cloudinary.uploader.upload(
                    req.body.otherDocuments, {
                        public_id: `other-documents/${name.split(" ").join("-")}-other-documents`,
                    },
                    (error, result) => {
                        if (error) {
                            console.log("Error uploading other Documents to cloudinary");
                        } else {
                            req.body.otherDocuments = result.secure_url;
                        }
                    }
                );
            }

            if (req.body.tinCertificate) {
                await cloudinary.uploader.upload(
                    req.body.tinCertificate, {
                        public_id: `tin-certificate/${name.split(" ").join("-")}-tin-certificate`,
                    },
                    (error, result) => {

                        console.log(result)
                        if (error) {
                            console.log("Error uploading other Documents to cloudinary");
                        } else {
                            req.body.tinCertificate = result.secure_url;
                        }
                    }
                );
            }


            //upload images in  file format
            if (req.files) {
                if (req.files.utilityBillImage) {

                    await cloudinary.uploader.upload(
                        req.files.utilityBillImage[0].path, {
                            public_id: `utility-bill/${name.split(" ").join("-")}-utility-bill`,
                        },
                        (error, result) => {


                            if (error) {
                                console.log("Error uploading utilityBill to cloudinary");
                            } else {
                                req.body.utilityBillImage = result.secure_url;

                            }

                        }
                    );
                }

                if (req.files.businessLogo) {

                    await cloudinary.uploader.upload(
                        req.body.businessLogo, {
                            public_id: `businessLogo/${name.split(" ").join("-")}-businessLogo`,
                        },
                        (error, result) => {


                            if (error) {
                                console.log("Error uploading businessLogo to cloudinary");
                            } else {
                                req.body.businessLogo = result.secure_url;

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

                            if (error) {
                                console.log("Error uploading registration Certificate to cloudinary");
                            } else {
                                req.body.registrationCertificate = result.secure_url;

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
                            if (error) {
                                console.log("Error uploading other Documents to cloudinary");
                            } else {
                                req.body.otherDocuments = result.secure_url;
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
                                req.body.tinCertificate = result.secure_url;
                            }
                        }
                    );
                }
            }

            const updatedBusiness = await db.businesses.update(req.body, { where: { id: businessId }, returning: true, plain: true })

            res.status(200).send({ message: "Business updated successfully", statuscode: 200, data: { business: updatedBusiness } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }

    }
);

//upload.single("image")
businessRouter.post("/api/v1/business/upload", upload.single("image"), async(req, res) => {

    try {
        if (req.body.image) {

            console.log("images")
            await cloudinary.uploader.upload(
                req.body.image, {
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

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

    }



})

businessRouter.post("/api/v1/business/sqs-test", async(req, res) => {
    console.log("posting data to queue", queueUrl, " from business")
    let awsQueuePayload = {
        businessId: 1,
        userId: 2,
        alias: "TEST ALIAS",
        name: "LinX"
    }
    let queueResponse = await sendDataToAWSQueue(awsQueuePayload, queueUrl)

    res.status(200).json({ data: queueResponse })
})


module.exports = { businessRouter };