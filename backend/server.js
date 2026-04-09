import cors from "cors";
import express from "express";
import mongoose from "mongoose";

const app = express();

// 🔹 Middleware
app.use(cors());
app.use(express.json());

// 🔹 MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/github-analyzer")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// 🔹 Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  totalRepos: Number,
  totalStars: Number,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// 🔹 Root route (test)
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});


// 🚀 🔹 GitHub API Route (NEW FEATURE)
app.get("/api/github/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const userRes = await fetch(
      `https://api.github.com/users/${username}`
    );
    const repoRes = await fetch(
      `https://api.github.com/users/${username}/repos`
    );

    const user = await userRes.json();
    const repos = await repoRes.json();

    // 🔥 Calculate total stars
    const totalStars = repos.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    );

    res.json({
      user,
      totalRepos: repos.length,
      totalStars,
      repos,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "GitHub fetch error" });
  }
});


// 💾 🔹 Save user
app.post("/save-user", async (req, res) => {
  try {
    const { username, totalRepos, totalStars } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const newUser = new User({
      username,
      totalRepos,
      totalStars,
    });

    await newUser.save();

    res.json({ message: "User saved successfully ✅" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error saving user" });
  }
});


// 📊 🔹 Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});


// ❌ 🔹 Delete user (NEW)
app.delete("/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted 🗑️" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});


// 🚀 Start server
app.listen(5000, () => {
  console.log("🚀 Backend running on port 5000");
});