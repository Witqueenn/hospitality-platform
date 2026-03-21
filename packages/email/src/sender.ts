import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env["SMTP_HOST"] ?? "localhost",
  port: Number(process.env["SMTP_PORT"] ?? 1025),
  secure: false,
  auth: process.env["SMTP_USER"]
    ? { user: process.env["SMTP_USER"], pass: process.env["SMTP_PASS"] }
    : undefined,
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  await transporter.sendMail({
    from: process.env["SMTP_FROM"] ?? "noreply@hospitality.local",
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}
