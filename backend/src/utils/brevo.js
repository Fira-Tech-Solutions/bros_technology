import { BrevoClient } from '@getbrevo/brevo';

const apiKey = process.env.BREVO_API_KEY;

if (!apiKey) {
  console.warn('[Brevo] BREVO_API_KEY not set - email sending will be simulated');
}

const brevo = new BrevoClient({ apiKey: apiKey || 'dummy-key' });

export async function sendEmail({ to, subject, htmlContent, textContent, from }) {
  if (!apiKey) {
    console.log('[Brevo] Simulated email send:', { to, subject });
    return { success: true, simulated: true };
  }

  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent,
      sender: from || { email: process.env.BREVO_FROM_EMAIL || 'noreply@retailment.com', name: 'Retailment Marketplace' },
    });
    console.log('[Brevo] Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[Brevo] Failed to send email:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function sendPasswordResetEmail(to, resetCode) {
  const subject = 'Your Password Reset Code - Retailment Marketplace';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <!-- Header -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
              <tr>
                <td style="text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #c85a2a; letter-spacing: -0.5px;">Retailment</h1>
                  <p style="margin: 8px 0 0; font-size: 14px; color: #888;">Secure Access</p>
                </td>
              </tr>
            </table>

            <!-- Content -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="font-size: 16px; line-height: 26px; color: #333;">
                  <p style="margin: 0 0 16px;">You requested a password reset for your Retailment Marketplace account.</p>
                  
                  <p style="margin: 0 0 24px;">Use the following 6-digit code to reset your password:</p>
                  
                  <!-- Code Box -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                    <tr>
                      <td style="background-color: #fef3e8; border: 2px solid #c85a2a; border-radius: 12px; padding: 24px; text-align: center;">
                        <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #c85a2a; font-family: 'Courier New', monospace;">${resetCode}</div>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 24px 0 0; font-size: 14px; color: #666;">
                    This code expires in <strong>15 minutes</strong>. Do not share this code with anyone.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding-top: 32px; border-top: 1px solid #eee;">
                  <p style="margin: 0; font-size: 13px; color: #999; line-height: 20px;">
                    If you didn't request this, please ignore this email or contact support if you have concerns.
                  </p>
                </td>
              </tr>
            </table>

            <!-- Footer -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
              <tr>
                <td style="text-align: center; font-size: 12px; color: #aaa;">
                  <p style="margin: 0 0 8px;">Retailment Marketplace</p>
                  <p style="margin: 0;">&copy; ${new Date().getFullYear()} All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `
    Password Reset Code - Retailment Marketplace
    
    You requested a password reset for your Retailment Marketplace account.
    
    Your 6-digit code: ${resetCode}
    
    This code expires in 15 minutes. Do not share this code with anyone.
    
    If you didn't request this, please ignore this email.
    
    Retailment Marketplace
  `;

  return sendEmail({
    to,
    subject,
    htmlContent,
    textContent,
    from: { email: process.env.BREVO_FROM_EMAIL || 'noreply@retailment.com', name: 'Retailment Marketplace' },
  });
}