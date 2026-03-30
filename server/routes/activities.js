import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getActivities, createActivity } from "../controllers/activityController.js";

const router = Router();

router.use(protect);

router.get("/", getActivities);
router.post("/", createActivity);

export default router;
