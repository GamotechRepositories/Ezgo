import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development fallback transporter (console logger)
    transporter = {
      sendMail: async (options) => {
        console.log(`\n📧 [EMAIL DISPATCH - SIMULATED]`);
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body: ${options.text || options.html?.slice(0, 120)}...`);
        console.log(`====================================\n`);
        return { messageId: 'simulated-' + Date.now() };
      },
    };
  }

  return transporter;
};

/**
 * Send an HTML/Text email
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) return null;
  try {
    const client = await getTransporter();
    const info = await client.sendMail({
      from: process.env.SMTP_FROM || '"EzzyGo Events" <noreply@ezzygo.com>',
      to,
      subject,
      text: text || '',
      html: html || text || '',
    });
    return info;
  } catch (error) {
    console.error('Email send failed:', error?.message);
    return null;
  }
};
