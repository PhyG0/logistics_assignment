import { Schema, Document, model } from "mongoose";

export enum Role {
    USER = 'user',
    ADMIN = 'admin', 
    DRIVER = 'driver'
}

export interface ILocation {
    formatted: string;
    place_id: string;
    lat: number;
    lon: number;
}

export interface IUser extends Document {
    username: string,
    email: string, 
    password: string,
    location: ILocation,
    role: Role,
    age: number,
    phone: string
}

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    location: {
        type: {
            formatted: String,
            place_id: String,
            lat: Number,
            lon: Number
        },  
    }, 
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER
    },

    age: {
        type: Number
    }, 

    phone: {
        type: String, 
        required: true
    }

})

export const User = model<IUser>("User", UserSchema);