import { Schema, Document, model, mongo } from "mongoose";
import mongoose from "mongoose";

export interface IVehicle extends Document {
    capacity: number;
    type: string;
    number: string;
    currentDelivery: mongoose.Types.ObjectId | null
}

const VehicleSchema = new Schema<IVehicle>({
    capacity: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    currentDelivery: {
        type: Schema.Types.ObjectId,
        ref: "Delivery",
        default: null
    }
})

export const Vehicle = model<IVehicle>("Vehicle", VehicleSchema);