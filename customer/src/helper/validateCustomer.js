const Joi = require("@hapi/joi");

// validate customer data
module.exports.validate = function validate(req) {
  const schema = Joi.object({
    businessName: Joi.string().required(),
    businessEmail: Joi.string().required(),
    businessPhoneNumber: Joi.string().required(),
    website: Joi.string().allow(""),
    companyLogo: Joi.string().allow(""),
    address: Joi.string().required(),
    country: Joi.string(),
    state: Joi.string(),
    lga: Joi.string(),
    firstName: Joi.string().required(),
    lastName: Joi.string().allow(""),
    email: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    alias: Joi.string().required(),
    businessId: Joi.number().required(),
  });

  return schema.validate(req);
};

//validate updated customer data
module.exports.validateUpdate = function validate(req) {
  const schema = Joi.object({
    businessName: Joi.string(),
    businessEmail: Joi.string(),
    businessPhoneNumber: Joi.string(),
    website: Joi.string(),
    companyLogo: Joi.string(),
    address: Joi.string(),
    country: Joi.string(),
    state: Joi.string(),
    lga: Joi.string(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string(),
    phoneNumber: Joi.string(),
    alias: Joi.string().required(),
    businessId: Joi.number().required(),
  });

  return schema.validate(req);
};
