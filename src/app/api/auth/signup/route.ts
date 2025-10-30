import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '../../../../../lib/auth';
import { generateOTP } from '../../../../../lib/otp';

export async function POST(request: NextRequest) {
  try {
    const { name, mobile, password, email } = await request.json();

    if (!name || !mobile || !password || !email) {
      return NextResponse.json(
        { error: 'Name, mobile, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(mobile);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this mobile number' },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser(name, mobile, password, email);
    
    // Generate OTP and send via email
    const otp = await generateOTP(mobile, email);
    
    return NextResponse.json({
      message: 'User created successfully. Please check your email for OTP verification.',
      userId: user.id,
      emailSent: true
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
