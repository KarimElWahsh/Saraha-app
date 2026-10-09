import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Content is mandatory"],
      minLength: [3, "Message must be at least 3 characters"],
      maxLength: [500, "Message cannot exceed 500 characters"],
      trim: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
messageSchema.index({ receiverId: 1 });

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;
