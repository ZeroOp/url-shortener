import { Subjects } from "./subjects";

export interface UrlClickedEvent {
    subject: Subjects.UrlClick; // Based on your enum: "url:click"
    data: {
        shortUrl: string;
        timestamp: string;
        userAgent?: string;
        ip?: string;
        processingTimeMs: number;
    };
}