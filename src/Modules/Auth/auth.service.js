import { model, Types } from "mongoose";
import { create, findOne } from "../../DB/database.repository.js";
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
import { ProviderEnum } from "../../Utils/enums/user.enum.js";

export const signup = async (req, res) => {
  const { username, email, password, phone } = req.body;

  if (await findOne({ model: UserModel, filter: { email } }))
    ConflictException("User already exists");

  const hashedPassword = await generateHash({
    plainText: password,
    algorithm: HashEnum.BCRYPT,
  });

  const encryptedPhone = encrypt(phone);
  const user = await create({
    model: UserModel,
    data: [
      { username, email, password: hashedPassword, phone: encryptedPhone },
    ],
  });

  successResponse({
    res,
    statusCode: 201,
    message: "User created successfully",
    data: { user },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await findOne({
    model: UserModel,
    filter: { email },
  });
  if (!user) NotFoundException("User not found");

  const isPasswordValid = await compareHash({
    plainText: password,
    cipherText: user.password,
    algorithm: HashEnum.BCRYPT,
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
