class ExpressError extends Error {
    constructor(message, statusCode) {
        super(message);               // sets the error message
        this.statusCode = statusCode; // custom status code for response
    }
}

