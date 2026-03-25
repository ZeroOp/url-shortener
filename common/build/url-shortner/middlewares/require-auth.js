"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const errors_1 = require("../errors");
const requireAuth = (req, res, next) => {
    if (!req.currentUser) {
        throw new errors_1.NotAuthorizedError();
    }
    next();
};
exports.requireAuth = requireAuth;
