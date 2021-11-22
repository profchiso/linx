const { body } = require('express-validator');
const businessRegistrationValidation = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Business name is required"),
    body("tradingName")
    .trim()
    .notEmpty()
    .withMessage("Business trading name is required"),
    body("businessType")
    .trim()
    .notEmpty()
    .withMessage("Business type is required"),
    body("description")
    .trim()
    .notEmpty()
    .withMessage("Business description is required"),
    body("yearOfOperation")
    .trim()
    .notEmpty()
    .withMessage("Business year of operation is required"),
    body("address")
    .trim()
    .notEmpty()
    .withMessage("Business address is required"),
    body("country")
    .trim()
    .notEmpty()
    .withMessage("Country of business is required"),
    body("tin")
    .trim()
    .notEmpty()
    .withMessage("Tax identification number is required"),
    body("rcNumber")
    .trim()
    .notEmpty()
    .withMessage("Rc number is required"),
    body("state")
    .trim()
    .notEmpty()
    .withMessage("State is required"),
    body("alias")
    .trim()
    .notEmpty()
    .withMessage("Business alias is required"),
    body("utilityBillType")
    .trim()
    .notEmpty()
    .withMessage("Utility type is required"),

]
module.exports = { businessRegistrationValidation }