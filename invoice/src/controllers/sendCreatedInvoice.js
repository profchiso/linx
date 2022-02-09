const { Invoice } = require("../models/invoice");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";
const { sendMailWithSendGrid } = require("../helper/emailTransport");
const { formatInvoiceMail } = require("../helper/emailFormat");

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

    const { customerEmail } = req.body;

    const invoice = await Invoice.findOne({
      id: req.params.id,
      businessId: req.params.businessId,
      customerId: req.params.customerId,
    });

    if (!invoice) {
      throw new Error("No Invoice found");
    }

    // if (invoice.status == "pending" || invoice.status == "draft" || invoice.status == "sent") {

    invoice.status = "sent";

    await invoice.save();

    // transport object
    const mailOptions = {
      to: customerEmail,
      from: process.env.SENDER_EMAIL,
      subject: "Your Invoice",
      html: formatInvoiceMail(invoice),
    };

    await sendMailWithSendGrid(mailOptions);

    return res.status(200).send({
      message: `Invoice sent successfully to ${customerEmail}`,
      statuscode: 200,
      type: "success",
      data: {
        invoice,
      },
    });
    //}
    //throw new Error("You can only send a draft or pending invoice");
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      statuscode: 500,
      errors: [{ message: error.message || "internal server error" }],
    });
  }
};
