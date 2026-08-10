import express from "express";
const router = express.Router();
import { createAdmin } from "../controllers/adminController.js";

router.post("/create", createAdmin);

export default router;
