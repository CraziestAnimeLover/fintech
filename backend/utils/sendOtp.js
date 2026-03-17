
import { createTransport } from 'nodemailer';

/**
 * Send OTP via Email using Nodemailer
 * @param {string} email - Recipient's email address
 * @param {string} otp - OTP code to send
 * @returns {Promise<object>} - Email send result
 */
export async function sendOtp(email, otp) {
  // Create transporter
  const transporter = createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials not configured');
    // For development/testing, log the OTP
    console.log(`OTP for ${email}: ${otp}`);
    return { success: true, devMode: true, message: 'OTP logged (dev mode)' };
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Failed to send OTP email');
  }
}

/**
 * Send verification success email
 * @param {string} email - Recipient's email address
 */
export async function sendVerificationSuccess(email) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return { success: true, devMode: true };
  }

  const transporter = createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verified Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #28a745;">✓ Verified!</h2>
        <p>Your email address has been successfully verified.</p>
        <p>You can now access all features of our platform.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending success email:', error.message);
  }
}


