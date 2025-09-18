import express from "express";
import { db } from "../firebaseClient.js";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Set up express router
const router = express.Router();

// Create signup POST endpoint
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }

    // Get reference to user
    const userRef = doc(db, "users", username);
    // Get snapshot on user document
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Salt and hash password and push it to firestore
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Set the user doc using new username, password, timestamp, and default background color
    await setDoc(userRef, {
      username,
      passwordHash,
      createdAt: serverTimestamp(),
      backgroundColor: "#ffffff",
    });

    return res.status(201).json({ message: "User created" });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Create login POST endpoint
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }

    // Get reference to user
    const userRef = doc(db, "users", username);
    // Gte snapshot on user document
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = snap.data();
    // Compare hashes for authentication
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Sign token using the jwt secret and give it a 2 hour lifespan
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "2h" });

    // Return json
    return res.json({ token, user: { username } });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Create me GET endpoint
router.get("/me", async (req, res) => {
  try {
    // Get authorization headers
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ message: "Missing authorization header" });
    }

    // Should be broken into { "Bearer", token }; we want the token
    const token = auth.split(" ")[1];
    // Verify using JWT (to be honest I dont know if this actually rejects the user)
    // I think the return 401 should do the trick though
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    // Now get the reference to the user's doc in firestore db
    const userRef = doc(db, "users", payload.username);
    
    // Ensure we can obtain a snapshot of the user's doc
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user and give back response to client
    const user = snap.data();
    return res.json({
      username: user.username,
      createdAt: user.createdAt,
      backgroundColor: user.backgroundColor
    });

  } catch (err) {
    console.error("Me error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Create updatecolor PUT endpoint
router.put("/updatecolor", async (req, res) => {
  try {
    // Get authorization headers
    const auth = req.headers.authorization;
    if(!auth) {
      return res.status(401).json({ message: "Missing authorization header" });
    }

    // Get jwt token from headers
    const token = auth.split(" ")[1];
    
    let payload;
    try {
      // Verify jwt token
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Get reference to user
    const userRef = doc(db, "users", payload.username);

    // Get snapshot of user document
    const snap = await getDoc(userRef);
    if(!snap.exists()) {
      return res.status(404).json({ message: "User not found" })
    }

    // Body of the request should contain the background color
    const { backgroundColor } = req.body;
    const hexRegex=/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
    // Verify using regex that we actually got a color
    if(!backgroundColor || !hexRegex.test(backgroundColor)) {
      return res.status(400).json({ message: "Invalid backgroundColor" });
    }

    // Update user's document with their new background color
    await updateDoc(userRef, { backgroundColor });

  } catch (err) {
    return res.status(401).json({ message: "Invalid token"})
  }
});

export default router;