import { find, findById, findOne } from "../DB/database.repository.js";
import TokenModel from "../DB/Models/token.model.js";
import UserModel from "../DB/Models/user.model.js";
import { SignatureEnum, TokenTypeEnum } from "../Utils/enums/user.enum.js";
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "../Utils/response/error.response.js";
import { getSignature, verifyToken } from "../Utils/tokens/tokens.js";

export const decodedToken = async ({
  authorization,
  tokenType = TokenTypeEnum.Access,
}) => {
  const [Bearer, token] = authorization.split(" ") || [];
  if (Bearer !== "ADMIN" && Bearer !== "USER") {
    throw BadRequestException("Invalid authorization header");
  }
  let signature = await getSignature({
    signatureLevel:
      Bearer === "ADMIN" ? SignatureEnum.ADMIN : SignatureEnum.USER,
  });

  const decoded = verifyToken({
    token,
    secreteKey:
      tokenType === TokenTypeEnum.Access
        ? signature.accessSignature
        : signature.refreshSignature,
  });
  if (await findOne({ model: TokenModel, filter: { jti: decoded.jti } })) {
    return UnauthorizedException({ message: "Token is Revoked" });
  }
  const user = await findById({ model: UserModel, id: decoded.id });
  if (!user) throw BadRequestException("user not found");
  if (user.changeCredentialsTime?.getTime() > decoded.iat * 1000) {
    return UnauthorizedException({ message: "Token is Expired" });
  }
  return { user, decoded };
};

export const authentication = ({ tokenType = TokenTypeEnum.Access }) => {
  return async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
      })) || {};
    req.user = user;
    req.decoded = decoded;
    return next();
  };
};

export const authorization = ({ accessRole = [] }) => {
  return async (req, res, next) => {
    if (!accessRole.includes(req.user.role))
      throw ForbiddenException("Unauthorized access");
    return next();
  };
};
