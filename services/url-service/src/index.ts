import { app } from "./app";
import { redisClient } from "./redis-client";
import { cassandraWrapper } from "./cassandra-wrapper";

const start = async () => {
    // 1. Env Checks
    if (!process.env.CASSANDRA_CONTACT_POINTS || !process.env.CASSANDRA_LOCAL_DC) {
        throw new Error("CASSANDRA_CONTACT_POINTS and CASSANDRA_LOCAL_DC must be defined");
    }

    const contactPoints = process.env.CASSANDRA_CONTACT_POINTS.split(',');

    // 2. Initialize Redis
    console.log('[url] Initializing Redis...');
    await redisClient.ping();

    // 3. Connect Cassandra (The Wrapper now handles the retry loop internally)
    try {
        await cassandraWrapper.connect(
            contactPoints, 
            process.env.CASSANDRA_LOCAL_DC, 
            process.env.CASSANDRA_KEYSPACE
        );

        // 4. Log the state once connected
        const hosts = cassandraWrapper.client.getState().getConnectedHosts();
        hosts.forEach(h => console.log(`Connected to host: ${h.address}`));
    } catch (err) {
        console.error("Fatal: Could not connect to Cassandra", err);
        process.exit(1);
    }

    // 5. Start App
    app.listen(3000, () => {
        console.log("URL Service is listening on port 3000");
    });
}

start();