import { addVehicle, getVehicles } from "../controllers/vehicleController";
import router from "express";
import { authMiddleware } from "../middleware/authMiddleware";

const vehicleRoutes = router(); 

vehicleRoutes.post("/", authMiddleware, addVehicle);
vehicleRoutes.get("/", authMiddleware, getVehicles);

export default vehicleRoutes;