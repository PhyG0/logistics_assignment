import router from "express";
import { login, register } from "../controllers/authController";

const authRoutes = router();

authRoutes.post("/login", login);
authRoutes.post("/register", register);

export default authRoutes