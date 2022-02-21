require("dotenv").config();
const express = require("express")
const path = require("path");
const cors = require("cors")
require('express-async-errors');
const cookieSession = require('cookie-session');
const { errorHandler, NotFoundError } = require('@bc_tickets/common');
const { businessRouter } = require('./routes/index');


const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '50mb' }));
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")));

app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV != 'test',
    })
);

app.get("/", (req, res) => {
    res.send("testing staff endpoint")
})
app.use(businessRouter);
app.all('*', async() => {
    throw new NotFoundError();
});

app.use(errorHandler);

module.exports = { app };