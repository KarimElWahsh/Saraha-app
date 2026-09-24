import { model, Types } from "mongoose";
import {
  create,
  findByIdAndUpdate,
  findOne,
  findOneAndUpdate,
  updateOne,
} from "../../DB/database.repository.js";
import UserModel from "../../DB/Models/user.model.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/response/error.response.js";
import { successResponse } from "../../Utils/response/success.response.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/security/hash.security.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import { decrypt, encrypt } from "../../Utils/security/encryption.security.js";
import { getNewLoginCredentials } from "../../Utils/tokens/tokens.js";
import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID } from "../../../config/config.service.js";
import { LogoutTypeEnum, ProviderEnum } from "../../Utils/enums/user.enum.js";
import TokenModel from "../../DB/Models/token.model.js";
import { generateOtp } from "../../Utils/generateOTP.util.js";
import { emailEvent } from "../../Utils/events/email.events.js";

export const signup = async (req, res) => {
  const { username, email, password, phone } = req.body;

  if (await findOne({ model: UserModel, filter: { email } }))
    ConflictException("User already exists");

  const otp = await generateOtp();
  const hashedOtp = await generateHash({
    plainText: otp,
    algorithm: HashEnum.Argon2,
  });
  const hashedPassword = await generateHash({
    plainText: password,
    algorithm: HashEnum.BCRYPT,
  });

  const encryptedPhone = encrypt(phone);
  const user = await create({
    model: UserModel,
    data: [
      {
        username,
        email,
        password: hashedPassword,
        phone: encryptedPhone,
        confirmEmailOtp: hashedOtp,
      },
    ],
  });

  // send Email
  emailEvent.emit("confirmEmail", { to: email, otp, username });
  successResponse({
    res,
    statusCode: 201,
    message: "User created successfully",
    data: { user },
  });
};

export const confirmEmail = async (req, res) => {
  const { email, otp } = req.body;
  const user = await findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmailOtp: { $exists: true },
      confirmEmail: { $exists: false },
    },
  });
  if (!user) NotFoundException("User not found");

  const isPasswordValid = await compareHash({
    plainText: otp,
    cipherText: user.confirmEmailOtp,
    algorithm: HashEnum.Argon2,
  });
  if (!isPasswordValid) throw BadRequestException("Invalid OTP");

  await updateOne({
    model: UserModel,
    filter: { email },
    update: { confirmEmail: Date.now(), $unset: { confirmEmailOtp: true } },
  });

  successResponse({
    res,
    message: "User confirmed successfully",
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await findOne({
    model: UserModel,
    filter: { email, confirmEmail: { $exists: true } },
  });
  if (!user) NotFoundException("User not found");

  const isPasswordValid = await compareHash({
    plainText: password,
    cipherText: user.password,
    algorithm: HashEnum.Argon2,
  });
  if (!isPasswordValid) throw BadRequestException("Invalid credentials");

  const tokens = await getNewLoginCredentials(user);

  successResponse({
    res,
    message: "User logged in successfully",
    data: { tokens },
  });
};

export const refreshToken = async (req, res) => {
  const accessToken = await getNewLoginCredentials(req.user, {
    generateRefreshToken: false,
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Done",
    data: { accessToken },
  });
};

//Google verify Identity function
async function verifyWithGoogle(idToken) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  return payload;
}

export const loginWithGoogle = async (req, res) => {
  const { idToken } = req.body;
  const { email, email_verified, given_name, family_name, picture } =
    await verifyWithGoogle(idToken);
  if (!email_verified) throw BadRequestException("Email not verified");
  const user = await findOne({ model: UserModel, filter: { email } });
  if (user) {
    //login
    const credentials = await getNewLoginCredentials(user);
    successResponse({
      res,
      statusCode: 200,
      message: "Logged in successfully",
      data: { credentials },
    });
  }
  const newUser = await create({
    model: UserModel,
    data: [
      {
        firstName: given_name,
        lastName: family_name,
        email,
        provider: ProviderEnum.GOOGLE,
        profilePic: picture,
      },
    ],
  });
  const credentials = await getNewLoginCredentials(newUser);
  successResponse({
    res,
    statusCode: 201,
    message: "Signup successfully",
    data: { credentials },
  });
};

export const logout = async (req, res) => {
  const { flag } = req.body;

  let status = 200;

  switch (flag) {
    case LogoutTypeEnum.logout:
      await create({
        model: TokenModel,
        data: [
          {
            jti: req.decoded.jti,
            userId: req.user._id,
            expiresIn: Date.now() - req.decoded.exp,
          },
        ],
      });
      status = 201;
      break;
    case LogoutTypeEnum.logoutFromAll:
      await updateOne({
        model: UserModel,
        filter: { _id: req.user._id },
        update: {
          changeCredentialsTime: Date.now(),
        },
      });
      status = 200;
      break;
  }

  successResponse({
    res,
    statusCode: status,
    message: "Logout successfully",
  });
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;

  const otp = generateOtp();
  const hashedOtp = await generateHash({
    plainText: otp,
    algorithm: HashEnum.Argon2,
  });

  const user = await findOneAndUpdate({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      provider: ProviderEnum.SYSTEM,
    },
    update: {
      forgetPasswordOtp: hashedOtp,
    },
  });
  if (!user) throw NotFoundException("User not found");

  emailEvent.emit("forgetPassword", {
    to: email,
    username: user.firstName,
    otp,
  });
  successResponse({
    res,
    message: "Check your inbox",
  });
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await findOne({
    model: UserModel,
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
      forgetPasswordOtp: { $exists: true },
    },
  });
  if (!user) throw NotFoundException("User not found  ");

  const isValidOtp = await compareHash({
    plainText: otp,
    cipherText: user.forgetPasswordOtp,
    algorithm: HashEnum.Argon2,
  });
  if (!isValidOtp) throw BadRequestException("Invalid otp");

  const hashedNewPassword = await generateHash({
    plainText: newPassword,
    algorithm: HashEnum.Argon2,
  });

  await updateOne({
    model: UserModel,
    filter: { email },
    update: {
      password: hashedNewPassword,
      $unset: { forgetPasswordOtp: true },
    },
  });

  successResponse({
    res,
    message: "password reset successfully ",
  });
};
