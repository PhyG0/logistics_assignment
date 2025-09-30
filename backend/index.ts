import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/database";

import authRoutes from "./routes/auth";
import vehicleRoutes from "./routes/vehicle";

dotenv.config();

const app = express();

const main = async () => {
    await connectDB();

    app.use(cors());
    app.use(express.json());

    app.use("/api/auth", authRoutes);
    app.use("/api/vehicle", vehicleRoutes);

    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    })

}

main();

export default app;

