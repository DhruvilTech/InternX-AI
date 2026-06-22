import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast dashboard badge counting and retrieval
notificationSchema.index({ recipientId: 1, isDeleted: 1, isRead: 1, createdAt: -1 });

notificationSchema.statics.createUnique = async function (data) {
  const { recipientId, type, entityId, title, message } = data;
  
  const query = { recipientId, type, isDeleted: false };
  if (entityId) {
    query.entityId = entityId;
  } else {
    query.title = title;
    query.message = message;
  }
  
  const existing = await this.findOne(query);
  if (existing) {
    return existing;
  }
  
  return await this.create(data);
};

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
