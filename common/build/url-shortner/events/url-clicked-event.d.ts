import { Subjects } from "./subjects";
export interface UrlClickedEvent {
    subject: Subjects.UrlClick;
    data: {
        shortUrl: string;
        timestamp: string;
        userAgent?: string;
        ip?: string;
    };
}
