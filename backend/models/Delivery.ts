import { Schema, Document, model } from "mongoose";
import mongoose from "mongoose";
import { ILocation } from "./User";

export interface IDelivery extends Document {
    vehicle: mongoose.Types.ObjectId | null,
    driver: mongoose.Types.ObjectId | null,
    receiver: mongoose.Types.ObjectId,
    startLocation: ILocation,
    endLocation: ILocation,
    startTime: Date,
    endTime: Date,
    createdAt: Date,
    currentLocation: ILocation,
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
        type: {
            formatted: String,
            place_id: String,
            lat: Number,
            lon: Number
        },
        default: {
            formatted: "",
            place_id: "",
            lat: 0,
            lon: 0
        }
    },
    endLocation: {
        type: {
            formatted: String,
            place_id: String,
            lat: Number,
            lon: Number
        },
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
        type: {
            formatted: String,
            place_id: String,
            lat: Number,
            lon: Number
        }
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