const { Invoice } = require("../models/invoice")
const axios = require("axios")
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate"
const { validate } = require("../helper/validateInvoice");
const { sendWithMailTrap } = require("../helper/emailTransport");

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
        
        const { businessId, customerId, customerEmail } = req.body;

        businessId = req.params.businessId
        customerId = req.params.customerId

        const invoice = await Invoice.create(req.body);

            // transport object
        const mailOptions = {
            to: customerEmail,
            from: { email: 'noreply@linx.ng', name: 'LinX' },
            subject: 'Your Invoice',
            html: `<p>Here is your Invoice: ${invoice}</p>`,
        };

        await sendWithMailTrap(mailOptions);

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