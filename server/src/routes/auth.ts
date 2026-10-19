import { Router } from "express";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema } from "../schemas/auth";
import * as ctrl from "../controllers/authController";

export const authRouter = Router();
authRouter.post("/register", validate(registerSchema), ctrl.register);
authRouter.post("/login", validate(loginSchema), ctrl.login);