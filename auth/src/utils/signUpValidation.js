const { body } = require("express-validator")


//USER REGISTRATION VALIDATION
const signUpValidations = [
    body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Firstname cannot be empty'),
    body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Lastname cannot be empty'),
    body('email')
    .isEmail()
    .withMessage('Email must be valid')
    .notEmpty()
    .withMessage("Email field is required"),
    body('phone')
    .notEmpty()
    .withMessage('Phone number cannot be empty'),
    body('password')
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Password must be between 8 and 20 characters'),
]
module.exports = { signUpValidations }