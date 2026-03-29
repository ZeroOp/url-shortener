import { Publisher, Subjects, UrlCreatedEvent } from "@zeroop-dev/common/build/url-shortner/events";

export class UrlCreatedPublisher extends Publisher<UrlCreatedEvent> {
    subject: Subjects.UrlCreated = Subjects.UrlCreated;
}