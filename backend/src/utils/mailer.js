/**
 * Minimal mail abstraction. Every "send an email" call in the app goes
 * through this one function — swap the transport (SES/SendGrid/etc.)
 * here later without touching any controller.
 */
async function sendMail({ to, subject, html }) {
  if (process.env.NODE_ENV === 'production') {
    // TODO: wire a real provider (SES/SendGrid) before going live.
    throw new Error('Mail transport not configured for production');
  }
  // eslint-disable-next-line no-console
  console.log(`[mailer] (dev) To: ${to} | Subject: ${subject}\n${html}`);
}

function buildSetPasswordEmail({ name, link }) {
  return {
    subject: 'Set up your PolynexAI Admin account',
    html: `
      <p>Hi ${name},</p>
      <p>An admin account has been created for you on PolynexAI. Click the link below to set your password and sign in:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link expires in 24 hours. If you didn't expect this, you can ignore it.</p>
    `,
  };
}

module.exports = { sendMail, buildSetPasswordEmail };
