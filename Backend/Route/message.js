import express from 'express';
import Message from '../Models/Message.js';
import User from '../Models/User.js';
import Chat from '../Models/Chat.js';

const router = express.Router();

// Send message
router.post('/', async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        return res.status(400).json({ message: "Invalid data passed into request" });
    }

    try {
        let message = await Message.create({
            sender: req.user._id,
            content: content,
            chat: chatId,
        });

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all messages for a chat
router.get('/:chatId', async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router; 