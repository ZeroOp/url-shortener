import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
    private _client?: Stan; // this tell type script that this property can be undefined for some point of time. 

    get client() {
        if (!this._client) {
            throw new Error("Cannot access NATS client before connecting")
        }
        return this._client;
    }

    connect(clusterId: string, clientId: string, url: string) {
        this._client = nats.connect(clusterId, clientId , { url });
        return new Promise<void>((resolve, reject) => {
            this.client.on('connect', () => {
                console.log('Connected to Nats');
                resolve();
            })
            this._client!.on('error', (err) => {
                reject(err);
            })
        })
    }

}

export const natsWrapper = new NatsWrapper();