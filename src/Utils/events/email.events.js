import { EventEmitter } from "node:events";
import { emailSubject, sendEmail } from "../email/email.util.js";
import { confirmEmailTemplate } from "../email/email.template.js";

export const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail", async (data) => {
  try {
    await sendEmail({
      to: data.to,
      subject: emailSubject.confirmEmail,
      html: confirmEmailTemplate({
        otp: data.otp,
        username: data.username,
        subject: emailSubject.confirmEmail,
      }),
    });
  } catch (error) {
    console.log("Email sent Error", error);
  }
});

emailEvent.on("forgetPassword", async (data) => {
  try {
    await sendEmail({
      to: data.to,
      subject: emailSubject.resetPassword,
      html: confirmEmailTemplate({
        otp: data.otp,
        username: data.username,
        subject: emailSubject.resetPassword,
      }),
    });
  } catch (error) {
    console.log("Email sent Error", error);
  }
});
