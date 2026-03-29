import { validateRequest } from '@zeroop-dev/common/build/url-shortner/middlewares';
import express, {Request, Response} from 'express'
import { body } from 'express-validator';
import { idGenerator } from '../services/id-generator.service';
import { Url, UrlStatus } from '../models/url';
import { BadRequestError } from '@zeroop-dev/common/build/url-shortner/errors';

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
        const currentUser = req.currentUser;
        const { longUrl, isAliased, expiresAt, customAlias } = req.body;

        // 1. Handle Custom Alias (The "Bypass" Logic)
        if (isAliased) {
            if (!customAlias) {
                throw new BadRequestError('Custom alias is required when isAliased is true');
            }

            // Check Reserved Words (Prevents users from taking /api, /r, /login, etc.)
            const reserved = ['api', 'r', 'admin', 'login', 'health', 'dashboard'];
            if (reserved.includes(customAlias.toLowerCase())) {
                throw new BadRequestError('This alias is reserved for system use');
            }

            // Check if Custom Alias is already taken
            const conflict = await Url.findOne({ shortUrl: customAlias });
            if (conflict) {
                throw new BadRequestError('Custom alias already in use');
            }
        }

        // 2. Deduplication Check (Only for Anonymous/General links)
        // We use our { longUrl, userId, status } index here
        if (!isAliased) {
            const existingUrl = await Url.findOne({
                userId: currentUser ? currentUser.id : null,
                longUrl: longUrl,
                status: UrlStatus.Active // Match our index field name
            });

            if (existingUrl) {
                return res.status(200).send(existingUrl);
            }
        }

        // 3. Generate Short Code
        // If it's a custom alias, use it; otherwise, pull from your K8s-buffered generator
        const shortUrlCode = isAliased ? customAlias : await idGenerator.getNextShortCode();

        // 4. Build and Save
        const url = Url.build({
            userId: currentUser ? currentUser.id : undefined,
            longUrl: longUrl,
            shortUrl: shortUrlCode,
            isAliased: isAliased,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined
        });

        await url.save();

        // 5. Response (Include full object for frontend ease)
        res.status(201).send(url);
    }
);

export { router as shortenLongUrl }