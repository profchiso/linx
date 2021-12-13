const { Invoice } = require("../models/invoice")
const axios = require("axios")
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate"
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

        const { customerEmail } = req.body;

        const invoice = Invoice.findById(req.params.id)

        if (!invoice) {
            throw new Error ('No Invoice found')
        }

        // transport object
        const mailOptions = {
            to: customerEmail,
            from: { email: 'noreply@linx.ng', name: 'LinX' },
            subject: 'Your Invoice',
            html: `<p>Here is your Invoice: ${invoice}</p>`,
        };

        await sendWithMailTrap(mailOptions);

        res.status(201).send({
            message: 'Invoice sent successfully',
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