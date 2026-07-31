import { model } from "mongoose";
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

  if (user.phone) user.phone = decrypt(user.phone);
  successResponse({
    res,
    message: "User logged in successfully",
    data: { user },
  });
};
