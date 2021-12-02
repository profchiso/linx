const Joi = require('@hapi/joi');

// validate customer data
module.exports.validate = function validate(req) {
    const schema = Joi.object({
        businessName: Joi.string().required(),
        businessEmail: Joi.string().required(),
        businessPhoneNumber: Joi.string().required(),
        website: Joi.string(),
        companyLogo: Joi.string(),
        address: Joi.string().required(),
        country: Joi.string(),
        state: Joi.string(),
        lga: Joi.string(),
        firstName: Joi.string().required(),
        lastName: Joi.string(),
        email: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        alias: Joi.string(),
        businessId: Joi.number().required()
    });

    return schema.validate(req);
};