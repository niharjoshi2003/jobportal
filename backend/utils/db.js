import mongoose from "mongoose";
import { logger } from "./logger.js";

const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error("MONGO_URI is not set. Copy backend/.env.example to backend/.env and fill it in.");
    }
    try {
        await mongoose.connect(uri);
        logger.info("mongodb_connected");
    } catch (error) {
        logger.error("mongodb_connection_failed", { error: error?.message });
        throw error;
    }
};

export default connectDB;
