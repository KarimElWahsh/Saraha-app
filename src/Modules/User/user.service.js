import {
  deleteOne,
  findById,
  findByIdAndUpdate,
  findOneAndUpdate,
  updateOne,
} from "../../DB/database.repository.js";
import UserModel from "../../DB/Models/user.model.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import { RoleEnum } from "../../Utils/enums/user.enum.js";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/response/error.response.js";
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

export const freezeAccount = async (req, res) => {
  const { userId } = req.params;

  const targetUser = userId || req.user._id;
  if (
    targetUser.toString() !== req.user._id.toString() &&
    req.user.role !== RoleEnum.ADMIN
  )
    throw ForbiddenException("You are not allowed to freeze this account");

  const updatedUser = await findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: targetUser,
      freezedAt: { $exists: false },
    },
    update: {
      freezedBy: req.user._id,
      freezedAt: new Date(),
      freezedByRole: req.user.role,
      $unset: { restoredBy: false, restoredAt: false },
    },
  });

  if (!updatedUser)
    throw NotFoundException("account not Found or already frozen ");

  successResponse({
    res,
    message: "account frozen successfully",
    statusCode: 200,
    data: { updatedUser },
  });
};

export const restoreAccount = async (req, res) => {
  const { userId } = req.params;

  const targetUserId = userId || req.user._id;

  const user = await findById({ model: UserModel, id: targetUserId });
  if (user.restoredAt) throw BadRequestException("Account already active");
  if (user.freezedByRole === RoleEnum.ADMIN) {
    if (req.user.role !== RoleEnum.ADMIN)
      throw ForbiddenException("contact admin to restore this account");
  } else {
    if (
      targetUserId.toString() !== req.user._id.toString() &&
      req.user.role !== RoleEnum.ADMIN
    )
      throw ForbiddenException("You are not allowed to restore account ");
  }

  const updatedUser = await findByIdAndUpdate({
    model: UserModel,
    id: targetUserId,
    update: {
      restoredAt: new Date(),
      restoredBy: req.user._id,
      $unset: {
        freezedAt: true,
        freezedBy: true,
        freezedByRole: true,
      },
    },
  });
  successResponse({
    res,
    message: "account restored successfully",
    statusCode: 200,
    data: { updatedUser },
  });
};

export const hardDelete = async (req, res) => {
  const { userId } = req.params;

  const result = await deleteOne({
    model: UserModel,
    filter: { _id: userId },
  });

  if (!result.deletedCount) throw NotFoundException("User not found");

  successResponse({
    res,
    statusCode: 200,
    message: "account deleted Successfully",
  });
};
