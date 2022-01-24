const express = require("express");

const cors = require("cors");

require("express-async-errors");

const cookieSession = require("cookie-session");
const { errorHandler, NotFoundError } = require("@bc_tickets/common");
const db = require("../src/models/index");

const customerRouter = require("./routes/customer");

const app = express();
app.set("trust proxy", true);
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV != "test",
  })
);

app.get("/", (req, res) => {
  res.send("welcome to customer");
});
app.use(customerRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

module.exports = { app };
