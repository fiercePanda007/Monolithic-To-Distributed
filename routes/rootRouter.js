import express from "express";
const router = express.Router();
import {
  signup,
  signin,
  createPost,
  getPosts,
  createNotification,
  getNotification,
  uploadCode,
  getCode,
  clearNotification,
} from "../controllers/apiController.js";
import authenticateToken from "./../middleWare/auth.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/post", authenticateToken, createPost);
router.get("/post", authenticateToken, getPosts);
router.post("/notification", authenticateToken, createNotification);
router.get("/notification", authenticateToken, getNotification);
router.post("/code", upload.single("file"), uploadCode);
router.get("/code", getCode);
router.post("/clearNotification", clearNotification);

export default router;
