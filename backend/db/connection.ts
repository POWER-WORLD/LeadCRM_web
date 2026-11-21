import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Cache connection promise and instance across serverless function invocations (Vercel Node)
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

const connectDB = async (): Promise<typeof mongoose> => {
  // Return cached connection if ready
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoURI) {
    const errorMsg = "FATAL: MONGODB_URI (or MONGO_URI) is not defined in environment variables";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(mongoURI, opts).then((mongooseInstance) => {
      console.log(`[Database] MongoDB Connected successfully to host: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("[Database] Connection failed:", error);
    // In serverless environments, do not call process.exit() as it terminates the container ungracefully
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Database] Running in non-production mode, proceeding with connection retry on subsequent request");
    }
    throw error;
  }
};

export default connectDB;
