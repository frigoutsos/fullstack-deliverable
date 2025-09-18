import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Must config dotenv before importing the auth router js scripts
dotenv.config();
import authRouter from "./routes/auth.js";

// Instantiate express app
const app = express();

// Use express app
app.use(express.json());

// Set cors for origin and set the allowed methods and headers
app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);

// Set up auth router
app.use("/auth", authRouter);

// Set up backend to listen on port 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log("Server listening on port", PORT);
})