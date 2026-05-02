import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import dotenv from "dotenv"; // 1. Added dotenv to manage secure variables
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";

dotenv.config(); // 2. Triggers dotenv to read your local .env file

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));
app.use(cors({
  origin: "https://santoom.vercel.app" 
}));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

app.get("/home", (req, res) => {
    return res.json({ "hello": "world" });    
});

const start = async () => {
    try {
        // 3. Replaced your hardcoded string with the secure variable
        const connectionDb = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`Mongo Connected DB Host: ${connectionDb.connection.host}`);
        
        server.listen(app.get("port"), () => {
            // 4. Made the console log dynamic so you know exactly what port Render gives you
            console.log(`Server is running on port ${app.get("port")}`); 
        });
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

start();