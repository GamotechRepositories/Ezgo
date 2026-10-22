import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

const test = async () => {
  console.log(`Connecting to SMTP server ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}...`);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.verify();
  console.log('✅ SMTP connection and authentication verified successfully!');

  const info = await transporter.sendMail({
    from: `"EzzyGo Admin Security" <${process.env.SMTP_FROM}>`,
    to: process.env.SMTP_USER,
    subject: 'EzzyGo SMTP Configuration Test',
    text: 'This is a test email verifying that EzzyGo Admin Panel SMTP email delivery is operational.',
  });

  console.log('✅ Real test email sent successfully! Message ID:', info.messageId);
  process.exit(0);
};

test().catch((err) => {
  console.error('❌ SMTP test failed:', err);
  process.exit(1);
});
