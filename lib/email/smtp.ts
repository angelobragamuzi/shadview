import nodemailer from "nodemailer";

type SendSmtpMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`A variável de ambiente ${name} não foi configurada.`);
  }

  return value;
}

function getSmtpTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = getRequiredEnv("SMTP_HOST");
  const port = Number.parseInt(process.env.SMTP_PORT ?? "465", 10);

  if (Number.isNaN(port)) {
    throw new Error("A variável SMTP_PORT precisa ser um número válido.");
  }

  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE.toLowerCase() === "true"
      : port === 465;

  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASS");

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
}

export async function sendSmtpMail(input: SendSmtpMailInput) {
  const from = process.env.BILLING_EMAIL_FROM ?? getRequiredEnv("SMTP_USER");
  const transporter = getSmtpTransporter();

  await transporter.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}
