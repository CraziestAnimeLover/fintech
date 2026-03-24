import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send OTP via Resend
 */
export async function sendOtp(email, otp) {
  try {
    // Fallback if API key missing (dev mode)
    if (!process.env.RESEND_API_KEY) {
      console.log("⚠️ RESEND_API_KEY not found");
      console.log(`OTP for ${email}: ${otp}`);
      return { success: true, devMode: true };
    }

    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: email,
      subject: "Your Verification Code",
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
    });

    console.log("✅ Email sent:", response);

    return { success: true, data: response };

  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send OTP email");
  }
}


/**
 * Send verification success email
 */
export async function sendVerificationSuccess(email) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return { success: true, devMode: true };
    }

    await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: email,
      subject: "Email Verified Successfully",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #28a745;">✓ Verified!</h2>
          <p>Your email address has been successfully verified.</p>
          <p>You can now access all features of our platform.</p>
        </div>
      `
    });

    return { success: true };

  } catch (error) {
    console.error("Error sending success email:", error.message);
  }
}