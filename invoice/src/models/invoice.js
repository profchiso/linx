const mongoose = require("mongoose");

// const connectDB = require('../startup/db');

// autoIncrement.initialize(mongoose.connection);

const invoiceSchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
    status: {
      type: String,
      enum: {
        values: ["create", "draft"],
      },
      default: "create",
    },
    client: String,
    date: Number,
    amount: Number,
    paymentMethod: {
      type: String,
      enum: {
        values: ["wallet", "bank"],
      },
      default: "wallet",
    },
    goodsDetail: [
      {
        description: { type: String, required: true, lowercase: true },
        cost: { type: Number, required: true, lowercase: true },
        quantity: { type: Number, required: true, lowercase: true },
        totalAmount: { type: Number, lowercase: true, default: 0 },
      },
    ],
    discount: Number,
    tax: Number,
    businessId: Number,
    customerId: Number,
    customerEmail: String,
    bankName: String,
    accountNumber: String,
    walletId: Number,
    urlLink: String,
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

exports.Invoice = Invoice;
