import { app } from "./app";
import { redisClient } from "./redis-client";
import mongoose from "mongoose"; // Assuming you're using Mongoose for the URL service

const start = async () => {
    // 1. Env Checks (Updated for MongoDB)
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be defined");
    }

    // 2. Initialize Redis (Stays the same - great for 'hot' links!)
    try {
        console.log('[url] Initializing Redis...');
        await redisClient.ping();
        console.log('[url] Redis Connected');
    } catch (err) {
        console.error("[url] Redis Connection Failed", err);
    }

    // 3. Connect MongoDB Replica Set
    try {
        console.log('[url] Connecting to MongoDB Replica Set...');
        
        /* Your MONGO_URI from the K8s env should look like:
           mongodb://url-mongo-0.url-mongo-srv:27017,url-mongo-1.url-mongo-srv:27017,url-mongo-2.url-mongo-srv:27017/url_db?replicaSet=rs0&w=majority&readPreference=secondaryPreferred
        */
        await mongoose.connect(process.env.MONGO_URI);

        console.log('[url] Connected to MongoDB Successfully');
        
        // Log the connection state (optional but helpful)
        const dbName = mongoose.connection.name;
        console.log(`[url] Using Database: ${dbName}`);
    } catch (err) {
        console.error("[url] Fatal: Could not connect to MongoDB", err);
        process.exit(1);
    }

    // 4. Start App
    app.listen(3000, () => {
        console.log("[url] URL Service is listening on port 3000");
    });
}

start();