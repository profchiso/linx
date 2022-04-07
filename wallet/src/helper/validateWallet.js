const Joi = require("@hapi/joi");

// validate wallet data
module.exports.validate = function validate(req) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    businessId: Joi.number().required(),
    staffId: Joi.number(),
    userId: Joi.number().required(),
    walletType: Joi.string(),
    credit: Joi.number(),
    debit: Joi.number(),
    balance: Joi.string(),
    alias: Joi.string().required(),
    category: Joi.string().required(),
    country: Joi.string(),
  });

  return schema.validate(req);
};

// validate wallet transaction data
module.exports.validateWalletCreditData = function validate(req) {
  const schema = Joi.object({
    recipientWalletId: Joi.number().required(),
    businessId: Joi.number().required(),
    staffId: Joi.number(),
    amount: Joi.number().required(),
    recipientType: Joi.string().required(),
    walletOwnerEmail: Joi.string().required(),
    recipientEmail: Joi.string().required(),
    description: Joi.string(),
    recipientWalletAccountNumber: Joi.number().required(),
  });

  return schema.validate(req);
};
// validate wallet transaction data
module.exports.validateMultipleWalletsCreditData = function validate(req) {
  const schema = Joi.object({
    walletsArray: Joi.array().items(
      Joi.object({
        recipientWalletId: Joi.number().required(),
        amount: Joi.number().required(),
        recipientType: Joi.string().required(),
        walletOwnerEmail: Joi.string(),
        recipientEmail: Joi.string().required(),
        description: Joi.string(),
        recipientWalletAccountNumber: Joi.number().required(),
      })
    ),
    totalAmount: Joi.number().required(),
    walletOwnerEmail: Joi.string().required(),
    businessId: Joi.number().required(),
    staffId: Joi.number(),
  });

  return schema.validate(req);
};

// validate beneficiary data
module.exports.validateBeneficiaryData = function validate(req) {
  const schema = Joi.object({
    bankName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    beneficiaryWalletId: Joi.number().required(),
  });

  return schema.validate(req);
};
// validate beneficiaries data
module.exports.validateBeneficiariesData = function validate(req) {
  const schema = Joi.object({
    beneficiaries: Joi.array().items(
      Joi.object({
        bankName: Joi.string().required(),
        accountNumber: Joi.string().required(),
        beneficiaryWalletId: Joi.number().required(),
      })
    ),
  });

  return schema.validate(req);
};
