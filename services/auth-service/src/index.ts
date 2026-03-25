import mongoose from "mongoose";
import { app } from "./app";
import { DatabaseConnectionError } from "@zeroop-dev/common/build/url-shortner/errors";

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error("JWT must be defined");
    }
    if(!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be defined");
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    }
    catch (err) {
        throw new DatabaseConnectionError();
    }
    app.listen(3000, () => {
        console.log("Auth service is running on port 3000");
    })
}

start();