import express from 'express';
import Chat from '../Models/Chat.js';
import User from '../Models/User.js';

const router = express.Router();

// Create or access one-on-one chat
router.post('/', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "UserId param not sent with request" });
    }

    try {
        let chat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        })
        .populate("users", "-password")
        .populate("latestMessage");

        if (chat.length > 0) {
            res.send(chat[0]);
        } else {
            let chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id, userId],
            };

            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json(fullChat);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all chats for a user
router.get('/', async (req, res) => {
    try {
        const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

        res.status(200).json(chats);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Create group chat
router.post('/group', async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }

    let users = JSON.parse(req.body.users);
    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router; 