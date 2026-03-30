import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = "7d";

function signToken(userId) {
  return jwt.sign({ userId: String(userId) }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export async function register(req, res) {
  try {
    if (!JWT_SECRET) {
      return res.status(500).json({ message: "Server missing JWT_SECRET" });
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "That email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      // Keep everyone as "user" here — promoting admins should be a separate, trusted flow.
      role: "user",
    });

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("register:", err);
    res.status(500).json({ message: "Could not create account" });
  }
}

export async function login(req, res) {
  try {
    if (!JWT_SECRET) {
      return res.status(500).json({ message: "Server missing JWT_SECRET" });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);
    user.password = undefined;
    res.json({
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("login:", err);
    res.status(500).json({ message: "Could not sign in" });
  }
}
