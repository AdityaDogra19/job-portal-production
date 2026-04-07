const Message = require('../models/Message');

// @route   GET /api/chat/:otherUserId
// @desc    Retrieve the complete chat history between you and another person
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id; // From our checkAuth JWT middleware
    const otherUserId = req.params.otherUserId;

    // Fetch messages where either I sent it to them, OR they sent it to me
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ createdAt: 1 }); // Sort chronologically (Oldest first) so they display correctly in the UI!

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChatHistory };
