const Joi = require('@hapi/joi');

// validate customer data
module.exports.validate = function validate(req) {
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
            })
          ),
        discount: Joi.string(),
        tax: Joi.string(),
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
