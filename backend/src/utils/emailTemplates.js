/**
 * Generate a premium, dark-themed HTML email wrapper.
 */
const getBaseTemplate = (title, contentHtml) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            background-color: #050816;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #f1f5f9;
          }
          .email-container {
            max-width: 580px;
            margin: 40px auto;
            background-color: #0f1629;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          }
          .email-header {
            padding: 30px 40px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            background: linear-gradient(180deg, #121a2e 0%, #0f1629 100%);
            text-align: center;
          }
          .logo {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: #f1f5f9;
            text-decoration: none;
          }
          .logo-box {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            background: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
            display: inline-block;
            vertical-align: middle;
            margin-right: 8px;
          }
          .email-body {
            padding: 40px;
            line-height: 1.6;
          }
          .greeting {
            font-size: 20px;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 16px;
            color: #ffffff;
            letter-spacing: -0.01em;
          }
          .text-content {
            font-size: 14px;
            color: #94a3b8;
            margin-bottom: 24px;
          }
          .action-box {
            text-align: center;
            margin: 32px 0;
            padding: 24px;
            background-color: rgba(129, 140, 248, 0.04);
            border: 1px solid rgba(129, 140, 248, 0.1);
            border-radius: 12px;
          }
          .otp-code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #818cf8;
            margin: 0;
            display: inline-block;
          }
          .btn-action {
            display: inline-block;
            padding: 12px 28px;
            background: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
            color: #ffffff !important;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(129, 140, 248, 0.2);
            transition: all 0.2s ease;
          }
          .expiry-note {
            font-size: 11px;
            color: #64748b;
            text-align: center;
            margin-top: 12px;
          }
          .email-footer {
            padding: 30px 40px;
            background-color: #050816;
            border-top: 1px solid rgba(255, 255, 255, 0.04);
            text-align: center;
            font-size: 12px;
            color: #475569;
          }
          .footer-links {
            margin-bottom: 16px;
          }
          .footer-links a {
            color: #64748b;
            text-decoration: none;
            margin: 0 10px;
          }
          .footer-links a:hover {
            color: #818cf8;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <a href="https://internx.ai" class="logo">
              <span class="logo-box"></span>
              <span>InternX AI</span>
            </a>
          </div>
          <div class="email-body">
            ${contentHtml}
          </div>
          <div class="email-footer">
            <div class="footer-links">
              <a href="#">Dashboard</a>
              <a href="#">Support</a>
              <a href="#">Privacy Policy</a>
            </div>
            <p>© 2026 InternX AI. All rights reserved.</p>
            <p>This is an automated security message. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Generate verification OTP email template.
 */
export const getOtpTemplate = (otp) => {
  const content = `
    <h2 class="greeting">Email Verification</h2>
    <p class="text-content">
      Thank you for registering with InternX AI. To finalize your account setup, please verify your email address by entering the 4-digit code below on the verification page:
    </p>
    <div class="action-box">
      <h1 class="otp-code">${otp}</h1>
      <p class="expiry-note">This code is valid for 10 minutes and can only be used once.</p>
    </div>
    <p class="text-content" style="margin-bottom: 0;">
      If you did not initiate this request, you can safely ignore this email. Your credentials remain secure.
    </p>
  `;
  return getBaseTemplate('Verify Your Email - InternX AI', content);
};

/**
 * Generate password reset email template.
 */
export const getResetTemplate = (resetUrl) => {
  const content = `
    <h2 class="greeting">Reset Password</h2>
    <p class="text-content">
      We received a request to reset the password associated with your account. Click the button below to specify a new password:
    </p>
    <div class="action-box" style="background-color: transparent; border: none; padding: 12px 0; margin: 24px 0;">
      <a href="${resetUrl}" class="btn-action" target="_blank">Reset Password</a>
      <p class="expiry-note" style="margin-top: 16px;">This recovery link is valid for 1 hour.</p>
    </div>
    <p class="text-content">
      If the button above does not work, copy and paste the following link directly into your browser:
      <br>
      <a href="${resetUrl}" style="color: #818cf8; word-break: break-all; font-size: 12px;">${resetUrl}</a>
    </p>
    <p class="text-content" style="margin-bottom: 0;">
      If you did not request a password reset, no action is required and you can safely ignore this mail.
    </p>
  `;
  return getBaseTemplate('Reset Your Password - InternX AI', content);
};
