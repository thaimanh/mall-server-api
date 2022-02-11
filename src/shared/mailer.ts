import mailer from "nodemailer";
import { env } from "../env";

export const sendMail = (mail: string, content: string) => {
  const transporter = mailer.createTransport({
    service: "gmail",
    auth: {
      user: env.app.userMail,
      pass: env.app.passwordMail,
    },
  });
  const mainOptions = {
    from: env.app.userMail,
    to: mail,
    subject: "Reset password",
    html: content,
  };
  transporter.sendMail(mainOptions, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(
        "Message sent: " + info.accepted + info.envelope + info.messageId
      );
    }
  });
};
