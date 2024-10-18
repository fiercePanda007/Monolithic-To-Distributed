import mongoose from "mongoose";
import User from "./../models/User.js";
import Post from "./../models/Post.js";
import Notification from "./../models/Notification.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import jwt from "jsonwebtoken";
import { uploadCodeSnippet } from "./../services/minioService.js";
const JWT_SECRET = process.env.JWT_SECRET || "fg736rr36rgy63";

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
    // Fetch posts while excluding the current user's posts
    const posts = await Post.find({ userId: { $ne: req.user.userId } })
      .sort({ createdAt: -1 })
      .limit(20);

    // Reduce the array of posts into an object keyed by userId
    const postsByUser = posts.reduce((acc, post) => {
      // Check if the userId already exists in the accumulator object
      if (!acc[post.userId]) {
        // If not, create a new array that starts with the current post
        acc[post.userId] = [];
      }
      // Append the current post to the array of posts for this userId
      acc[post.userId].push(post);
      return acc;
    }, {});

    return res.status(200).json(postsByUser);
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

export const uploadCode = async (req, res) => {
  try {
    const fileName = `snippet-${Date.now()}.txt`; // Logic for filename
    const fileContent = req.body.fileContent; // Make sure this is a string
    console.log(typeof fileContent);
    await uploadCodeSnippet(fileContent, fileName);
    res.send("Snippet uploaded successfully");
  } catch (error) {
    res.status(500).send("Failed to upload snippet: " + error.message);
  }
};
