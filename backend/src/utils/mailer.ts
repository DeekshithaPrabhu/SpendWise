import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });
  }
  return transporter;
}

interface Mail { to: string; subject: string; text: string; html: string; }

/** Sends via SMTP when configured; otherwise prints the email to the console (dev mode). */
export async function sendMail(mail: Mail): Promise<void> {
  if (!env.smtp.host) {
    console.log('Forgot Password');
    console.log(`\n[mail:dev] To: ${mail.to}\n[mail:dev] Subject: ${mail.subject}\n${mail.text}\n`);
    return;
  }
  await getTransporter().sendMail({ from: env.smtp.from, ...mail });
}
