const express = require("express");
const axios = require("axios")
const { validationResult } = require("express-validator")
const { validateRequest, BadRequestError, NotFoundError, NotAuthorisedError } = require("@bc_tickets/common");
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
            const { data } = await axios.get(`${AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })
                //check if user is not authenticated
            if (!data.user) {
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, data: [] });
            }


            //get all registered businesses
            const businesses = await db.businesses.findAll({});

            res.status(200).send({ message: "Businesses Fetched", statuscode: 200, data: { businesses } });

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
            const { data } = await axios.get(`${AUTH_URL}`, {
                    headers: {
                        authorization: req.headers.authorization
                    }
                })
                //check if user is not authenticated
            if (!data.user) {
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, data: [] });
            }
            //console.log("req", req.body)

            //request body validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }


            const { rcNumber, name, tradingName, businessType, description, yearOfOperation, address, country, tin, state, alias, utilityBillType, userId, } = req.body

            //check if business already exist
            const existingBusiness = await db.businesses.findOne({ where: { name } });

            if (existingBusiness) {
                throw new BadRequestError(`Business name ${name} already in use`);
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
                userId: data.user.id || userId,
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
                businessCategory: "Registered",
                businessLogo: imageData.businessLogo
            })

            //create business alias


            console.log("biz id", createdBusiness.id)
            const businesAlias = await db.aliases.create({ name: alias.toUpperCase(), businessId: createdBusiness.id, userId: data.user.id })

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
                userId: data.user.id || userId,
                alias: alias.toUpperCase(),
                tradingName,
                name: tradingName || "",
                email: returnData.email,
                walletCategory: "Business"
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
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, data: [] });
            }
            //console.log("req", req.body)
            //request body validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }


            const { tradingName, alias, businessType, description, yearOfOperation, address, country, state, businessEmail, utilityBillType, businessOwners } = req.body

            //check if business already exist
            const existingBusiness = await db.businesses.findOne({ where: { tradingName } });

            if (existingBusiness) {
                throw new BadRequestError(`Trading name ${tradingName} already in use`);
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
                userId: data.user.id,
                state,
                utilityBillImage: imageData.utilityBillImage,
                alias: alias.toUpperCase(),
                utilityBillType,
                email: businessEmail || data.user.email,
                businessEmail: businessEmail || data.user.email,
                businessCategory: "Freelance",
                businessLogo: imageData.businessLogo
            })

            //create business alias
            const businesAlias = await db.aliases.create({ name: alias.toUpperCase(), businessId: createdFreelanceBusiness.id, userId: data.user.id })

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
                email: returnData.email,
                walletCategory: "Business"
            }
            console.log("queue payload", awsQueuePayload)
            let queueResponse = await sendDataToAWSQueue(awsQueuePayload, queueUrl)
            console.log("Business creation queue successfull", queueResponse);

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
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, data: [] });
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
                throw new BadRequestError(`Business trading name ${tradingName} already in use`);
            }

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
            const createdUnregisteredBusiness = db.businesses.create({
                ...req.body,
                ...req.imageData,
                userId: data.user.id,
                businessCategory: "Unregistered",
                businessLogo: imageData.businessLogo,
                alias: alias.toUpperCase(),
                email: req.body.businessEmail || data.user.email,
                businessEmail: req.body.businessEmail || data.user.email,
            })


            //create business alias
            const businesAlias = await db.aliases.create({ name: alias.toUpperCase(), businessId: createdUnregisteredBusiness.id, userId: data.user.id })

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
                        businessId: createdUnregisteredBusiness.id
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

            let returnData = {...createdUnregisteredBusiness.dataValues }






            returnData.alias = businesAlias
            returnData.owner = data.user
            returnData.partners = partners

            let awsQueuePayload = {
                businessId: createdUnregisteredBusiness.id,
                userId: data.user.id || userId,
                alias: alias.toUpperCase(),
                tradingName,
                name: tradingName || "",
                email: returnData.email,
                walletCategory: "Business"
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
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, data: [] });
            }

            const { userId } = req.params;
            const business = await db.businesses.findAll({ where: { userId } });
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
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, data: [] });
            }

            const { alias } = req.params;

            //CHECK IF ALIAS ALREADY EXIST
            const existingAlias = await db.aliases.findOne({ where: { name: alias.toUpperCase() } });
            if (existingAlias) {
                throw new BadRequestError(`Business alias  ${alias} already in use please choose another alias`)
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
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, data: [] });
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
                return res.status(401).send({ message: `Access denied, you are not authenticated`, statuscode: 401, data: [] });
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