import { Router } from "express";
import { getBRSRReport } from "../controllers/reportController.js";
import authenticate from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
router.get("/brsr", authenticate, allowRoles("ADMIN"), asyncHandler(getBRSRReport));

export default router;
