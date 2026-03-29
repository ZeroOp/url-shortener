import { Subjects } from "./subjects";

export interface UrlExpiredEvent {
    subject: Subjects.UrlExpired;
    data: {
        shortUrl: string;
    };
}