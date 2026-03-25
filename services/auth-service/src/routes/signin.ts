import express , {Request, Response} from 'express'
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';


import { User } from '../models/user';
import { validateRequest } from '@zeroop-dev/common/build/url-shortner/middlewares';
import { BadRequestError } from '@zeroop-dev/common/build/url-shortner/errors';
import { Password } from '../utils/password';


const router = express.Router();

router.post('/api/users/signin', 
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a password')
    ],
    validateRequest
    ,
    async (req: Request,res: Response) => {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        const passwordsMatch: boolean = await Password.compare(existingUser.password, password);
        if(!passwordsMatch) {
            throw new BadRequestError('Invalid credentials');
        }
        const userJWT = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        }, process.env.JWT_KEY!);
        // Store it on session Object
        req.session = { jwt: userJWT };
        res.status(201).send(existingUser);
    }
);

export { router as singinRouter }