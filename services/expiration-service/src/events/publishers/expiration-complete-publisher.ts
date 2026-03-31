import { Publisher, Subjects, UrlExpiredEvent } from "@zeroop-dev/common/build/url-shortner/events";

export class ExpirationCompletePublisher extends Publisher<UrlExpiredEvent> {
    subject: Subjects.UrlExpired = Subjects.UrlExpired;
}