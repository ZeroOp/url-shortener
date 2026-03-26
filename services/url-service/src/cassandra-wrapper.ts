import { Client } from "cassandra-driver";

class CassandraWrapper {
    private _client?: Client;

    get client() {
        if (!this._client) {
            throw new Error("Cannot access Cassandra client before connecting");
        }
        return this._client;
    }

    async connect(contactPoints: string[], localDataCenter: string, keyspace?: string) {
        this._client = new Client({
            contactPoints,
            localDataCenter,
            keyspace
        });

        // We wrap the retry logic inside the wrapper
        let connected = false;
        while (!connected) {
            try {
                console.log("Attempting to connect to Cassandra cluster...");
                await this._client.connect();
                connected = true;
                console.log("[url] ✅ Successfully connected to Cassandra!");
                
                const hosts = this._client.getState().getConnectedHosts();
                hosts.forEach(h => console.log(`Connected to host: ${h.address}`));
            } catch (err) {
                console.error("❌ Cassandra connection failed. Retrying in 5 seconds...");
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
}

export const cassandraWrapper = new CassandraWrapper();