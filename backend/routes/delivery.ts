import router from "express";
import { getDeliveries, createDelivery, updateDelivery, getAllDrivers, getAllUsers, getDeliveriesForDriver } from "../controllers/deliveryController";
import { authMiddleware } from "../middleware/authMiddleware";

const deliveryRoutes = router();

deliveryRoutes.post("/", authMiddleware, createDelivery);
deliveryRoutes.get("/", authMiddleware, getDeliveries);
deliveryRoutes.put("/", authMiddleware, updateDelivery);
deliveryRoutes.get("/drivers", authMiddleware, getAllDrivers);
deliveryRoutes.get("/users", authMiddleware, getAllUsers);
deliveryRoutes.get("/driver", authMiddleware, getDeliveriesForDriver);

export default deliveryRoutes;