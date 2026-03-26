import express from 'express';
import { json } from 'body-parser'
import { currentUser, errorHandler } from '@zeroop-dev/common/build/url-shortner/middlewares';
import { shortenLongUrl } from './routes/shorten';
import { NotFoundError } from '@zeroop-dev/common/build/url-shortner/errors';

const app = express();

app.set('trust proxy', true); // Required for Ingress/Nginx to pass headers correctly
app.use(json());

app.use(currentUser);

app.use('/api/url', shortenLongUrl);

app.use(() => {
    throw new NotFoundError();
  });
  
app.use(errorHandler);

export { app };