const { Invoice } = require("../models/invoice");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";
const { validate } = require("../helper/validateInvoice");
const { sendMailWithSendGrid } = require("../helper/emailTransport");

module.exports = async (req, res) => {
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

    let { businessId, customerId, customerEmail, status } = req.body;

    if (status == "draft") {
      businessId = req.params.businessId;
      customerId = req.params.customerId;

      const invoice = await Invoice.create(req.body);
      res.status(201).send({
        message: "Invoice saved as draft",
        statuscode: 201,
        type: "success",
        data: {
          invoice,
        },
      });
    } else {
      const n = await Invoice.estimatedDocumentCount();

      let id = n + 1;

      businessId = req.params.businessId;
      customerId = req.params.customerId;

      const generateURL = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/invoice/preview/${id}`;

      const invoice = await Invoice.create(req.body);

      invoice.urlLink = generateURL;

      invoice.id = id;

      await invoice.save();

      // transport object
      const mailOptions = {
        to: customerEmail,
        from: process.env.SENDER_EMAIL,
        subject: "Your Invoice",
        html: `<p>Here is your Invoice: ${invoice}</p>`,
      };

      await sendMailWithSendGrid(mailOptions);
      res.status(201).send({
        message: "Invoice created",
        statuscode: 201,
        type: "success",
        data: {
          invoice,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      statuscode: 500,
      errors: [{ message: error.message || "internal server error" }],
    });
  }
};
