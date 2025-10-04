import express from "express";
import { 
    createDelivery, 
    createDeliveryRequest,
    getPendingDeliveries,
    assignDelivery,
    getDeliveries, 
    updateDelivery, 
    getAllDrivers, 
    getAllUsers, 
    getDeliveriesForDriver 
} from "../controllers/deliveryController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// User routes
router.post("/request", authMiddleware, createDeliveryRequest); 

// Admin routes
router.get("/pending", authMiddleware, getPendingDeliveries); 
router.put("/:deliveryId/assign", authMiddleware, assignDelivery); 
router.post("/", authMiddleware, createDelivery); 
router.get("/drivers", authMiddleware, getAllDrivers); 
router.get("/users", authMiddleware, getAllUsers);

// General delivery routes
router.get("/", authMiddleware, getDeliveries); 
router.put("/", authMiddleware, updateDelivery); 

// Driver routes
router.get("/driver/deliveries", authMiddleware, getDeliveriesForDriver); 

export default router;