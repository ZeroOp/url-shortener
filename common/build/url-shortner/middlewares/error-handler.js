"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../errors");
const errorHandler = (err, req, res, next) => {
    if (err instanceof errors_1.CustomError) {
        return res.status(err.statusCode).send({ errors: err.serializeErrors() });
    }
    console.log(err); // if something went wrong that we are not expecting we will log that error .  
    res.status(400).send({
        errors: [
            {
                message: 'Something went wrong'
            }
        ]
    });
};
exports.errorHandler = errorHandler;
