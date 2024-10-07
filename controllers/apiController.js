import mongoose from "mongoose";
import User from "./../models/User.js";
import Post from "./../models/Post.js";
import Notification from "./../models/Notification.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import jwt from "jsonwebtoken";

mongoose.connect("mongodb://localhost:27017/myDataBase");

export const signup = async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    password: hashedPassword,
  });

  await newUser.save();

  return res.status(201).json({ message: "User registered successfully" });
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

  return res.status(200).json({ token });
};

export const createPost = async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const newPost = new Post({
      userId: req.user.userId,
      content,
    });

    await newPost.save();
    return res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: { $ne: req.user.userId } })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const createNotification = async (req, res) => {
  const { postId, message } = req.body;

  if (!postId || !message) {
    return res
      .status(400)
      .json({ message: "Post ID and message are required" });
  }

  try {
    const notification = new Notification({
      postId,
      message,
    });

    await notification.save();
    return res
      .status(201)
      .json({ message: "Notification created successfully", notification });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getNotification = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("postId")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json(notifications);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
