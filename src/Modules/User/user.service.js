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
