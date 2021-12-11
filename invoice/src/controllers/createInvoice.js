const { Invoice } = require("../models/invoice")
const axios = require("axios")
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate"
const { validate } = require("../helper/validateInvoice");

module.exports = async(req, res) => {
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
        // invoice validation
        const { error } = validate(req.body);
        if (error) {
            res.status(400);
            throw new Error(error.message);
        }

        const invoice = await Invoice.create(req.body);

        res.status(201).send({
            message: "Invoice Created",
            statuscode: 201,
            type: "success",
            data: {
                invoice
            }
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong",
            statuscode: 500,
            errors: [{ message: error.message || "internal server error" }]
        })
    }
}