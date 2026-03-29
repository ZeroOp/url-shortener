import { Subjects } from "./subjects";
export interface UrlDeletedEvent {
    subject: Subjects.UrlDeleted;
    data: {
        shortUrl: string;
        userId: string;
    };
}
