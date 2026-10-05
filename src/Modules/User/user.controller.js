import { Router } from "express";
import * as userService from "./user.service.js";
import {
  authentication,
  authorization,
} from "../../Middleware/authentication.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../Utils/enums/user.enum.js";
import * as userValidation from "./user.validation.js";
import {
  fileValidation,
  localFileUpload,
} from "../../Utils/multer/local.multer.js";
import { validation } from "../../Middleware/validation.middleware.js";
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

router.patch(
  "/update-password",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRole: [RoleEnum.ADMIN, RoleEnum.USER] }),
  validation(userValidation.updatePasswordSchema),
  userService.updatePassword,
);

router.patch(
  "{/:userId}/freeze-account",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRole: [RoleEnum.ADMIN, RoleEnum.USER] }),
  validation(userValidation.freezeSchema),
  userService.freezeAccount,
);

router.patch(
  "{/:userId}/restore-account",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRole: [RoleEnum.ADMIN, RoleEnum.USER] }),
  validation(userValidation.restoreSchema),
  userService.restoreAccount,
);

router.delete(
  "/:userId/delete-account",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRole: [RoleEnum.ADMIN] }),
  validation(userValidation.hardDeleteSchema),
  userService.hardDelete,
);

export default router;
