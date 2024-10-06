const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User"); // Assuming you have a User model
const Post = require("./models/Post");
const Notification = require("./models/Notification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();

// Middleware to parse request body as JSON
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/myDataBase");

// Secret key for JWT (You should store this securely in environment variables)
const JWT_SECRET = "pd1232312312213";

// Signup endpoint
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = new User({
    email,
    password: hashedPassword,
  });

  // Save user to database
  await newUser.save();

  return res.status(201).json({ message: "User registered successfully" });
});

// Signin endpoint
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Create JWT token
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

  return res.status(200).json({ token });
});

// Middleware to authenticate user with JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token is not valid" });
    req.user = user;
    next();
  });
};

// POST: Create a new post for the logged-in user
app.post("/post", authenticateToken, async (req, res) => {
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
});

// GET: Retrieve the latest posts from all users except the logged-in user
app.get("/getPosts", authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find({ userId: { $ne: req.user.userId } })
      .sort({ createdAt: -1 }) // Sort by most recent
      .limit(10);

    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// POST: Create a new notification for a specific post
app.post("/notification", authenticateToken, async (req, res) => {
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
});

// GET: Retrieve notifications for a user (if associated with their posts)
app.get("/notification", authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("postId")
      .sort({ createdAt: -1 }) // Sort by most recent
      .limit(10);

    return res.status(200).json(notifications);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
