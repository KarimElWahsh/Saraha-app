import joi from "joi";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../Utils/enums/user.enum.js";

export const signupSchema = {
  body: joi.object({
    username: joi.string().min(2).max(25).required(),
    email: joi
      .string()
      .email({
        minDomainSegments: 2,
        maxDomainSegments: 5,
        tlds: { allow: ["com", "net", "org"] },
      })
      .required(),
    password: joi.string().alphanum().required(),
    confirmPassword: joi.ref("password"),

    phone: joi.string().pattern(/^(\+20|020|0)?1[0125][0-9]{8}$/), //egyptian number

    gender: joi.string().valid(...Object.values(GenderEnum)),
    role: joi.string().valid(...Object.values(RoleEnum)),
    provider: joi.string().valid(...Object.values(ProviderEnum)),
    DOB: joi.string().isoDate(),
    profilePic: joi.string(),
    coverImages: joi.array().items(joi.string()),
    confirmEmail: joi.string().isoDate(),
  }),
};

export const loginSchema = {
  body: joi.object({
    email: joi
      .string()
      .email({
        minDomainSegments: 2,
        maxDomainSegments: 5,
        tlds: { allow: ["com", "net", "org"] },
      })
      .required(),
    password: joi.string().alphanum().required(),
  }),
};
export const confirmEmailSchema = {
  body: joi.object({
    email: joi
      .string()
      .email({
        minDomainSegments: 2,
        maxDomainSegments: 5,
        tlds: { allow: ["com", "net", "org"] },
      })
      .required(),
    otp: joi.string().pattern(/^\d{6}$/),
  }),
};

export const forgetPasswordSchema = {
  body: joi.object({
    email: joi
      .string()
      .email({
        minDomainSegments: 2,
        maxDomainSegments: 5,
        tlds: { allow: ["com", "net", "org"] },
      })
      .required(),
  }),
};
export const resetPasswordSchema = {
  body: joi.object({
    email: joi
      .string()
      .email({
        minDomainSegments: 2,
        maxDomainSegments: 5,
        tlds: { allow: ["com", "net", "org"] },
      })
      .required(),
    otp: joi.string().pattern(/^\d{6}$/),
    newPassword: joi.string().alphanum().required(),
  }),
};
