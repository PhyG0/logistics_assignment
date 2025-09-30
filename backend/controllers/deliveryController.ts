import { Response } from "express";
import { IRequest } from "./vehicleController";
import { Delivery, IDelivery } from "../models/Delivery";
import { IVehicle, Vehicle } from "../models/Vehicle";
import { User } from "../models/User";

export const createDelivery = async (req: IRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!req.body) return res.status(400).json({ message: "Request body is missing" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    try {
        const { vehicleNumber, driverEmail, receiverEmail, startLocation, endLocation, currentLocation } = req.body;

        if (!vehicleNumber || !driverEmail || !receiverEmail || !startLocation || !endLocation) {
            return res.status(400).json({ message: "vehicleNumber, driverEmail, receiverEmail, startLocation, endLocation are required" });
        }

        const vehicle = await Vehicle.findOne({ number: vehicleNumber });
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

        const driver = await User.findOne({ email: driverEmail, role: "driver" });
        if (!driver) return res.status(404).json({ message: "Driver not found" });

        const receiver = await User.findOne({ email: receiverEmail, role: "user" });
        if (!receiver) return res.status(404).json({ message: "Receiver not found" });

        const vehicleInUse = await Delivery.findOne({ vehicle: vehicle._id, endTime: null });
        if (vehicleInUse) return res.status(400).json({ message: "Vehicle is in use" });

        const driverInUse = await Delivery.findOne({ driver: driver._id, endTime: null });
        if (driverInUse) return res.status(400).json({ message: "Driver is in use" });

        const delivery = await Delivery.create({
            vehicle: vehicle._id,
            driver: driver._id,
            receiver: receiver._id,
            startLocation,
            endLocation,
            currentLocation
        });

        vehicle.currentDelivery = delivery._id as any;
        await vehicle.save();

        return res.status(201).json(delivery);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error creating delivery" });
    }
};

export const getDeliveries = async (req: IRequest, res: Response) => {

    if(!req.user) return res.status(401).json({ message: "Unauthorized" })

    if(req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" })
    
    try{
        const deliveriesRaw = await Delivery.find({})

        let deliveries = [];

        for(const delivery of deliveriesRaw) {
            const vehicle = await Vehicle.findById(delivery.vehicle)
            const driver = await User.findById(delivery.driver)
            const receiver = await User.findById(delivery.receiver)
            deliveries.push({ ...delivery.toObject(), vehicle, driver, receiver })
        }

        return res.status(200).json(deliveries)
    } catch (error) {
        return res.status(500).json({ message: "Error getting deliveries" })
    }
}

export const updateDelivery = async (req: IRequest, res: Response) => {
    if(!req.user) return res.status(401).json({ message: "Unauthorized" })

    if(!req.body) return res.status(400).json({ message: "Request body is missing" })

    console.log(req.user)
    
    if(req.user.role === "user") return res.status(403).json({ message: "Forbidden" })

    try {
        const { deliveryId, currentLocation, startTime, endTime } = req.body;

        if(!deliveryId) return res.status(400).json({ message: "DeliveryId is required" })
        
        const delivery = await Delivery.findById(deliveryId)

        if(!delivery) return res.status(404).json({ message: "Delivery not found" })
        
        delivery.currentLocation = currentLocation ?? delivery.currentLocation
        delivery.startTime = startTime ?? delivery.startTime
        delivery.endTime = endTime ?? delivery.endTime

        await delivery.save()

        const vehicle = await Vehicle.findById(delivery.vehicle) 

        if(endTime && vehicle) vehicle.currentDelivery = null;
        await vehicle?.save()

        return res.status(200).json(delivery)

    } catch (error) {
        return res.status(500).json({ message: "Error updating delivery" })
    }
    
}


export const getAllDrivers = async (req: IRequest, res: Response) => {

    if(!req.user) return res.status(401).json({ message: "Unauthorized" })
    
    if(req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" })
    
    try{
        const driversRaw = await User.find({ role: "driver" })
        let drivers = [];
        for(let driver of driversRaw) {
            let driverWithAvailability: any = driver.toObject()
            const delivery = await Delivery.findOne({ driver: driver._id, endTime: null })
            if(delivery) {
                driverWithAvailability.currentDelivery = delivery
            }else{
                driverWithAvailability.currentDelivery = null
            }
            drivers.push(driverWithAvailability)
        }
        return res.status(200).json(drivers)
    } catch (error) {
        return res.status(500).json({ message: "Error getting drivers" })
    }
}

export const getAllUsers = async (req: IRequest, res: Response) => {

    if(!req.user) return res.status(401).json({ message: "Unauthorized" })
    
    if(req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" })
    
    try{
        const users = await User.find({  role: "user" })
        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({ message: "Error getting users" })
    }
}

export const getDeliveriesForDriver = async (req: IRequest, res: Response) => {
    if(!req.user) return res.status(401).json({ message: "Unauthorized" })
    
    if(req.user.role !== "driver") return res.status(403).json({ message: "Forbidden" })
    
    try{
        const deliveries = await Delivery.find({ driver: req.user.id })
        return res.status(200).json(deliveries)
    } catch (error) {
        return res.status(500).json({ message: "Error getting deliveries" })
    }
}