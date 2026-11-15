import fs from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { DateTime } from 'luxon';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const emailDir = path.resolve('server/tmp/emails');

function visitText(appointment) {
  const start = DateTime.fromJSDate(new Date(appointment.startAt))
    .setZone(env.CLINIC_TIMEZONE)
    .toFormat('ccc dd LLL, HH:mm');
  return `${appointment.doctor.name} on ${start}`;
}

function manageLink(appointment, token) {
  return `${env.CLIENT_URL}/appointment/manage?ref=${encodeURIComponent(appointment.reference)}&token=${encodeURIComponent(token)}`;
}

async function send({ to, subject, text, html }) {
  if (!env.SMTP_HOST) {
    await fs.mkdir(emailDir, { recursive: true });
    const safeTo = to.replace(/[^a-z0-9._-]/gi, '_');
    const file = path.join(emailDir, `${Date.now()}-${safeTo}.html`);
    await fs.writeFile(file, html, 'utf8');
    logger.info(`Development email saved for ${safeTo}: ${subject}`);
    return;
  }
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false
  });
  await transport.sendMail({ from: env.EMAIL_FROM, to, subject, text, html });
}

function appointmentHtml(title, appointment, extra = '') {
  return `<main><h1>${title}</h1><p>${extra}</p><p><strong>Reference:</strong> ${appointment.reference}</p><p><strong>Doctor:</strong> ${appointment.doctor.name}</p><p><strong>Visit:</strong> ${visitText(appointment)}</p><p>Emergency, 24 hours: (042) 111-000-911</p></main>`;
}

export async function sendBookingConfirmation(appointment) {
  const link = manageLink(appointment, appointment.manageToken);
  const text = `Your Serenova Clinic request ${appointment.reference} is pending. Manage it: ${link}`;
  const html = appointmentHtml(
    'Appointment request received',
    appointment,
    `The clinic will confirm your request. <a href="${link}">Manage this appointment</a>.`
  );
  await send({ to: appointment.guest.email, subject: `${env.CLINIC_NAME}: ${appointment.reference}`, text, html });
}

export async function sendCancellation(appointment) {
  const text = `Your Serenova Clinic appointment ${appointment.reference} was cancelled.`;
  const html = appointmentHtml('Appointment cancelled', appointment, 'Your appointment has been cancelled.');
  await send({ to: appointment.guest.email, subject: `${env.CLINIC_NAME}: appointment cancelled`, text, html });
}

export async function sendReschedule(appointment) {
  const text = `Your Serenova Clinic appointment ${appointment.reference} was moved to ${visitText(appointment)}.`;
  const html = appointmentHtml('Appointment updated', appointment, 'Your appointment time has been updated.');
  await send({ to: appointment.guest.email, subject: `${env.CLINIC_NAME}: appointment updated`, text, html });
}

export async function sendContactReceived(message) {
  const text = `We received your message about "${message.subject}".`;
  const html = `<main><h1>Message received</h1><p>Thank you for contacting ${env.CLINIC_NAME}. We received your message about "${message.subject}".</p><p>Emergency, 24 hours: (042) 111-000-911</p></main>`;
  await send({ to: message.email, subject: `${env.CLINIC_NAME}: message received`, text, html });
}

export async function sendWelcomeEmail({ email, fullName }) {
  const html = `<main><h1>Welcome to ${env.CLINIC_NAME}</h1><p>Hello ${fullName}, your account is ready.</p></main>`;
  await send({ to: email, subject: `Welcome to ${env.CLINIC_NAME}`, text: `Welcome, ${fullName}!`, html });
}

export async function sendPasswordResetEmail({ email, token }) {
  const link = `${env.CLIENT_URL}/reset-password/${encodeURIComponent(token)}`;
  const html = `<main><h1>Password reset</h1><p><a href="${link}">Reset your password</a>. This link expires in one hour.</p></main>`;
  await send({ to: email, subject: `${env.CLINIC_NAME}: password reset`, text: `Reset your password: ${link}`, html });
}
