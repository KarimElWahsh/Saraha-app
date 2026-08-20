import { Router } from "express";
import * as userService from "./user.service.js";
import {
  authentication,
  authorization,
} from "../../Middleware/authentication.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../Utils/enums/user.enum.js";
const router = Router();

router.get(
  "/get-profile",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRole: [RoleEnum.ADMIN, RoleEnum.USER] }),
  userService.getProfile,
);
export default router;
