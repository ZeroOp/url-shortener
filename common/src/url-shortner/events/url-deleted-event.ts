import { Subjects } from "./subjects";

export interface UrlDeletedEvent {
    subject: Subjects.UrlDeleted;
    data: {
        shortUrl: string;
        userId: string; // Only authenticated users can delete
    };
}