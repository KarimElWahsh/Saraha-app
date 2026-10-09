import { TooManyRequestsException } from "../Utils/response/error.response.js";

const ipRequest = {}; // object of IPs that request on same window

const blockedIps = new Set(); // unique array to show blocked ips

const unBlockersTimers = new Map(); // IP -> unblock timer

const RATE_LIMIT = 100;
const WINDOW_MS = 15 * 60 * 1000; //15 mins

export const customRateLimiter = () => {
  return (req, res, next) => {
    const ip = req.ip;

    const currentTime = Date.now();

    // IP already blocked
    if (blockedIps.has(ip))
      throw TooManyRequestsException(
        "Too many requests, please try again later",
      );

    // check IP is new
    if (!ipRequest[ip]) {
      ipRequest[ip] = {
        count: 1,
        startTime: currentTime,
      };
      return next();
    }

    const diff = currentTime - ipRequest[ip].startTime;

    //  if in time range
    if (diff < WINDOW_MS) {
      ipRequest[ip].count++;

      // reached count limit
      if (ipRequest[ip].count > RATE_LIMIT) {
        blockedIps.add(ip); // BLOCKED

        // RESET ACCESS
        if (!unBlockersTimers.has(ip)) {
          const timer = setTimeout(() => {
            blockedIps.delete(ip);
            delete ipRequest[ip];
            unBlockersTimers.delete(ip);
          }, WINDOW_MS);
          unBlockersTimers.set(ip, timer);
        }

        throw TooManyRequestsException(
          "Too many requests, please try again later",
        );
      }
    } else {
      ipRequest[ip] = {
        count: 1,
        startTime: currentTime,
      };
    }

    return next();
  };
};
