const { body } = require('express-validator');
const businessRegistrationValidation = [
    body("name").notEmpty().withMessage("Business name is required"),
    body("tradingName").notEmpty().withMessage("Business trading name is required"),
    body("businessType").notEmpty().withMessage("Business type is required"),
    body("description").notEmpty().withMessage("Business description is required"),
    body("yearOfOperation").notEmpty().withMessage("Business year of operation is required"),
    body("address").notEmpty().withMessage("Business address is required"),
    body("country").notEmpty().withMessage("Country of business is required"),
    body("tin").notEmpty().withMessage("Tax identification number is required"),
    body("rcNumber").notEmpty().withMessage("Rc number is required"),
    body("state").notEmpty().withMessage("State is required")
]
module.exports = { businessRegistrationValidation }