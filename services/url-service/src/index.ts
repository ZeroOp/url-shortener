import { Client } from "cassandra-driver";
import { app } from "./app";
import { redisClient } from "./redis-client";

const start = async () => {
    if (!process.env.CASSANDRA_CONTACT_POINTS || !process.env.CASSANDRA_LOCAL_DC) {
        throw new Error("CASSANDRA_CONTACT_POINTS and CASSANDRA_LOCAL_DC must be defined");
    }

    const contactPoints = process.env.CASSANDRA_CONTACT_POINTS.split(',');

    const client = new Client({
        contactPoints: contactPoints,
        localDataCenter: process.env.CASSANDRA_LOCAL_DC,
        keyspace: process.env.CASSANDRA_KEYSPACE
    });

    console.log('[url] Initializing Redis...');
    await redisClient.ping();
    // redisClient.connect();

    let connected = false;
    while (!connected) {
        try {
            console.log("Attempting to connect to Cassandra cluster...");
            await client.connect();
            connected = true;
            console.log("Successfully connected to Cassandra!");
            
            // Log which node we actually hit
            const hosts = client.getState().getConnectedHosts();
            hosts.forEach(h => console.log(`Connected to host: ${h.address}`));
            
        } catch (err) {
            console.error("Cassandra connection failed. Retrying in 5 seconds...");
            // Wait 5 seconds before trying again
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    app.listen(3000, () => {
        console.log("URL Service is listening on port 3000");
    });

}

start();