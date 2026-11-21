import mongoose from "mongoose";
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}
declare global {
    var mongooseCache: MongooseCache | undefined;
}
declare const connectDB: () => Promise<typeof mongoose>;
export default connectDB;
//# sourceMappingURL=connection.d.ts.map