import { Subjects } from "./subjects";
import { UrlStatus } from "./types/url-status";

export interface UrlCreatedEvent {
    subject: Subjects.UrlCreated;
    data: { 
        id: string,
        status: UrlStatus,
        longUrl: string,
        userId: string | null,
        expiresAt?: string,
        shortUrl: string,
        isAliased: boolean,
        version: number
    }
}