const Joi = require("@hapi/joi");

// validate pin data
module.exports.validate = function validate(req) {
  const schema = Joi.object({
    walletId: Joi.number().required(),
    ownerId: Joi.number().required(),
    userId: Joi.number(),
    userType: Joi.string().required(),
    alias: Joi.string(),
    walletPin: Joi.string().required(),
  });

  return schema.validate(req);
};

// validate pin data
module.exports.validatePin = function validate(req) {
    const schema = Joi.object({
      walletId: Joi.number().required(),
      ownerId: Joi.number().required(),
      userId: Joi.number(),
      userType: Joi.string().required(),
      alias: Joi.string().required(),
      walletPin: Joi.string().required(),
    });
  
    return schema.validate(req);
  };