import express from "express";
const router = express.Router();
import {
  signup,
  signin,
  createPost,
  getPosts,
  createNotification,
  getNotification,
} from "../controllers/apiController.js";
import authenticateToken from "./../middleWare/auth.js";

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/createPost", authenticateToken, createPost);
router.get("/getPosts", authenticateToken, getPosts);
router.post("/createNotification", authenticateToken, createNotification);
router.get("/getNotification", authenticateToken, getNotification);

export default router;
