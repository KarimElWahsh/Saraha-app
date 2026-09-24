import { findByIdAndUpdate, updateOne } from "../../DB/database.repository.js";
import UserModel from "../../DB/Models/user.model.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import { BadRequestException } from "../../Utils/response/error.response.js";
import { successResponse } from "../../Utils/response/success.response.js";
import { decrypt } from "../../Utils/security/encryption.security.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/security/hash.security.js";

export const getProfile = async (req, res) => {
  let { user } = req;
  if (user.phone) user.phone = decrypt(user.phone);
  successResponse({
    res,
    statusCode: 200,
    data: { user },
  });
};

export const updateProfilePic = async (req, res) => {
  const user = await findByIdAndUpdate({
    model: UserModel,
    id: req.user._id,
    update: { profilePic: req.file.finalPath },
  });
  successResponse({
    res,
    statusCode: 200,
    data: { user },
  });
};

export const updateCoverImages = async (req, res) => {
  const user = await findByIdAndUpdate({
    model: UserModel,
    id: req.user._id,
    update: { coverImages: [...req.files.map((file) => file.finalPath)] },
  });
  successResponse({
    res,
    statusCode: 200,
    data: { user },
  });
};

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const isValidPassword = await compareHash({
    plainText: oldPassword,
    cipherText: req.user.password,
    algorithm: HashEnum.Argon2,
  });
  if (!isValidPassword) throw BadRequestException("Invalid password");

  const hashedPassword = await generateHash({
    plainText: newPassword,
    algorithm: HashEnum.Argon2,
  });
  await updateOne({
    model: UserModel,
    filter: { _id: req.user._id },
    update: { password: hashedPassword },
  });

  successResponse({
    res,
    message: "Password updated successfully",
  });
};
