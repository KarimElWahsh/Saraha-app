import joi from "joi";
import { Types } from "mongoose";

export const sendMessageSchema = {
  body: joi.object({
    content: joi.string().min(3).max(500).required().messages({
      "string.empty": "message cannot be empty",
      "string.max": "message cannot exceed 500 characters",
    }),
  }),
  params: joi.object({
    receiverId: joi.string().custom((value, helper) => {
      return (
        Types.ObjectId.isValid(value) ||
        helper.message("Invalid ObjectId format")
      );
    }),
  }),
};

export const toggleStatusSchema = {
  params: joi.object({
    messageId: joi.string().custom((value, helper) => {
      return (
        Types.ObjectId.isValid(value) ||
        helper.message("Invalid ObjectId format")
      );
    }),
  }),
};
