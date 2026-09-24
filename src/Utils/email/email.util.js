import nodemailer from "nodemailer";
import { USER_EMAIL, USER_PASS } from "../../../config/config.service.js";

export async function sendEmail({
  to,
  subject,
  text,
  html,
  cc,
  bcc,
  attachments,
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: USER_EMAIL,
      pass: USER_PASS,
    },
  });
  try {
    const info = await transporter.sendMail({
      from: `"Sara7a App" <${USER_EMAIL}>`,
      to,
      subject,
      text,
      html,
      cc,
      bcc,
      attachments,
    });

    console.log(`Email sent : ${info.messageId}`);
  } catch (error) {
    console.log(`Error while sending Email : ${error}`);
  }
}

export const emailSubject = {
  confirmEmail: "Confirm Your Email",
  resetPassword: "Reset Your Password",
  welcome: "welcome to Sara7a App",
  contactUs: "Contact Us",
};
