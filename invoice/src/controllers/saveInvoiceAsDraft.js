const { Invoice } = require("../models/invoice");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";
const { validateDraftUpdate } = require("../helper/validateInvoice");

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

    // //authenticate user
    // const { data } = await axios.get(`${AUTH_URL}`, {
    //   headers: {
    //     authorization: req.headers.authorization,
    //   },
    // });
    // //check if user is not authenticated
    // if (!data.user) {
    //   return res.status(401).send({
    //     message: `Access denied, you are not authenticated`,
    //     statuscode: 401,
    //     errors: [{ message: `Access denied, you are not authenticated` }],
    //   });
    // }

    // invoice validation
    const { error } = validateDraftUpdate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const invoice = await Invoice.findOne({
      id: req.params.id,
      businessId: req.params.businessId,
      customerId: req.params.customerId,
    });

    if (!invoice) {
      throw new Error("Invoice cannot be found");
    }

    if (invoice.status == "sent") {
      throw new Error("You cannot save an already sent invoice as draft");
    }

    invoice.status = "draft";

    await invoice.save();

    // Send response
    res.status(200).send({
      message: "Invoice saved as draft",
      statuscode: 200,
      type: "success",
      data: {
        invoice,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      statuscode: 500,
      errors: [{ message: error.message || "internal server error" }],
    });
  }
};
