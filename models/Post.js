const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    
    // We store an array of User IDs that liked the post. 
    // This allows us to instantly check if the logged-in user already liked it!
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// SCALABILITY UPGRADE: Indexes
// When feeds rely on "Newest First" logic, searching through millions of posts is slow.
// This index forces MongoDB to keep a pre-sorted map of create dates in memory!
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
