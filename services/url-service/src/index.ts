import { app } from "./app";
import { UrlExpiredListner } from "./events/listeners/url-expired-listner";
import { natsWrapper } from "./nats-wrapper";
import { redisClient } from "./redis-client";
import mongoose from "mongoose";

const start = async () => {
    console.log('[url] Starting service...');

    // 1. Env Checks
    const requiredEnv = [
        'MONGO_URI',
        'JWT_KEY',
        'NATS_CLIENT_ID',
        'NATS_URL',
        'NATS_CLUSTER_ID'
    ];

    for (const env of requiredEnv) {
        if (!process.env[env]) {
            throw new Error(`${env} must be defined`);
        }
    }

    // 2. Connect NATS with Retry Logic
    // EAI_AGAIN happens when K8s DNS isn't ready yet. We retry 5 times.
    const connectNats = async (retries = 5) => {
        while (retries) {
            try {
                await natsWrapper.connect(
                    process.env.NATS_CLUSTER_ID!,
                    process.env.NATS_CLIENT_ID!,
                    process.env.NATS_URL!
                );

                natsWrapper.client.on('close', () => {
                    console.log('NATS connection closed!');
                    process.exit();
                });

                process.on('SIGINT', () => natsWrapper.client.close());
                process.on('SIGTERM', () => natsWrapper.client.close());
                
                return; // Success
            } catch (err) {
                retries -= 1;
                console.error(`[url] NATS connection failed. Retries left: ${retries}`, err);
                if (retries === 0) process.exit(1); // Exit if NATS is critical
                await new Promise(res => setTimeout(res, 5000)); // Wait 5s
            }
        }
    };

    await connectNats();

    // 3. Initialize Redis
    try {
        console.log('[url] Initializing Redis...');
        await redisClient.ping();
        console.log('[url] Redis Connected');
    } catch (err) {
        console.error("[url] Redis Connection Failed", err);
        // We don't exit(1) here as Redis might be used for caching only
    }

    // 4. Connect MongoDB
    try {
        console.log('[url] Connecting to MongoDB...');
        
        // Fix for Duplicate Index Warning: 
        // Ensure you only have one index definition for shortUrl in your models/url.ts
        await mongoose.connect(process.env.MONGO_URI!);

        console.log(`[url] Connected to MongoDB: ${mongoose.connection.name}`);
    } catch (err) {
        console.error("[url] Fatal: Could not connect to MongoDB", err);
        process.exit(1);
    }

    new UrlExpiredListner(natsWrapper.client).listen();

    // 5. Start App
    app.listen(3000, () => {
        console.log("[url] URL Service is listening on port 3000");
    });
}

start();