const Joi = require('@hapi/joi');

// validate customer data
module.exports.validate = function validate(req) {
    const schema = Joi.object({
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
        tax: Joi.string()
    });

    return schema.validate(req);
};
