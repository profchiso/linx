export class AuthorizationError extends Error {
    constructor(errors) {
        super()
        Object.setPrototypeOf(this, AuthorizationError.prototype())
    }
}