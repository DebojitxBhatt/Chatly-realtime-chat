import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dbConnect from "./database/dbConnect.js";
import authRouter from './Route/AuthUser.js'
import chatRouter from './Route/chat.js'
import messageRouter from './Route/message.js'
import { protect } from './middleware/authMiddleware.js'

// Load env vars
dotenv.config();

if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/chat', protect, chatRouter);
app.use('/api/message', protect, messageRouter);

app.get('/',(req,res)=>{
    res.send("API is running successfully");
})

// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id === newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000

// Connect to database and start server
const startServer = async () => {
    try {
        await dbConnect();
        httpServer.listen(PORT,()=>{
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

startServer();