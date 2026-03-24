import nodemailer from "nodemailer";

/**
 * Create transporter (reusable)
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 15000, // prevent timeout
});

/**
 * Send OTP via Email
 */
export async function sendOtp(email, otp) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("⚠️ Email config missing");
      console.log(`OTP for ${email}: ${otp}`);
      return { success: true, devMode: true };
    }

    const info = await transporter.sendMail({
      from: `"OTP Service" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2>Email Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing:5px;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });

    console.log("✅ Email sent:", info.messageId);

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error("❌ Email error:", error);
    throw new Error("Failed to send OTP email");
  }
}

/**
 * Send verification success email
 */
export async function sendVerificationSuccess(email) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return { success: true, devMode: true };
    }

    await transporter.sendMail({
      from: `"OTP Service" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Email Verified Successfully",
      html: `
        <h2 style="color:green;">✔ Verified</h2>
        <p>Your email has been successfully verified.</p>
      `,
    });

    return { success: true };

  } catch (error) {
    console.error("Error sending success email:", error.message);
  }
}