import express from "express";
import {
  getAvailableVillas,
  getVillaQuote
} from "../controllers/villa.controller.js";

const router = express.Router();

router.get("/availability", getAvailableVillas);
router.get("/:villa_id/quote", getVillaQuote);

export default router;
