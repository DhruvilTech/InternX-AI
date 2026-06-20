import nodemailer from 'nodemailer';

export const sendMail = async ({ to, subject, html, text }) => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  let from = process.env.EMAIL_FROM || `"InternX AI" <noreply@internx.ai>`;

  // Prevent Gmail SMTP spam triggering by aligning From header with the authenticated sender
  if (host.includes('gmail') && user && !from.includes(user)) {
    from = user;
  }

  console.log(`[MAILER] Preparing to send email to: ${to}`);
  console.log(`[MAILER] Subject: ${subject}`);

  // Fallback check if EMAIL_USER is a placeholder or not set
  if (!user || user === 'your_email@gmail.com' || !pass) {
    console.log('------------------------------------------------------------');
    console.log(`[MAILER FALLBACK] SMTP not configured. Outputting email details:`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`CONTENT:\n${text || html}`);
    console.log('------------------------------------------------------------');
    return { success: true, fallback: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log(`[MAILER] Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[MAILER ERROR] Failed to send email via SMTP: ${error.message}`);
    console.log('------------------------------------------------------------');
    console.log(`[MAILER FALLBACK] Outputting email details due to SMTP error:`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`CONTENT:\n${text || html}`);
    console.log('------------------------------------------------------------');
    return { success: true, fallback: true, error: error.message };
  }
};
export default sendMail;
