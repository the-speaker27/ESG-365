import { Router } from "express";
import { getConsolidation, getDashboard } from "../controllers/dashboardController.js";
import authenticate from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
router.get("/dashboard", authenticate, asyncHandler(getDashboard));
router.get("/consolidation", authenticate, allowRoles("ADMIN"), asyncHandler(getConsolidation));

export default router;
