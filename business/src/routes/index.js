const express = require("express");
const { body } = require('express-validator');
const { validateRequest, BadRequestError } = require("@bc_tickets/common");
const { businessRegistrationValidation } = require("../utils/business-registration-validation")
const { upload, cloudinary } = require("../utils/imageProcessing")
const db = require("../models/index")
const businessRouter = express.Router();


businessRouter.get(
    '/api/v1/business',
    businessRegistrationValidation,
    validateRequest,
    authenticate,
    async(req, res) => {
        const business = await db.businesses.findAll({});

        res.status(200).send({ message: "Businesses Fetched", statuscode: 200, type: "success", data: { business } });
    }
);

businessRouter.post(
    '/api/v1/business',
    businessRegistrationValidation,
    validateRequest,
    authenticate,
    async(req, res) => {
        const { rcNumber, name, tradingName, businessType, description, yearOfOperation, address, country, tin, state } = req.body
        const existingBusiness = await db.businesses.findOne({ where: { name } });
        if (existingBusiness) {
            throw new BadRequestError('Business name already in use');
        }
        let imageData = {
            utilityBill: "",
            registrationCertificate: "",
            otherDocuments: "",
            tinCertificate: ""
        }
        if (req.files.utilityBill) {
            await cloudinary.uploader.upload(
                req.files.utilityBill[0].path, {
                    public_id: `utility-bill/${name.split(" ").join("-")}-utility-bill`,
                },
                (error, result) => {
                    if (error)
                        console.log("Error uploading utilityBill to cloudinary");
                    imageData.utilityBill = result.secure_url;

                }
            );
        }


        if (req.files.registrationCertificate) {
            await cloudinary.uploader.upload(
                req.files.registrationCertificate[0].path, {
                    public_id: `registration-certificate/${name.split(" ").join("-")}-registration-certificate`,
                },
                (error, result) => {
                    if (error)
                        console.log("Error uploading registration Certificate to cloudinary");
                    imageData.registrationCertificate = result.secure_url;

                }
            );
        }
        if (req.files.otherDocuments) {
            await cloudinary.uploader.upload(
                req.files.otherDocuments[0].path, {
                    public_id: `other-documents/${name.split(" ").join("-")}-other-documents`,
                },
                (error, result) => {
                    if (error)
                        console.log("Error uploading other Documents to cloudinary");
                    imageData.otherDocuments = result.secure_url;

                }
            );
        }

        if (req.files.tinCertificate) {
            await cloudinary.uploader.upload(
                req.files.tinCertificate[0].path, {
                    public_id: `tin-certificate/${name.split(" ").join("-")}-tin-certificate`,
                },
                (error, result) => {
                    if (error)
                        console.log("Error uploading other Documents to cloudinary");
                    imageData.tinCertificate = result.secure_url;

                }
            );
        }

        let userId = req.user.id
        const business = db.businesses.create({
            name,
            tradingName,
            businessType,
            description,
            yearOfOperation,
            address,
            country,
            tin,
            userId,
            rcNumber,
            state,
            utilityBill: imageData.utilityBill,
            registrationCertificate: imageData.registrationCertificate,
            otherDocuments: imageData.otherDocuments,
            tinCertificate: imageData.tinCertificate
        })

        const businesAlias =

            res.status(201).send({ message: "Business Created", statuscode: 201, type: "success", data: { business } });
    }
);

businessRouter.get(
    '/api/v1/business/:userId',
    validateRequest,
    authenticate,
    async(req, res) => {
        const { userId } = req.params;
        const business = await db.businesses.findAll({ where: { userId } });
        res.status(200).send({ message: `${business.length?"Business fetched":"You do not currently have any business setup"}`, statuscode: 200, data: { business } });
    }
);

businessRouter.get(
    '/api/v1/business/alias/:alias',
    validateRequest,
    authenticate,
    async(req, res) => {
        const { alias } = req.params;
        const existingAlias = await db.aliases.findOne({ where: { name: alias } });
        if (existingAlias) {
            throw new BadRequestError("Business alias already in use please choose another alias")
        }
        res.status(200).send({ message: `Business alias ${alias} available`, statuscode: 200, data: { alias } });
    }
);
businessRouter.patch(
    '/api/v1/business/:businessId',
    validateRequest,
    authenticate,
    async(req, res) => {
        const { businessId } = req.params

        const existingBusines = await db.businesses.findOne({ where: { businessId } });
        if (!existingBusines) {
            throw new BadRequestError('Invalid business id');
        }
        res.status(200).send({ message: "Business updated successfully", statuscode: 200, data: { user: existingUser, verificationCode } });
    }
);


module.exports = { businessRouter };