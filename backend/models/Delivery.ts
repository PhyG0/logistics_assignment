import { Schema, Document, model } from "mongoose";
import mongoose from "mongoose";

export interface IDelivery extends Document {
    vehicle: mongoose.Types.ObjectId,
    driver: mongoose.Types.ObjectId,
    receiver: mongoose.Types.ObjectId,
    startLocation: string,
    endLocation: string,
    startTime: Date,
    endTime: Date,
    createdAt: Date,
    currentLocation: string,
}

export const DeliverySchema = new Schema<IDelivery>({
    vehicle: {
        type: Schema.Types.ObjectId,
        required: true
    },
    driver: {
        type: Schema.Types.ObjectId,
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        required: true
    },
    startLocation: {
        type: String,
        required: true
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
    }
})

export const Delivery = model<IDelivery>("Delivery", DeliverySchema);
