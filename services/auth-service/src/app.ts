import express from 'express';
import { json } from 'body-parser';

import cookieSession from 'cookie-session'
import { currentUserRouter } from './routes/current-user';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import { singinRouter } from './routes/signin';
import { NotFoundError } from '@zeroop-dev/common/build/url-shortner/errors';
import { errorHandler } from '@zeroop-dev/common/build/url-shortner/middlewares';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false  // in a test env we can make this false. 
  })
)

app.use(currentUserRouter);
app.use(signupRouter);
app.use(signoutRouter);
app.use(singinRouter);

app.use(() => {
  throw new NotFoundError();
});

app.use(errorHandler);

export {app};