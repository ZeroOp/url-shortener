"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const not_autherized_error_1 = require("../errors/not-autherized-error");
const requireAuth = (req, res, next) => {
    if (!req.currentUser) {
        throw new not_autherized_error_1.NotAuthorizedError();
    }
    next();
};
exports.requireAuth = requireAuth;
