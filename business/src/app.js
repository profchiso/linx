const express = require("express")

const cors = require("cors")

require('express-async-errors');

const cookieSession = require('cookie-session');
const { errorHandler, NotFoundError } = require('@bc_tickets/common');

// const { currentUserRouter } = require('./routes/current-user');
// const { signinRouter } = require('./routes/signin');
// const { signoutRouter } = require('./routes/signout');
// const { signupRouter } = require('./routes/signup');

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV != 'test',
    })
);

app.get("/", (req, res) => {
        res.send("testing business endpoint")
    })
    // app.use(currentUserRouter);
    // app.use(signinRouter);
    // app.use(signoutRouter);
    // app.use(signupRouter);

app.all('*', async() => {
    throw new NotFoundError();
});

app.use(errorHandler);

module.exports = { app };