"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestValidationError = void 0;
const custom_error_1 = require("./custom-error");
class RequestValidationError extends custom_error_1.CustomError {
    errors;
    statusCode = 400;
    constructor(errors) {
        super('Invalid request parameters');
        this.errors = errors;
        // only because we are extending a build in class
        Object.setPrototypeOf(this, RequestValidationError.prototype);
    }
    serializeErrors() {
        return this.errors.map((error) => {
            return {
                message: error.msg,
                field: error.param || error.path || 'unknown'
            };
        });
    }
}
exports.RequestValidationError = RequestValidationError;
