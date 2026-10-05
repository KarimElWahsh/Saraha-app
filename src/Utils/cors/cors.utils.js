import { WHITE_LIST } from "../../../config/config.service.js";
import { BadRequestException } from "../response/error.response.js";

export function corsOptions() {
  const WhiteList = WHITE_LIST.split(",");
  const corsOptions = {
    origin: function (origin, callback) {
      if (WhiteList.includes(origin)) {
        callback(null, true);
      } else if (!origin) {
        callback(null, true);
      } else {
        callback(BadRequestException("Not Allowed By CORS"));
      }
    },
  };
  return corsOptions;
}
