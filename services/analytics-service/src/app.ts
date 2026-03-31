import express from 'express';
import { json } from 'body-parser'
import cookieSession from 'cookie-session';
import { currentUser, errorHandler } from '@zeroop-dev/common/build/url-shortner/middlewares';
import { dashboardRouter } from './routes/dashboardRouter';
import { linkDetailsRouter } from './routes/linkDetailsRouter';
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

app.use(dashboardRouter);
app.use(linkDetailsRouter);


app.use(errorHandler);

export { app };