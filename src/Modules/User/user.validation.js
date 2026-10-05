import joi from "joi";
import { Types } from "mongoose";
import { validate } from "uuid";

export const updatePasswordSchema = {
  body: joi.object({
    oldPassword: joi.string().alphanum().required(),
    newPassword: joi.string().alphanum().required(),
    confirmPassword: joi.ref("newPassword"),
  }),
};

export const freezeSchema = {
  params: joi.object({
    userId: joi.string().custom((value, helper) => {
      return (
        Types.ObjectId.isValid(value) ||
        helper.message("Invalid ObjectId format")
      );
    }),
  }),
};

export const restoreSchema = {
  params: joi.object({
    userId: joi.string().custom((value, helper) => {
      return (
        Types.ObjectId.isValid(value) ||
        helper.message("Invalid ObjectId format")
      );
    }),
  }),
};

export const hardDeleteSchema = {
  params: joi.object({
    userId: joi.string().custom((value, helper) => {
      return (
        Types.ObjectId.isValid(value) ||
        helper.message("Invalid ObjectId format")
      );
    }),
  }),
};
