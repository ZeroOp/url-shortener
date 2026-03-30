import express from 'express';
import { json } from 'body-parser'
import cookieSession from 'cookie-session';
import { currentUser, errorHandler } from '@zeroop-dev/common/build/url-shortner/middlewares';
import { shortenLongUrl } from './routes/shorten';
import { NotFoundError } from '@zeroop-dev/common/build/url-shortner/errors';
import { redirectRouter } from './routes/redirect';
import { deleteUrlRouter } from './routes/delete';

const app = express();

app.set('trust proxy', true); // Required for Ingress/Nginx to pass headers correctly
app.use(json());

// Matches the session mechanism used by auth-service (cookie-session).
// Without this, req.session.jwt is always missing in url-service.
app.use(
  cookieSession({
    signed: false,
    secure: false, // test/dev friendly; keep consistent with auth-service
  })
);

app.use(currentUser);

app.use(deleteUrlRouter);
app.use('/api/url', shortenLongUrl);
app.use(redirectRouter);

// Instead of app.all(), just use a standard middleware at the end of your routes
app.use((req, res) => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };