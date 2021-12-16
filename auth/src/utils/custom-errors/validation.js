export class ValidationError extends Error {
    constructor(errors) {
        super()
        Object.setPrototypeOf(this, Validation.prototype())
    }
}