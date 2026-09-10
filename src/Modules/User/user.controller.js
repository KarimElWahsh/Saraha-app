import { Router } from "express";
import * as userService from "./user.service.js";
import {
  authentication,
  authorization,
} from "../../Middleware/authentication.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../Utils/enums/user.enum.js";
import {
  fileValidation,
  localFileUpload,
} from "../../Utils/multer/local.multer.js";
const router = Router();

router.get(
  "/get-profile",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRole: [RoleEnum.ADMIN, RoleEnum.USER] }),
  userService.getProfile,
);

router.patch(
  "/upload-file",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRole: [RoleEnum.ADMIN, RoleEnum.USER] }),
  localFileUpload({
    customPath: "users",
    validation: [...fileValidation.images],
  }).single("attachments"),
  userService.updateProfilePic,
);

router.patch(
  "/upload-cover-images",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRole: [RoleEnum.ADMIN, RoleEnum.USER] }),
  localFileUpload({
    customPath: "users",
    validation: [...fileValidation.images],
  }).array("attachments", 5),
  userService.updateCoverImages,
);
export default router;
