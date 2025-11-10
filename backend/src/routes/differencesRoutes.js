import express from "express";
import { DifferencesController } from "../controllers/differencesController.js";

const router = express.Router();

router.get("/", DifferencesController.list);
router.post("/", DifferencesController.create);
router.get("/latest", DifferencesController.latest);

export default router;
