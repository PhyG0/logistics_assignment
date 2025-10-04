import mongoose from "mongoose";

export default async function connectDB() {
    const mode = process.env.MODE || "development";
    let mongoURI = "";
    if (mode === "production") {
        mongoURI = process.env.MONGO_URI_REMOTE || "";
    } else {
        mongoURI = process.env.MONGO_URI_LOCAL || "";
    }
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
