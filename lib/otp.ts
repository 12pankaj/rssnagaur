import pool from './db';
import { sendOTPEmail } from './email';

export async function generateOTP(mobile: string, email?: string): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const client = await pool.connect();
  try {
    // Delete old OTPs for this mobile
    await client.query('DELETE FROM otps WHERE email = $1', [mobile]);
    
    // Insert new OTP
    await client.query(
      'INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt]
    );
    
    // Send OTP via email if email is provided
    if (email) {
      try {
        await sendOTPEmail(email, otp, mobile);
        console.log(`OTP sent to email: ${email}`);
      } catch (error) {
        console.error('Failed to send OTP email:', error);
        // Don't throw error, just log it - OTP is still generated
      }
    } else {
      // Fallback to console log if no email provided
      console.log(`OTP for ${mobile}: ${otp}`);
    }
    
    return otp;
  } finally {
    client.release();
  }
}

export async function verifyOTP(mobile: string, otp: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    console.log("mobile, otp->",mobile, otp);
    
    const result = await client.query(
      'SELECT * FROM otps WHERE email = $1 AND otp = $2 AND expires_at > NOW()',
      [mobile, otp]
    );
    
    if (result.rows.length > 0) {
      // Delete used OTP
      await client.query('DELETE FROM otps WHERE email = $1 AND otp = $2', [mobile, otp]);
      return true;
    }
    
    return false;
  } finally {
    client.release();
  }
}

export async function markUserAsVerified(mobile: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE users SET is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE email = $1',
      [mobile]
    );
  } finally {
    client.release();
  }
}
