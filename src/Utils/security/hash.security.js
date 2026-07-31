import { hash, compare } from "bcrypt";
import { SALT_ROUND } from "../../../config/config.service.js";
import { HashEnum } from "../enums/security.enum.js";
import * as argon2 from "argon2";
import { BadRequestException } from "../response/error.response.js";

export const generateHash = async ({
  plainText,
  saltRounds = Number(SALT_ROUND),
  algorithm = HashEnum.Bcrypt,
}) => {
  let hashResult = "";

  switch (algorithm) {
    case HashEnum.Bcrypt:
      hashResult = await hash(plainText, saltRounds);
      break;
    case HashEnum.Argon2:
      hashResult = await argon2.hash(plainText);
      break;
    default:
      throw BadRequestException("Unsupported hashing algorithm");
  }
  return hashResult;
};

export const compareHash = async ({
  plainText,
  cipherText,
  algorithm = HashEnum.Bcrypt,
}) => {
  let match = false;

  switch (algorithm) {
    case HashEnum.Bcrypt:
      match = await compare(plainText, cipherText);
      break;
    case HashEnum.Argon2:
      match = await argon2.verify(cipherText, plainText);
      break;
    default:
      throw BadRequestException("Unsupported hashing algorithm");
  }
  return match;
};
