import mailer from "nodemailer";

export const sendMail = (mail: string, content: string) => {
  const transporter = mailer.createTransport({
    service: "gmail",
    auth: {
      user: "thaikhacmanh1998@gmail.com",
      pass: "manhprox30",
    },
  });
  const mainOptions = {
    from: "thaikhacmanh1998@gmail.com",
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
