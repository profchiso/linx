const jwt = require("jsonwebtoken");
const db = require("../models/index");
const { NotFoundError, NotAuthorisedError } = require("@bc_tickets/common");
const JWT_SECRET = process.env.JWT_KEY;

exports.authenticate = async(req, res, next) => {
    const apiError = {};
    try {
        //more robust implementation
        let accessToken;

        //check if token was sent along with the request and also that the user used the right authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            accessToken = req.headers.authorization.split(" ")[1];
        } else if (req.cookies.accessToken) {
            accessToken = req.cookies.accessToken;
        }

        //check if the access token actually exist
        if (!accessToken) {
            // apiError.message = `Acesss denied, No authorization token`;
            // apiError.success = false;
            // console.log("apiError", apiError);
            // return res.status(401).json(apiError);
            //return res.status(401).redirect('/');
            throw new NotAuthorisedError()
        }
        //decode the acesss token
        const decodedToken = await jwt.verify(accessToken, JWT_SECRET);

        //check if user exist   just to be sure the user had not bern deleted

        const user = await db.User.findOne({ where: { id: decodedToken.user.id } });
        if (!user) {
            // apiError.message = `Acesss denied, User with the token might have been deleted or deactivated`;
            // apiError.success = false;
            // console.log("apiError", apiError);
            // return res.status(401).json(apiError);
            // //return res.status(401).redirect(401, '/');
            throw new NotFoundError()
        }
        //Allow access to protected route
        req.user = user;
        res.locals.user = user;

        next();
    } catch (error) {
        console.log(error);
        if (error.message.includes("jwt expired")) {
            apiError.message = `jwt expired`;
            apiError.success = false;
            console.log("apiError", apiError);
            return res.status(401).json(apiError);
        }
        throw new NotAuthorisedError()
            // apiError.message = `Invalid accessToken`;
            // apiError.success = false;
            // console.log("apiError", apiError);
            // return res.status(401).json(apiError);
            //return res.status(401).rediect(401, '/');
    }
};

//only for rendered pages
exports.isLoggedIn = async(req, res, next) => {
    let accessToken;

    if (req.cookies.accessToken) {
        try {
            accessToken = req.cookies.accessToken;

            //decode the acesss token
            const decodedToken = await jwt.verify(accessToken, JWT_SECRET);

            //check if user exist   just to be sure the user had not bern deleted
            const user = await User.findById(decodedToken.user.id);
            if (!user) {
                return next();
            }
            //sender a variable to the rendered templete
            res.locals.user = user;
            req.user = user;

            return next();
        } catch (error) {
            return next();
        }
    }
    next();
};

exports.authorize = (userType) => {
    const apiError = {};
    return (req, res, next) => {
        if (!userType.includes(req.user.userType)) {
            apiError.message = `Sorry you are forbidden to carry out this operation`;
            apiError.success = false;
            console.log("apiError", apiError);
            return res.status(403).json(apiError);
        }
        next();
    };
};