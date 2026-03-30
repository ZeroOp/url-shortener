import { requireAuth, validateRequest } from '@zeroop-dev/common/build/url-shortner/middlewares';
import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import { Url } from '../models/url';
import { UrlStatus } from '@zeroop-dev/common/build/url-shortner/events';
import { NotAuthorizedError, NotFoundError } from '@zeroop-dev/common/build/url-shortner/errors';
import { UrlDeletedPublisher } from '../events/publishers/url-deleted-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/url/:shortUrl' , 
    requireAuth
    , async (req: Request,res: Response) => {
        const { shortUrl } = req.params as { shortUrl: string };
        const currentUserId = req.currentUser!.id;
        const url = await Url.findOne({shortUrl: shortUrl , status: UrlStatus.Active});
        if(!url) {
            throw new NotFoundError();
        }
        if(url.userId !== currentUserId) {
            throw new NotAuthorizedError();
        }

        url.set({ status: UrlStatus.Deleted });

        url.save();

        new UrlDeletedPublisher(natsWrapper.client).publish({
            shortUrl ,
            userId: currentUserId
        })
        res.send({})
});

export { router as deleteUrlRouter }