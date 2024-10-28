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
  clearNotification,
} from "../controllers/apiController.js";
import authenticateToken from "./../middleWare/auth.js";

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/post", authenticateToken, createPost);
router.get("/post", authenticateToken, getPosts);
router.post("/notification", authenticateToken, createNotification);
router.get("/notification", authenticateToken, getNotification);
router.post("/code", uploadCode);
router.post("/clearNotification", clearNotification);

export default router;
