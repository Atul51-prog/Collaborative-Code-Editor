const nodemailer = require('nodemailer');

let cachedTestTransporter = null;

/**
 * Creates and returns a Nodemailer transporter based on environment configuration.
 */
const getTransporter = async () => {
    const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
    const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '').trim() : '';

    // 1. Explicit custom SMTP credentials
    if (process.env.SMTP_HOST && user && pass) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: user,
                pass: pass,
            },
        });
    }

    // 2. Predefined service (e.g. gmail, hotmail, yahoo)
    if (process.env.EMAIL_SERVICE && user && pass) {
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: user,
                pass: pass,
            },
        });
    }

    // 3. Fallback: Ethereal test account for automated live preview in development
    try {
        if (!cachedTestTransporter) {
            const testAccount = await nodemailer.createTestAccount();
            cachedTestTransporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log('[EmailService] Created temporary Ethereal test account:', testAccount.user);
        }
        return cachedTestTransporter;
    } catch (e) {
        console.warn('[EmailService] Could not initialize test account:', e.message);
        return null;
    }
};

/**
 * Send password reset verification code email.
 */
const sendPasswordResetCode = async (toEmail, code, userName = '') => {
    const fromAddress = process.env.EMAIL_FROM || '"SynCode Support" <no-reply@syncode.dev>';
    const subject = `Your SynCode Password Reset Code: ${code}`;
    
    const textContent = `Hello ${userName || 'SynCode User'},\n\n` +
        `You recently requested to reset your password for your SynCode account.\n\n` +
        `Your 6-digit verification code is: ${code}\n\n` +
        `This code is valid for 15 minutes. If you did not request this, please ignore this email and your password will remain unchanged.\n\n` +
        `Best regards,\nSynCode Team`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0e1117; color: #ffffff; padding: 20px; }
            .container { max-width: 520px; margin: 0 auto; background: #1b1e26; border-radius: 10px; border: 1px solid #2d333b; padding: 30px; }
            .header { text-align: center; border-bottom: 1px solid #2d333b; padding-bottom: 20px; margin-bottom: 25px; }
            .brand { font-size: 26px; font-weight: bold; color: #4fc1ff; letter-spacing: 1px; }
            .content { font-size: 15px; line-height: 1.6; color: #c9d1d9; }
            .code-box { background: #0d1117; border: 2px dashed #4fc1ff; border-radius: 8px; text-align: center; padding: 18px; margin: 25px 0; }
            .code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #58a6ff; font-family: monospace; }
            .note { font-size: 13px; color: #8b949e; margin-top: 20px; }
            .footer { font-size: 12px; color: #6e7681; text-align: center; margin-top: 30px; border-top: 1px solid #2d333b; padding-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="brand">SynCode</div>
            </div>
            <div class="content">
                <p>Hello <strong>${userName || 'User'}</strong>,</p>
                <p>We received a request to reset your password for your SynCode account. Use the verification code below to complete the reset:</p>
                
                <div class="code-box">
                    <div class="code">${code}</div>
                </div>

                <p class="note">⚠️ This verification code is valid for <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} SynCode. Real-time collaborative code editor.
            </div>
        </div>
    </body>
    </html>
    `;

    const isRealSmtpConfigured = Boolean(
        (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
        (process.env.EMAIL_SERVICE && process.env.SMTP_USER && process.env.SMTP_PASS)
    );

    const transporter = await getTransporter();

    if (transporter) {
        try {
            const info = await transporter.sendMail({
                from: fromAddress,
                to: toEmail,
                subject: subject,
                text: textContent,
                html: htmlContent,
            });

            const previewUrl = nodemailer.getTestMessageUrl(info);

            console.log(`\n======================================================`);
            if (isRealSmtpConfigured) {
                console.log(`[EmailService] Real email sent to ${toEmail}!`);
                console.log(`Message ID: ${info.messageId}`);
            } else {
                console.log(`[EmailService] (SMTP not configured in server/src/config.env)`);
                console.log(`To: ${toEmail}`);
                console.log(`Subject: ${subject}`);
                console.log(`>>> VERIFICATION CODE: ${code} <<<`);
                if (previewUrl) {
                    console.log(`Preview Email in Browser: ${previewUrl}`);
                }
            }
            console.log(`======================================================\n`);

            return {
                success: true,
                simulated: !isRealSmtpConfigured,
                previewUrl: previewUrl || null,
            };
        } catch (error) {
            console.error(`[EmailService] Error sending email:`, error.message);
            console.log(`[EmailService Fallback] Verification code for ${toEmail}: ${code}`);
            return { success: true, simulated: true, error: error.message };
        }
    } else {
        console.log(`\n======================================================`);
        console.log(`[EmailService] (SMTP not configured)`);
        console.log(`To: ${toEmail}`);
        console.log(`Subject: ${subject}`);
        console.log(`>>> VERIFICATION CODE: ${code} <<<`);
        console.log(`Valid for 15 minutes.`);
        console.log(`======================================================\n`);
        return { success: true, simulated: true };
    }
};

module.exports = {
    sendPasswordResetCode,
    getTransporter,
};
