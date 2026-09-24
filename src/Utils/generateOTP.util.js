export function generateOtp() {
  return Math.floor(Math.random() * (800000 + 100000) + 100000).toString();
}
