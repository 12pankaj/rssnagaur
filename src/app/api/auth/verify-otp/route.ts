import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, markUserAsVerified,  } from '../../../../../lib/otp';
import { generateToken, getUserByEmail } from '../../../../../lib/auth';
import { log } from 'node:console';

export async function POST(request: NextRequest) {
  try {
  //   const data = await request.json();
  // console.log('data ->',data);
  
    const { mobile, otp } = await request.json();
console.log("mobile, otp ->",mobile, otp );

    if (!mobile || !otp) {
      return NextResponse.json(
        { error: 'Mobile/Email and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValidOTP = await verifyOTP(mobile, otp);
    if (!isValidOTP) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Mark user as verified
    await markUserAsVerified(mobile);
    
    // Get user details - try mobile first, then email
   //  user = await getUserByMobile(mobile);
    //if (!user) {
      let user = await getUserByEmail(mobile);
   // }
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate token
    const token = generateToken(user);

    return NextResponse.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
