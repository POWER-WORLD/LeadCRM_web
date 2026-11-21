"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let cached = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
    global.mongooseCache = cached;
}
const connectDB = async () => {
    // Return cached connection if ready
    if (cached.conn && mongoose_1.default.connection.readyState === 1) {
        return cached.conn;
    }
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoURI) {
        const errorMsg = "FATAL: MONGODB_URI (or MONGO_URI) is not defined in environment variables";
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
    if (!cached.promise) {
        const opts = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
        };
        cached.promise = mongoose_1.default.connect(mongoURI, opts).then((mongooseInstance) => {
            console.log(`[Database] MongoDB Connected successfully to host: ${mongooseInstance.connection.host}`);
            return mongooseInstance;
        });
    }
    try {
        cached.conn = await cached.promise;
        return cached.conn;
    }
    catch (error) {
        cached.promise = null;
        console.error("[Database] Connection failed:", error);
        // In serverless environments, do not call process.exit() as it terminates the container ungracefully
        if (process.env.NODE_ENV !== "production") {
            console.warn("[Database] Running in non-production mode, proceeding with connection retry on subsequent request");
        }
        throw error;
    }
};
exports.default = connectDB;
//# sourceMappingURL=connection.js.map