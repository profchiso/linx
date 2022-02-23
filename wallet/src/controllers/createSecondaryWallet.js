const db = require("../models/index");
const { validate } = require("../helper/validateWallet");

module.exports = async (req, res) => {
  //authenticate user
  const { data } = await axios.get(`${AUTH_URL}`, {
    headers: {
      authorization: req.headers.authorization,
    },
  });
  //check if user is not authenticated
  if (!data.user) {
    return res.status(401).send({
      message: `Access denied, you are not authenticated`,
      statuscode: 401,
      errors: [{ message: `Access denied, you are not authenticated` }],
    });
  }

  // wallet validation
  const { error } = validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  let createdSecondaryWallet = await db.wallet.create({
    walletId: Number(Date.now().toString().substring(0, 10)),
    name: req.body.name,
    email: req.body.email,
    businessId: req.body.businessId,
    staffId: req.body.staffId || null,
    userId: req.body.userId,
    walletType: "Secondary",
    credit: 0,
    debit: 0,
    balance: 0,
    alias: req.body.alias,
    category: req.body.category,
    country: req.body.country || "Nigeria",
  });

  res.status(201).send({
    message: "Secondary wallet created successfully",
    statuscode: 201,
    data: { createdSecondaryWallet },
  });
};
