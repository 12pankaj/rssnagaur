import nodemailer from 'nodemailer';

// ✅ Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for port 465, false for others (587)
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail
      pass: process.env.EMAIL_PASS, // App password
    },
  });
};

// ✅ Send OTP email
export const sendOTPEmail = async (email: string, otp: string, mobile: string) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"RSS NAGAUR VIBHAG" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'OTP Verification - RSS NAGAUR VIBHAG',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #0D47A1, #895129); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #FFFFFF; margin: 0;">RSS NAGAUR VIBHAG</h1>
            <p style="color: #F1C338;">OTP Verification</p>
          </div>
          <div style="background: #FFFFFF; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Hello!</h2>
            <p>You requested verification for mobile number: <strong>${mobile}</strong></p>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 25px 0;">
              <p>Your OTP Code:</p>
              <div style="background: #0D47A1; color: #fff; font-size: 28px; padding: 10px 20px; border-radius: 8px;">
                ${otp}
              </div>
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it.</p>
            <p style="font-size: 12px; color: #888;">If you didn’t request this, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return { success: false, error };
  }
};

// ✅ Send Welcome Email
export const sendWelcomeEmail = async (email: string, name: string, mobile: string) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"RSS NAGAUR VIBHAG" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to RSS NAGAUR VIBHAG',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #0D47A1, #895129); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #FFFFFF;">Welcome, ${name}!</h1>
            <p style="color: #F1C338;">Account Created Successfully</p>
          </div>
          <div style="background: #FFFFFF; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Your account has been created with mobile number: <strong>${mobile}</strong></p>
            <p>You are registered as a <strong>Guest User</strong> and your status is <strong>Verified</strong>.</p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}"
                 style="background: #0D47A1; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px;">
                 Go to Dashboard
              </a>
            </div>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">
              If you have questions, contact our support team. This is an automated message.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error };
  }
};
