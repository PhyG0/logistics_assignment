import { Schema, Document, model } from "mongoose";
import mongoose from "mongoose";

export interface IDelivery extends Document {
    vehicle: mongoose.Types.ObjectId | null,
    driver: mongoose.Types.ObjectId | null,
    receiver: mongoose.Types.ObjectId,
    startLocation: string,
    endLocation: string,
    startTime: Date,
    endTime: Date,
    createdAt: Date,
    currentLocation: string,
    message: string,
    status: "pending" | "assigned" | "in-progress" | "completed",
}

export const DeliverySchema = new Schema<IDelivery>({
    vehicle: {
        type: Schema.Types.ObjectId,
        required: false,
        default: null
    },
    driver: {
        type: Schema.Types.ObjectId,
        required: false,
        default: null
    },
    receiver: {
        type: Schema.Types.ObjectId,
        required: true
    },
    startLocation: {
        type: String,
        required: false
    },
    endLocation: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
    },
    endTime: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now    
    },
    currentLocation: {
        type: String
    },
    message: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ["pending", "assigned", "in-progress", "completed"],
        default: "pending"
    }
})

export const Delivery = model<IDelivery>("Delivery", DeliverySchema);