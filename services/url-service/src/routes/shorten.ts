import { validateRequest } from '@zeroop-dev/common/build/url-shortner/middlewares';
import express, {Request, Response} from 'express'
import { body } from 'express-validator';

const router = express.Router();

router.post('/shorten' ,
    [
        body('originalUrl')
        .not().isEmpty()
    ],
    validateRequest,
    (req: Request, res: Response) => {
        console.log("Shortnen long url")
        res.send({});
});

export { router as shortenLongUrl }