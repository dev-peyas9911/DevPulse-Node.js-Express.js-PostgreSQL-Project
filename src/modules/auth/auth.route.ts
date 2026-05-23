import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

// Signup User
router.post("/signup", authController.signupUser);

// Login User
router.post("/login", authController.loginUser);

export const authRoute = router;
