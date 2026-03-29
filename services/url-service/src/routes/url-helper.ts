import { BadRequestError } from '@zeroop-dev/common/build/url-shortner/errors';
import { Url, UrlStatus } from '../models/url';

/**
 * Ensures the requested alias isn't a system-reserved keyword.
 */
export const validateReservedWords = (alias: string) => {
    const reserved = ['api', 'r', 'admin', 'login', 'health', 'dashboard', 'static', 'auth'];
    if (reserved.includes(alias.toLowerCase())) {
        throw new BadRequestError('This alias is reserved for system use');
    }
};

/**
 * Checks if a custom alias is already active in the DB.
 */
export const checkAliasConflict = async (alias: string) => {
    const conflict = await Url.findOne({ 
        shortUrl: alias, 
        status: UrlStatus.Active 
    });
    if (conflict) {
        throw new BadRequestError('Custom alias already in use');
    }
};

/**
 * Checks for an existing active, non-aliased URL for this user.
 */
export const findExistingAnonymousUrl = async (longUrl: string, userId: string | null | undefined) => {
    return await Url.findOne({
        userId,
        longUrl,
        isAliased: false,
        status: UrlStatus.Active
    });
};