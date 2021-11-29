const Joi = require('@hapi/joi');

// validate wallet data
module.exports.validate = function validate(req) {
  const schema = Joi.object({
    name: Joi.string().required(),
    ownerId: Joi.number().required(),
    credit: Joi.number(),
    debit: Joi.number(),
    balance: Joi.string(),
  });

  return schema.validate(req);
};
