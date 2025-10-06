import jwt from "jsonwebtoken"
import { Request, Response } from "express";
import { Role } from "../models/User";
import { User } from "../models/User";
import bcrypt from "bcrypt";

export const generateToken = (user: any) => jwt.sign(user, process.env.JWT_SECRET as string)

export const register = async (req: Request, res: Response) => {

    if(!req.body) return res.status(400).json({ message: "Request body is missing" })

    const { username, email, password, age, location, role, phone } = req.body

    if(!role) return res.status(400).json({ message: "Role is required" })

    if(!phone) return res.status(400).json({ message: "Phone is required" })

    switch(role) {
        case Role.USER:
            if(!location) return res.status(400).json({ message: "Location is required for user role" })
            break;
        case Role.DRIVER:
            if(!age) return res.status(400).json({ message: "Age is required for driver role" })
            break;
        case Role.ADMIN:
            break;
        default:
            return res.status(400).json({ message: "Invalid role" })
    }

    const existingUser = await User.findOne({ email })
    if(existingUser) return res.status(400).json({ message: "User already exists" })

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({ username, email, age, location, role, password: hashedPassword, phone })

    if(user) {
        const token = generateToken({ id: user._id, username: user.username, email: user.email, role: user.role })
        return res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } })
    }

    return res.status(500).json({ message: "Error creating user" })

}


export const login = async (req: Request, res: Response) => {

    if(!req.body) return res.status(400).json({ message: "Request body is missing" })

    const { email, password } = req.body

    if(!email || !password) return res.status(400).json({ message: "Email and password are required" })

    const user = await User.findOne({ email })

    if(!user) return res.status(401).json({ message: "User not found" })

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid) return res.status(401).json({ message: "Invalid password" })
    
    const token = generateToken({ id: user._id, username: user.username, email: user.email, role: user.role })

    console.log("logging in")

    return res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } })
    
}












