const Joi = require("@hapi/joi");

// validate customer data
module.exports.validate = function validate(req) {
  const schema = Joi.object({
    id: Joi.number(),
    name: Joi.string().required(),
    status: Joi.string().valid("draft", "pending").required(),
    client: Joi.string().required(),
    date: Joi.number(),
    amount: Joi.number(),
    PaymentMethod: Joi.string().required(),
    goodsDetail: Joi.array().items(
      Joi.object({
        description: Joi.string(),
        cost: Joi.number(),
        quantity: Joi.number(),
        totalAmount: Joi.number(),
      })
    ),
    discount: Joi.number(),
    vat: Joi.number(),
    businessId: Joi.number(),
    customerId: Joi.number(),
    walletId: Joi.number(),
    customerEmail: Joi.string(),
    bankName: Joi.string(),
    accountNumber: Joi.string(),
    urlLink: Joi.string(),
  });

  return schema.validate(req);
};

// validate edit invoice data
module.exports.validateUpdate = function validate(req) {
  const schema = Joi.object({
    id: Joi.number(),
    name: Joi.string().required(),
    status: Joi.string().required(),
    client: Joi.string().required(),
    date: Joi.number(),
    amount: Joi.number(),
    PaymentMethod: Joi.string().required(),
    goodsDetail: Joi.array().items(
      Joi.object({
        description: Joi.string(),
        cost: Joi.number(),
        quantity: Joi.number(),
        totalAmount: Joi.number(),
      })
    ),
    discount: Joi.string(),
    vat: Joi.string(),
    businessId: Joi.number(),
    customerId: Joi.number(),
    walletId: Joi.number(),
    customerEmail: Joi.string(),
    bankName: Joi.string(),
    accountNumber: Joi.string(),
    urlLink: Joi.string(),
  });

  return schema.validate(req);
};

// validate invoice data to save as draft
module.exports.validateDraftUpdate = function validate(req) {
  const schema = Joi.object({
    status: Joi.string().valid("draft").required(),
  });

  return schema.validate(req);
};
