import { Schema, Document, model } from "mongoose";

export enum Role {
    USER = 'user',
    ADMIN = 'admin', 
    DRIVER = 'driver'
}

export interface IUser extends Document {
    username: string,
    email: string, 
    password: string,
    location: string,
    role: Role,
    age: number
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
        type: String,
    }, 
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER
    },

    age: {
        type: Number
    }

})

export const User = model<IUser>("User", UserSchema);