import { Response } from "express";
import { IRequest } from "./vehicleController";
import { Delivery } from "../models/Delivery";

export const createDelivery = async (req: IRequest, res: Response) => {
    if(!req.user) return res.status(401).json({ message: "Unauthorized" })
    
    if(!req.body) return res.status(400).json({ message: "Request body is missing" })

    if(req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" })

    try{
        const { vehicleId, userId, receiverId, startLocation, endLocation, startTime, createdAt, currentLocation  } = req.body

        if(!vehicleId || !userId || !receiverId || !startLocation || !endLocation || !startTime || !createdAt || !currentLocation) return res.status(400).json({ message: "VehicleId, userId, receiverId, startLocation, endLocation, startTime, createdAt and currentLocation are required" })

        const delivery = await Delivery.create({ vehicle: vehicleId, driver: userId, receiver: receiverId, startLocation, endLocation, startTime, createdAt, currentLocation })
        return res.status(201).json(delivery)
   
    } catch (error) {
        return res.status(500).json({ message: "Error creating delivery" })
    }

}











