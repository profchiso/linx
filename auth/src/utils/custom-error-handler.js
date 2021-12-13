const { ValidationError } = require("./custom-errors/validation")
const { AuthenticationError } = require("./custom-errors/authentication")
const { AuthorizationError } = require("./custom-errors/authorization")
const { DatabaseError } = require("./custom-errors/database")

const errorHandler = (err, req, res, next) => {

    if (err instanceof ValidationError) {
        let formattedErrors = err.errors.map(e => {
            return { message: e.msg, field: e.param }
        })
        return res.status(400).json({ errors: formattedErrors, statusCode: 400, success: false })

    }

    if (err instanceof AuthenticationError) {

        return res.status(400).json({ errors: formattedErrors, statusCode: 400, success: false })

    }
    if (err instanceof AuthorizationError) {
        return res.status(400).json({ errors: formattedErrors, statusCode: 400, success: false })

    }
    if (err instanceof DatabaseError) {
        return res.status(400).json({ errors: formattedErrors, statusCode: 400, success: false })

    }

}