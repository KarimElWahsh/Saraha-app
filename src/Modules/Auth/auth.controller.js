import { Router } from "express";
import * as authService from "./auth.service.js";
import { authentication } from "../../Middleware/authentication.middleware.js";
import { TokenTypeEnum } from "../../Utils/enums/user.enum.js";
import * as authValidation from "./auth.validation.js";
import { validation } from "../../Middleware/validation.middleware.js";

const router = Router();

router.post(
  "/signup",
  validation(authValidation.signupSchema),
  authService.signup,
);
router.post(
  "/login",
  validation(authValidation.loginSchema),
  authService.login,
);

router.patch(
  "/confirm-email",
  validation(authValidation.confirmEmailSchema),
  authService.confirmEmail,
);
router.patch(
  "/forget-password",
  validation(authValidation.forgetPasswordSchema),
  authService.forgetPassword,
);
router.patch(
  "/reset-password",
  validation(authValidation.resetPasswordSchema),
  authService.resetPassword,
);
router.post(
  "/refresh-token",
  authentication({ tokenType: TokenTypeEnum.Refresh }),
  authService.refreshToken,
);
router.post("/social-login", authService.loginWithGoogle);

router.post(
  "/logout",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authService.logout,
);

export default router;
