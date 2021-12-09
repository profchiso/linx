require("dotenv").config();
require('express-async-errors');

const connectDB = require('./startup/db');

process.on('uncaughtException', (err) => {
  console.error('UNHANDLED EXCEPTION!');
  process.exit(1);
});

const { app } = require('./app');

// Connect to database
connectDB();

let PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});


process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION!');
  process.exit(1);
});
