import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword } from '../../../../../lib/auth';
import { generateOTP } from '../../../../../lib/otp';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password
  console.log("password->",password);
  console.log("password->",user.password);
  
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 400 }
      );
    }

    // Generate OTP for login and send via email
    const otp = await generateOTP(user.mobile, user.email);
    
    return NextResponse.json({
      message: 'Please check your email for OTP to login',
      email: user.email,
      emailSent: true
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
