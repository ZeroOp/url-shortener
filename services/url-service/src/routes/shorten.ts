import { validateRequest } from '@zeroop-dev/common/build/url-shortner/middlewares';
import express, {Request, Response} from 'express'
import { body } from 'express-validator';
import { idGenerator } from '../services/id-generator.service';
import { Url } from '../models/url';
import { BadRequestError } from '@zeroop-dev/common/build/url-shortner/errors';
import { checkAliasConflict, findExistingAnonymousUrl, validateReservedWords } from './url-helper';

const router = express.Router();

router.post('/shorten',
    [
        body('longUrl').isURL().withMessage('Valid Long URL is required'),
        body('isAliased').isBoolean(),
        body('customAlias').optional().isString().isLength({ min: 3, max: 30 }),
        body('expiresAt').optional().isISO8601()
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { longUrl, isAliased, expiresAt, customAlias } = req.body;
        const currentUserId = req.currentUser ? req.currentUser.id : null;

        // --- PHASE 1: CUSTOM ALIAS VALIDATION ---
        if (isAliased) {
            // Requirement: User must be authenticated for custom URLs
            if (!currentUserId) {
                throw new BadRequestError('Authentication required to create custom aliases');
            }
            if (!customAlias) {
                throw new BadRequestError('Custom alias is required when isAliased is true');
            }

            validateReservedWords(customAlias);
            await checkAliasConflict(customAlias);
        }

        // --- PHASE 2: DEDUPLICATION ---
        // Only skip generation if it's a standard random link
        if (!isAliased) {
            const existingUrl = await findExistingAnonymousUrl(longUrl, currentUserId);

            if (existingUrl) {
                return res.status(200).send(existingUrl);
            }
        }

        // --- PHASE 3: EXECUTION ---
        const shortUrlCode = isAliased ? customAlias : await idGenerator.getNextShortCode();

        const url = Url.build({
            userId: currentUserId, // Use null for DB consistency
            longUrl,
            shortUrl: shortUrlCode,
            isAliased,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined
        });

        await url.save();
        res.status(201).send(url);
    }
);

export { router as shortenLongUrl }