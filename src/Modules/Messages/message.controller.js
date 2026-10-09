import { Router } from "express";
import * as messageService from "./message.service.js";
import * as messageValidation from "./message.validation.js";
import { validation } from "../../Middleware/validation.middleware.js";
import { authentication } from "../../Middleware/authentication.middleware.js";
import { TokenTypeEnum } from "../../Utils/enums/user.enum.js";

const router = Router();

router.post(
  "/send-message/:receiverId",
  validation(messageValidation.sendMessageSchema),
  messageService.sendMessage,
);

router.get(
  "/",
  authentication({ tokenType: TokenTypeEnum.Access }),
  messageService.getAllMessages,
);

router.patch(
  "/read/:messageId",
  authentication({ tokenType: TokenTypeEnum.Access }),
  validation(messageValidation.toggleStatusSchema),
  messageService.toggleRead,
);

router.patch(
  "/favorite/:messageId",
  authentication({ tokenType: TokenTypeEnum.Access }),
  validation(messageValidation.toggleStatusSchema),
  messageService.toggleFav,
);
export default router;
