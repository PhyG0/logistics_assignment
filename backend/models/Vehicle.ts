import { Schema, Document, model, mongo } from "mongoose";
import mongoose from "mongoose";

export interface IVehicle extends Document {
    capacity: number;
    type: string;
    number: string;
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
    }
})

export const Vehicle = model<IVehicle>("Vehicle", VehicleSchema);