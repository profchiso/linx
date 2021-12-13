export class AuthenticationError extends Error {
    constructor(errors) {
        super()
        Object.setPrototypeOf(this, Authentication.prototype())
    }
}