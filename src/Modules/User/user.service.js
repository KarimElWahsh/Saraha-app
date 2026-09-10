import { findByIdAndUpdate } from "../../DB/database.repository.js";
import UserModel from "../../DB/Models/user.model.js";
import { successResponse } from "../../Utils/response/success.response.js";
import { decrypt } from "../../Utils/security/encryption.security.js";

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
