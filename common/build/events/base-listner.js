"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listener = void 0;
class Listener {
    client;
    ackWait = 5 * 1000; // 5 seconds.
    constructor(client) {
        this.client = client;
    }
    subscriptionOptionis() {
        return this.client.subscriptionOptions()
            .setDeliverAllAvailable()
            .setManualAckMode(true)
            .setAckWait(this.ackWait)
            .setDurableName(this.queueGroupName);
    }
    listen() {
        const subscription = this.client.subscribe(this.subject, this.queueGroupName, this.subscriptionOptionis());
        subscription.on('message', (msg) => {
            console.log(`Message recived: ${this.subject} / ${this.queueGroupName}`);
            const parseData = this.parseMessage(msg);
            this.onMessage(parseData, msg);
        });
    }
    parseMessage(msg) {
        const data = msg.getData();
        return typeof data === 'string'
            ? JSON.parse(data)
            : JSON.parse(data.toString('utf-8'));
    }
}
exports.Listener = Listener;
