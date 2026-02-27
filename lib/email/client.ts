import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

export const isEmailConfigured = Boolean(apiKey);

export const resend = new Resend(apiKey || 'placeholder');

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!isEmailConfigured) {
    console.log('[Email] Resend not configured. Would send:', { to, subject });
    return;
  }

  return resend.emails.send({
    from: 'Duane Syndrome Portal <noreply@duane-syndrome.com>',
    to,
    subject,
    html,
  });
}
