const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['application_status', 'system', 'job_alert'], required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedData: {
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
      applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
