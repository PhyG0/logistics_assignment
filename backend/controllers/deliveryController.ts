import { Response } from "express";
import { IRequest } from "./vehicleController";
import { Delivery, IDelivery } from "../models/Delivery";
import { IVehicle, Vehicle } from "../models/Vehicle";
import { User } from "../models/User";

// User creates a delivery request (only needs endLocation and optional message)
export const createDeliveryRequest = async (req: IRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!req.body) return res.status(400).json({ message: "Request body is missing" });

    try {
        const { endLocation, message } = req.body;

        console.log(endLocation, message)

        if (!endLocation) {
            return res.status(400).json({ message: "endLocation is required" });
        }

        const delivery = await Delivery.create({
            receiver: req.user.id,
            endLocation,
            message: message || "",
            status: "pending",
            vehicle: null,
            driver: null
        });

        return res.status(201).json(delivery);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error creating delivery request" });
    }
};

// Get all pending deliveries (for admin)
export const getPendingDeliveries = async (req: IRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    try {
        const deliveriesRaw = await Delivery.find({ status: "pending" });

        let deliveries = [];
        for (const delivery of deliveriesRaw) {
            const receiver = await User.findById(delivery.receiver);
            deliveries.push({ 
                ...delivery.toObject(), 
                receiver 
            });
        }

        return res.status(200).json(deliveries);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error getting pending deliveries" });
    }
};

export const assignDelivery = async (req: IRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!req.body) return res.status(400).json({ message: "Request body is missing" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    try {
        const { deliveryId } = req.params;
        const { vehicleNumber, driverEmail, startLocation, currentLocation } = req.body;

        if (!vehicleNumber || !driverEmail || !startLocation) {
            return res.status(400).json({ message: "vehicleNumber, driverEmail, and startLocation are required" });
        }

        const delivery = await Delivery.findById(deliveryId);
        if (!delivery) return res.status(404).json({ message: "Delivery not found" });

        if (delivery.status !== "pending") {
            return res.status(400).json({ message: "Delivery already assigned" });
        }

        const vehicle = await Vehicle.findOne({ number: vehicleNumber });
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

        const driver = await User.findOne({ email: driverEmail, role: "driver" });
        if (!driver) return res.status(404).json({ message: "Driver not found" });

        // Check if vehicle is already in use
        const vehicleInUse = await Delivery.findOne({ 
            vehicle: vehicle._id, 
            status: { $in: ["assigned", "in-progress"] }
        });
        if (vehicleInUse) return res.status(400).json({ message: "Vehicle is in use" });

        // Check if driver is already busy
        const driverInUse = await Delivery.findOne({ 
            driver: driver._id, 
            status: { $in: ["assigned", "in-progress"] }
        });
        if (driverInUse) return res.status(400).json({ message: "Driver is busy" });

        // Assign vehicle and driver
        delivery.vehicle = vehicle._id as any;
        delivery.driver = driver._id as any;
        delivery.startLocation = startLocation;
        delivery.currentLocation = currentLocation || startLocation;
        delivery.status = "assigned";
        await delivery.save();

        // Update vehicle's current delivery
        vehicle.currentDelivery = delivery._id as any;
        await vehicle.save();

        // Populate full delivery data for response
        const populatedDelivery = await Delivery.findById(delivery._id);
        const vehicleData = await Vehicle.findById(populatedDelivery?.vehicle);
        const driverData = await User.findById(populatedDelivery?.driver);
        const receiverData = await User.findById(populatedDelivery?.receiver);

        return res.status(200).json({
            ...populatedDelivery?.toObject(),
            vehicle: vehicleData,
            driver: driverData,
            receiver: receiverData
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error assigning delivery" });
    }
};

// Legacy create delivery method (kept for backward compatibility if needed)
export const createDelivery = async (req: IRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!req.body) return res.status(400).json({ message: "Request body is missing" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    try {
        const { vehicleNumber, driverEmail, receiverEmail, startLocation, endLocation, currentLocation, message } = req.body;

        if (!vehicleNumber || !driverEmail || !receiverEmail || !startLocation || !endLocation) {
            return res.status(400).json({ message: "vehicleNumber, driverEmail, receiverEmail, startLocation, endLocation are required" });
        }

        const vehicle = await Vehicle.findOne({ number: vehicleNumber });
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

        const driver = await User.findOne({ email: driverEmail, role: "driver" });
        if (!driver) return res.status(404).json({ message: "Driver not found" });

        const receiver = await User.findOne({ email: receiverEmail, role: "user" });
        if (!receiver) return res.status(404).json({ message: "Receiver not found" });

        const vehicleInUse = await Delivery.findOne({ 
            vehicle: vehicle._id, 
            status: { $in: ["assigned", "in-progress"] }
        });
        if (vehicleInUse) return res.status(400).json({ message: "Vehicle is in use" });

        const driverInUse = await Delivery.findOne({ 
            driver: driver._id, 
            status: { $in: ["assigned", "in-progress"] }
        });
        if (driverInUse) return res.status(400).json({ message: "Driver is in use" });

        const delivery = await Delivery.create({
            vehicle: vehicle._id,
            driver: driver._id,
            receiver: receiver._id,
            startLocation,
            endLocation,
            currentLocation: currentLocation || startLocation,
            message: message || "",
            status: "assigned"
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

    try{
        const deliveriesRaw = await Delivery.find({})

        let deliveries = [];

        for(const delivery of deliveriesRaw) {
            const vehicle = delivery.vehicle ? await Vehicle.findById(delivery.vehicle) : null;
            const driver = delivery.driver ? await User.findById(delivery.driver) : null;
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

        // Update status based on times
        if (endTime) {
            delivery.status = "completed";
        } else if (startTime && !delivery.startTime) {
            delivery.status = "in-progress";
        }

        await delivery.save()

        const vehicle = await Vehicle.findById(delivery.vehicle) 

        if(endTime && vehicle) {
            vehicle.currentDelivery = null;
            await vehicle.save();
        }

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
            const delivery = await Delivery.findOne({ 
                driver: driver._id, 
                status: { $in: ["assigned", "in-progress"] }
            })
            if(delivery) {
                driverWithAvailability.currentDelivery = delivery._id
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