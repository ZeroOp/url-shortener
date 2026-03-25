import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error("JWT must be defined");
    }
    if(!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be defined");
    }

    let connected = false;
    while (!connected) {
        try {
            console.log("Attempting to connect to MongoDB...");
            await mongoose.connect(process.env.MONGO_URI);
            connected = true;
            console.log("Connected to MongoDB successfully");
        } catch (err) {
            console.error("Database connection failed. Retrying in 5 seconds...");
            // Wait for 5 seconds before the next loop iteration
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
    app.listen(3000, () => {
        console.log("Auth service is running on port 3000");
    })
}

start();