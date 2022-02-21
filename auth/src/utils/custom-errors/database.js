export class DatabaseError extends Error {
    constructor(errors) {
        super()
        Object.setPrototypeOf(this, DatabaseError.prototype())
    }
}