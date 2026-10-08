import { Router } from "express";
import {
  approveSubmission,
  createSubmission,
  getSubmissionById,
  listSubmissions,
  reviewSubmission,
  updateSubmission,
} from "../controllers/esgController.js";
import authenticate from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
router.use(authenticate);
router.get("/", asyncHandler(listSubmissions));
router.post("/", allowRoles("PROJECT_USER"), upload.single("evidence"), asyncHandler(createSubmission));
router.get("/:id", asyncHandler(getSubmissionById));
router.put("/:id", allowRoles("PROJECT_USER"), upload.single("evidence"), asyncHandler(updateSubmission));
router.put("/:id/review", allowRoles("REVIEWER"), asyncHandler(reviewSubmission));
router.put("/:id/approve", allowRoles("REVIEWER", "ADMIN"), asyncHandler(approveSubmission));

export default router;
