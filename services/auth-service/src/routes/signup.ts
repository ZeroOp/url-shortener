import express, { Request, Response} from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { validateRequest } from '@zeroop-dev/common/build/url-shortner/middlewares';
import { BadRequestError } from '@zeroop-dev/common/build/url-shortner/errors';

const router = express.Router();

router.post('/api/users/signup' ,[
       body('email')
         .isEmail()
            .withMessage('Email must be valid'),
       body('password')
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage('Password must be between 4 and 20 characters')
    ],
    validateRequest,
    async (req: Request, res: Response) => {

    const { email, password } = req.body; 

    const existingUser = await User.findOne({
        email
    });

    if (existingUser) {
        throw new BadRequestError('Emain in use');
    }
    
    const user = User.build({ email, password });
    await user.save(); // we need to save the created user to the databaase. 

    // Generate JWT 
    const userJWT = jwt.sign({
        id: user._id,
        email: user.email
    },
        process.env.JWT_KEY!,
        { expiresIn: '1d' }
    );
    // Store it on session Object
    req.session = { jwt: userJWT };
    res.status(201).send(user);
});

export { router as signupRouter }