const db = require("../models/index")
const axios = require("axios")
const { BadRequestError, NotFoundError, NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate"
const { validate } = require("../helper/validateCustomer");

module.exports = async (req, res) => {

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
    // customer validation
    const { error } = validate(req.body);
    if (error) {
        res.status(400);
        throw new Error(error.message);
    }

    let createdCustomer = await db.customer.create({
        businessName: req.body.businessName,
        businessEmail: req.body.businessEmail,
        businessPhoneNumber: req.body.businessPhoneNumber,
        website: req.body.website,
        companyLogo: req.body.companyLogo,
        address: req.body.address,
        country: req.body.country,
        state: req.body.state,
        lga: req.body.lga,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        alias: req.body.alias,
    })

    res.status(201).send({ 
        message: "Customer Created", 
        statuscode: 201, 
        type: "success", 
        data: {
            customer: createdCustomer 
        } 
    });
}