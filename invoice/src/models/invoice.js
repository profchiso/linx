const mongoose = require('mongoose');

// const connectDB = require('../startup/db');

// autoIncrement.initialize(mongoose.connection);

const Invoice = mongoose.model(
  'Invoice',
  new mongoose.Schema(
    {
      name: String,
      status: String,
      client: String,
      date: Number,
      amount: Number,
      paymentMethod: {
        type: String,
        enum: {
          values: ['wallet', 'bank'],
        },
        default: 'wallet',
      },
      goodsDetail: [
        {
          description: { type: String, required: true, lowercase: true },
          cost: { type: Number, required: true, lowercase: true },
          quantity: { type: Number, required: true, lowercase: true },
        },
      ],
      discount: Number,
      tax: Number,
      businessId: Number,
      customerId: Number,
      customerEmail: String,
    },
    {
      timestamps: true,
    }
  )
);


exports.invoiceSchema = Invoice;
