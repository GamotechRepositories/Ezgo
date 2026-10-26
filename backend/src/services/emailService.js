import nodemailer from 'nodemailer';

let transporter = null;
let customTransporter = null;

/**
 * Configure or override the email transporter (useful for testing with mock transporters)
 */
export const setTransporter = (mock) => {
  customTransporter = mock;
};

export const resetTransporter = () => {
  customTransporter = null;
  transporter = null;
};

const maskEmail = (email = '') => {
  const [local, domain] = String(email).split('@');
  if (!domain) return '***';
  const maskedLocal = local.length <= 2 ? local[0] + '***' : local[0] + '***' + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
};

const getTransporter = async () => {
  if (customTransporter) return customTransporter;
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT) || 465;
    const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: isSecure,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development fallback transporter (safe console logger, does NOT expose secret payload)
    transporter = {
      sendMail: async (options) => {
        if (process.env.NODE_ENV !== 'test') {
          console.log(`[EMAIL DISPATCH - SIMULATED] To: ${maskEmail(options.to)} | Subject: ${options.subject}`);
        }
        return { messageId: 'simulated-' + Date.now() };
      },
    };
  }

  return transporter;
};

/**
 * Send an HTML/Text email safely
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) return null;
  try {
    const client = await getTransporter();
    const fromAddress = process.env.SMTP_FROM
      ? `"EzzyGo Admin Security" <${process.env.SMTP_FROM}>`
      : '"EzzyGo Admin Security" <noreply@ezzygoevents.in>';

    const info = await client.sendMail({
      from: fromAddress,
      to,
      subject,
      text: text || '',
      html: html || text || '',
    });
    return info;
  } catch (error) {
    // Safe error logging without exposing credentials
    console.error('Email send failed:', error?.message || 'SMTP Connection Error');
    throw error;
  }
};

/**
 * Generate EzzyGo Branded Admin OTP Email
 */
export const sendAdminOtpEmail = async ({ to, otpCode, adminName = 'Admin' }) => {
  const subject = 'Your EzzyGo Admin Login OTP';

  const plainText = `EzzyGo Admin Panel — Verification Code

Hello ${adminName},

Your one-time login verification code is: ${otpCode}

This code expires in 5 minutes.

SECURITY NOTICE:
- Never share this code with anyone, including EzzyGo support staff.
- If you did not request this login verification code, please ignore this email or review your account security immediately.

— EzzyGo Security Team
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 560px;
      margin: 32px auto;
      background-color: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
      padding: 32px 36px 24px 36px;
      border-bottom: 1px solid #fed7aa;
      text-align: left;
    }
    .logo-badge {
      display: inline-block;
      font-size: 22px;
      font-weight: 800;
      color: #f95724;
      letter-spacing: -0.5px;
    }
    .tagline {
      display: inline-block;
      margin-left: 8px;
      background-color: #f95724;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 9999px;
      vertical-align: middle;
    }
    .content {
      padding: 32px 36px;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 12px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .otp-card {
      background-color: #fff6f1;
      border: 2px dashed #f95724;
      border-radius: 14px;
      padding: 24px 16px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #ea580c;
      margin: 0;
      padding-left: 8px;
    }
    .expiry-note {
      font-size: 13px;
      color: #c2410c;
      font-weight: 600;
      margin-top: 10px;
      margin-bottom: 0;
    }
    .security-box {
      background-color: #f8fafc;
      border-left: 4px solid #f95724;
      border-radius: 4px;
      padding: 14px 16px;
      margin: 24px 0 16px 0;
    }
    .security-box p {
      font-size: 13px;
      line-height: 1.5;
      color: #334155;
      margin: 0;
    }
    .security-box p strong {
      color: #0f172a;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px 36px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="logo-badge">EzzyGo</span>
      <span class="tagline">Admin Portal</span>
    </div>
    <div class="content">
      <h1>Admin Login Verification</h1>
      <p>Hello ${adminName},</p>
      <p>A sign-in attempt was initiated for your authorized administrator account. Use the following 6-digit verification code to complete your login:</p>
      
      <div class="otp-card">
        <div class="otp-code">${otpCode}</div>
        <p class="expiry-note">⏳ Expires in 5 minutes</p>
      </div>

      <div class="security-box">
        <p><strong>Security Notice:</strong> Never share this code with anyone. EzzyGo staff will never ask for your verification code.</p>
      </div>
      
      <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
        If you did not request this login code, you can safely ignore this email. No access will be granted without this code.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} EzzyGo Event Services Private Limited. Confidential admin communication.
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject,
    text: plainText,
    html,
  });
};
