import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const router = express.Router();
import { verifyToken, isEmployee, isHR } from "../middlewares/authMiddleware.js";
import {
  getDocuments,
  createDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload folder exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.use(verifyToken);

router.get("/", getDocuments);
router.post("/", isHR, upload.single("file"), createDocument);
router.delete("/:id", isHR, deleteDocument);

export default router;
