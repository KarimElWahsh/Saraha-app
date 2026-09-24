import joi from "joi";

export const updatePasswordSchema = {
  body: joi.object({
    oldPassword: joi.string().alphanum().required(),
    newPassword: joi.string().alphanum().required(),
    confirmPassword: joi.ref("newPassword"),
  }),
};
