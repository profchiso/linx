const express = require("express");
const { uuid } = require('uuidv4')
const { body } = require('express-validator');
const axios = require("axios")
const { validateRequest, BadRequestError, NotFoundError, NotAuthorisedError } = require("@bc_tickets/common");
//const { staffRegistrationValidation } = require("../utils/payroll-registration-validation")
// const { upload, cloudinary } = require("../utils/imageProcessing")
const db = require("../models/index")
const payrollRouter = express.Router();
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate"

const queueUrl = process.env.PAYROLL_QUEUE_URL
const { sendDataToAWSQueue } = require("../utils/sendDataToQueue")




//GET ALL PAYROLL ENTERY
payrollRouter.get(
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
payrollRouter.post(
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
            const { payroll, totalAmount, businessEmail, businessTradingName } = req.body
            for (let pay of payroll) {
                console.log("pay", pay)

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
                    phone: pay.phone,
                    email: pay.email,
                    batchId,
                    totalAmount

                })

                let returnData = {...createdPayroll.dataValues }
                createdPayrolls.push(returnData)

            }
            //aws queue data
            let queueData = {
                businessId: createdPayrolls[0].businessId,
                totalAmount,
                businessEmail,
                businessPaymentWallet: createdPayrolls[0].businessPaymentWallet,
                staff: createdPayrolls
            }
            let queueResponse = await sendDataToAWSQueue(queueData, queueUrl)
            console.log("queue response", queueResponse)


            res.status(201).send({ message: `Payroll details for ${createdPayrolls.length}  staff from  buiness with trading name of ${createdPayrolls[0].businessTradingName}`, statuscode: 201, type: "success", data: { payrolls: createdPayrolls } });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong", statuscode: 500, errors: [{ message: error.message || "internal server error" }] })

        }

    }
);

//GET  PAYROLL RECORDS FOR A BUSINESS
payrollRouter.get(
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
payrollRouter.get(
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
payrollRouter.patch(
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
payrollRouter.delete(
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


module.exports = { payrollRouter };