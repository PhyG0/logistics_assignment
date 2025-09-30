import mongoose from "mongoose";

export default async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
