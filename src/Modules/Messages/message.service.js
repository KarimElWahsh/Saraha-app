import mongoose from "mongoose";
import { create, findOne } from "../../DB/database.repository.js";
import MessageModel from "../../DB/Models/message.model.js";
import UserModel from "../../DB/Models/user.model.js";
import { NotFoundException } from "../../Utils/response/error.response.js";
import { successResponse } from "../../Utils/response/success.response.js";

export const sendMessage = async (req, res) => {
  const { receiverId } = req.params;
  const { content } = req.body;
  const receiver = await findOne({
    model: UserModel,
    filter: {
      _id: receiverId,
      freezedAt: { $exists: false },
    },
  });
  if (!receiver)
    throw NotFoundException("receiver not found or account is freezed");

  const message = await create({
    model: MessageModel,
    data: [
      {
        content,
        receiverId,
      },
    ],
  });

  successResponse({
    res,
    message: "Message sent successfully",
    statusCode: 201,
    data: {
      message,
    },
  });
};

export const getAllMessages = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const receiverId = req.user._id;
  const skip = (page - 1) * limit;

  const [messages, totalMessages] = await Promise.all([
    MessageModel.find({ receiverId })
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit)),
    MessageModel.countDocuments({ receiverId }),
  ]);

  successResponse({
    res,
    message: "Inbox retrieved successfully",
    statusCode: 200,
    data: {
      messages,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
      },
    },
  });
};

export const toggleRead = async (req, res) => {
  const { messageId } = req.params;
  const receiverId = req.user._id;

  const message = await findOne({
    model: MessageModel,
    filter: {
      _id: messageId,
    },
  });

  if (!message || message.receiverId.toString() !== receiverId.toString())
    throw NotFoundException("message not found or unauthorized");

  message.isRead = !message.isRead;

  await message.save();
  successResponse({
    res,
    message: `Message marked as ${message.isRead ? "read" : "unread"} `,
    statusCode: 200,
    data: {
      updatedMessage: message,
    },
  });
};

export const toggleFav = async (req, res) => {
  const { messageId } = req.params;
  const receiverId = req.user._id;

  const message = await findOne({
    model: MessageModel,
    filter: {
      _id: messageId,
    },
  });

  if (!message || message.receiverId.toString() !== receiverId.toString())
    throw NotFoundException("message not found or unauthorized");

  message.isFavorite = !message.isFavorite;

  await message.save();
  successResponse({
    res,
    message: `Message marked as ${message.isFavorite ? "favorite" : "removed from favorite"} `,
    statusCode: 200,
    data: {
      updatedMessage: message,
    },
  });
};
