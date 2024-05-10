import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendSpiderShared(email, spiderKey, sharer) {
  const link = `${process.env.SPIDER_SHARE_LINK_PREFIX}?fl=${spiderKey}`;
  const message = `Hi there,
  
${sharer} has sent you a file to view. Please use the link below to view the file.

${link}.

The Spider-Drop team
  `;

  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "File shared with you",
    text: message,
    html: `<p>${message}</p>`,
  });
}
