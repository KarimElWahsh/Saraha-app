import jwt from "jsonwebtoken";
import { RoleEnum, SignatureEnum } from "../enums/user.enum.js";
import {
  ACCESS_TOKEN_ADMIN_EXPIRES_IN,
  ACCESS_TOKEN_ADMIN_SECRET,
  ACCESS_TOKEN_USER_EXPIRES_IN,
  ACCESS_TOKEN_USER_SECRET,
  REFRESH_TOKEN_ADMIN_EXPIRES_IN,
  REFRESH_TOKEN_ADMIN_SECRET,
  REFRESH_TOKEN_USER_EXPIRES_IN,
  REFRESH_TOKEN_USER_SECRET,
} from "../../../config/config.service.js";

export const generateToken = ({ payload, secreteKey, options = {} }) => {
  return jwt.sign(payload, secreteKey, options);
};

export const verifyToken = ({ token, secreteKey }) => {
  return jwt.verify(token, secreteKey);
};

export const getSignature = ({ signatureLevel = SignatureEnum.USER }) => {
  let signature = { accessSignature: undefined, refreshSignature: undefined };

  switch (signatureLevel) {
    case SignatureEnum.ADMIN:
      signature.accessSignature = ACCESS_TOKEN_ADMIN_SECRET;
      signature.refreshSignature = REFRESH_TOKEN_ADMIN_SECRET;
      break;
    case SignatureEnum.USER:
      signature.accessSignature = ACCESS_TOKEN_USER_SECRET;
      signature.refreshSignature = REFRESH_TOKEN_USER_SECRET;
      break;
    default:
      signature.accessSignature = ACCESS_TOKEN_USER_SECRET;
      signature.refreshSignature = REFRESH_TOKEN_USER_SECRET;
      break;
  }
  return signature;
};

export const getNewLoginCredentials = async (
  user,
  { generateRefreshToken = true } = {},
) => {
  const signature = await getSignature({
    signatureLevel:
      user.role !== RoleEnum.ADMIN ? SignatureEnum.USER : SignatureEnum.ADMIN,
  });

  const accessToken = generateToken({
    payload: { id: user._id },
    secreteKey: signature.accessSignature,
    options: {
      expiresIn:
        user.role !== RoleEnum.ADMIN
          ? Number(ACCESS_TOKEN_USER_EXPIRES_IN)
          : Number(ACCESS_TOKEN_ADMIN_EXPIRES_IN),
    },
  });
  if (!generateRefreshToken) return { accessToken };

  const refreshToken = generateToken({
    payload: { id: user._id },
    secreteKey: signature.refreshSignature,
    options: {
      expiresIn:
        user.role !== RoleEnum.ADMIN
          ? Number(REFRESH_TOKEN_USER_EXPIRES_IN)
          : Number(REFRESH_TOKEN_ADMIN_EXPIRES_IN),
    },
  });

  return { accessToken, refreshToken };
};
