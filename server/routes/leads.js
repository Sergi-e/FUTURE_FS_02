import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addNote,
} from "../controllers/leadController.js";

const router = Router();

router.use(protect);

router.get("/", getAllLeads);
router.post("/", createLead);
router.get("/:id", getLeadById);
router.patch("/:id", updateLead);
router.delete("/:id", deleteLead);
router.post("/:id/notes", addNote);

export default router;
