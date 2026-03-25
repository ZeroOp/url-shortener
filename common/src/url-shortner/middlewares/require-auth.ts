import {Request, Response, NextFunction} from 'express';
import { NotAuthorizedError } from '../url-shortner/errors/not-autherized-error';

export const requireAuth = (req: Request , res: Response , next: NextFunction) => {
    if (!req.currentUser) {
        throw new NotAuthorizedError();
    }
    next();
};