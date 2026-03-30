import { Publisher, Subjects, UrlClickedEvent } from "@zeroop-dev/common/build/url-shortner/events";

export class UrlClickedPublisher extends Publisher<UrlClickedEvent> {
    subject: Subjects.UrlClick = Subjects.UrlClick
}