export const confirmEmailTemplate = ({ otp, username, subject }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
      </head>

      <body style="
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        font-family: Arial, sans-serif;
      ">

        <div style="
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          padding: 40px;
          border-radius: 10px;
        ">

          <h2>Hello ${username},</h2>

          <p>
            Thank you for registering with us.
          </p>

          <p>
            Please use the following OTP to confirm your email address:
          </p>

          <div style="
            margin: 25px 0;
            padding: 20px;
            text-align: center;
            background-color: #f1f1f1;
            border-radius: 8px;
          ">
            <span style="
              font-size: 30px;
              font-weight: bold;
              letter-spacing: 8px;
            ">
              ${otp}
            </span>
          </div>

          <p>
            This OTP is valid for a limited time.
          </p>

          <p>
            If you did not create an account, please ignore this email.
          </p>

          <p>
            Best regards,<br />
            Sara7a App Team
          </p>

        </div>

      </body>
    </html>
  `;
};
