import { Request, Response } from "express";
import { Delivery } from "../models/Delivery";
import { Vehicle } from "../models/Vehicle";

export interface IRequest extends Request {
    user?: any;
}

export const getVehicles = async (req: IRequest, res: Response) => {

    if(!req.user) return res.status(401).json({ message: "Unauthorized" })

    if(req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" })

    try{
        const vehicles = await Vehicle.find({});
        return res.status(200).json(vehicles)
    } catch (error) {
        return res.status(500).json({ message: "Error getting vehicles" })
    }

}

export const addVehicle = async (req: IRequest, res: Response) => {

    if(!req.user) return res.status(401).json({ message: "Unauthorized" })

    if(!req.body) return res.status(400).json({ message: "Request body is missing" })

    if(req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" })

    try{
        const { capacity, type, number } = req.body
        if(!capacity || !type || !number) return res.status(400).json({ message: "Capacity, type and number are required" })
        const existingVehicle = await Vehicle.findOne({ number });
        if(existingVehicle) return res.status(400).json({ message: "Vehicle already exists" })
        const vehicle = await Vehicle.create({ capacity, type, number })
        return res.status(201).json(vehicle)
    } catch (error) {
        return res.status(500).json({ message: "Error adding vehicle" })
    }

}