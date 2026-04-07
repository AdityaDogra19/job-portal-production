const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false } // Handy for building "Unread Badges" later
  },
  { timestamps: true }
);

// Create compound indexes. Since we frequently ask MongoDB "Find all messages between User A and User B",
// this index pairs those queries together inside RAM for instant fetch speeds!
messageSchema.index({ sender: 1, receiver: 1 });

module.exports = mongoose.model('Message', messageSchema);
