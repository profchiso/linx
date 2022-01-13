const express = require("express");
const AWS = require('aws-sdk');
const { uuid } = require('uuidv4')
const { body } = require('express-validator');
const axios = require("axios")
const { validateRequest, BadRequestError, NotFoundError, NotAuthorisedError } = require("@bc_tickets/common");
//const { staffRegistrationValidation } = require("../utils/payroll-registration-validation")
// const { upload, cloudinary } = require("../utils/imageProcessing")
const db = require("../models/index")
const payrallRouter = express.Router();
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate"
    // Configure the region 
AWS.config.update({ region: 'us-east-1' });
AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const queueUrl = "https://sqs.us-east-1.amazonaws.com/322544062396/linxqueue";




//GET ALL PAYROLL ENTERY
payrallRouter.get(
    '/api/v1/payroll',
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
            const payroll = await db.payroll.findAll({});

            res.status(200).send({ message: "All payroll Fetched", statuscode: 200, data: { payroll } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }
    }
);

//CREATE A PAYROLL ENTERY
payrallRouter.post(
    '/api/v1/payroll',
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

            let batchId = uuid()

            let createdPayrolls = []
            const { payroll } = req.body
            for (let pay of payroll) {

                let createdPayroll = await db.payroll.create({
                    businessId: pay.businessId,
                    businessTradingName: pay.businessTradingName,
                    fullName: pay.fullName,
                    salary: pay.salary,
                    bonus: pay.bonus,
                    deduction: pay.deduction,
                    totalPayable: pay.totalPayable,
                    paymentAccountType: pay.paymentAccountType,
                    staffId: pay.staffId,
                    businessPaymentWallet: pay.businessPaymentWallet,
                    staffWallet: pay.staffWallet,
                    transactionType: pay.transactionType,
                    batchId

                })

                //debit business wallet on each pay

                //credit staff wallet on pay

                let returnData = {...createdPayroll.dataValues }
                createdPayrolls.push(returnData)

            }
            res.status(201).send({ message: `${createdPayrolls.length}  staff from  buiness with trading name of ${createdPayrolls[0].businessTradingName}`, statuscode: 201, type: "success", data: { payrolls: createdPayrolls } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }

    }
);

//GET  PAYROLL RECORDS FOR A BUSINESS
payrallRouter.get(
    '/api/v1/payroll/business/:businessId',
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
            const myBusinessPayroll = await db.payroll.findAll({ where: { businessId } });


            res.status(200).send({ message: `Payroll record  for Business ${businessId}`, statuscode: 200, data: { myBusinessPayroll } });

        } catch (error) {
            console.log(error)

        }

    }
);

//GET A PAYROLL RECORD
payrallRouter.get(
    '/api/v1/payroll/:payrollId',
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

            const { payrollId } = req.params;


            const foundPayroll = await db.payroll.findOne({ where: { id: payrollId } });

            res.status(200).send({ message: `Staff fetched`, statuscode: 200, data: { payroll: foundPayroll } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }

    }
);


//UPDATE A PAYROLL RECORD
payrallRouter.patch(
    '/api/v1/payroll/:payrollId',
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

            const { payrollId } = req.params;

            const updatedPayroll = await db.payroll.update(req.body, { where: { id: payrollId }, returning: true, plain: true })

            res.status(200).send({ message: `Payroll record updated`, statuscode: 200, data: { payroll: updatedPayroll[1] } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }


    }
);

//DELETE PAYROLL
payrallRouter.delete(
    '/api/v1/payroll/:payrollId',
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

            const { payrollId } = req.params

            await db.payroll.destroy({ where: { payrollId } });

            res.status(204).send({ message: "Staff deleted", statuscode: 204, data: { payroll: {} } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }

    }
);


module.exports = { payrallRouter };