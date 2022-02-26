require("dotenv").config();
const express = require("express")
const cronJob = require("node-cron")
const path = require("path");
const cors = require("cors")
require('express-async-errors');
const cookieSession = require('cookie-session');
const { errorHandler, NotFoundError } = require('@bc_tickets/common');
const { staffRouter } = require('./routes/index');
const { getStaffWalletFromQueueAndUpdate } = require("./utils/updateStaffWallet")


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
    console.log("host", req.hostname, )
    console.log("base url", req.baseUrl)
    console.log("req protocol", req.protocol)
    res.send("testing staff endpoint")
})
app.use(staffRouter);
app.all('*', async() => {
    throw new NotFoundError();
});

app.use(errorHandler);
cronJob.schedule("*/1 * * * *", async() => {
    await getStaffWalletFromQueueAndUpdate()

})

module.exports = { app };