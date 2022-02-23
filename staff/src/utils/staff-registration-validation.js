const { body } = require('express-validator');
const staffRegistrationValidation = [
    body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required"),
    body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required"),
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required"),
    body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),
    body("dataOfBirth")
    .trim()
    .notEmpty()
    .withMessage("Date of birth is required"),
    body("businessId")
    .trim()
    .notEmpty()
    .withMessage("Business ID is required"),
    body("businessTradingName")
    .trim()
    .notEmpty()
    .withMessage("Business trading name is required"),
    body("businessAlias")
    .trim()
    .notEmpty()
    .withMessage("Business alias is required"),
    body("roleId")
    .trim()
    .notEmpty()
    .withMessage("roleId is required"),

]
module.exports = { staffRegistrationValidation }