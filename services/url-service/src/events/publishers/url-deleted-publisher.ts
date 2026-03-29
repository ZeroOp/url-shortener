import { Publisher, Subjects, UrlDeletedEvent } from "@zeroop-dev/common/build/url-shortner/events";

export class UrlDeletedPublisher extends Publisher<UrlDeletedEvent> {
    subject: Subjects.UrlDeleted = Subjects.UrlDeleted;
}