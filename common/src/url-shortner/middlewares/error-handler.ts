import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../url-shortner/errors/custom-error';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {

    if (err instanceof CustomError) {
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
}