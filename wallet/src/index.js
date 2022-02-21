require("dotenv").config();
require("express-async-errors");

const { app } = require("./app");

let PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
