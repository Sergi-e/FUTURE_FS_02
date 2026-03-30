import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getWeeklyLeadGrowth } from "../controllers/analyticsController.js";

const router = Router();

router.use(protect);
router.get("/weekly", getWeeklyLeadGrowth);

export default router;
