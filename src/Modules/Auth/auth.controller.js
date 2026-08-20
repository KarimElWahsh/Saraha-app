import { Router } from "express";
import * as authService from "./auth.service.js";
import { authentication } from "../../Middleware/authentication.middleware.js";
import { TokenTypeEnum } from "../../Utils/enums/user.enum.js";

const router = Router();

router.post("/signup", authService.signup);
router.post("/login", authService.login);
router.post(
  "/refresh-token",
  authentication({ tokenType: TokenTypeEnum.Refresh }),
  authService.refreshToken,
);
router.post("/social-login", authService.loginWithGoogle);

export default router;
