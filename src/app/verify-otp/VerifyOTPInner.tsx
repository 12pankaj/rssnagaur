"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function VerifyOTPInner() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    console.log("emailParam->", emailParam);
    setEmail(emailParam || '');
    setEmailSent(true);
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'OTP verification failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FF8C42] to-[#FF6B35]">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Verify OTP
          </h2>
          <p className="mt-2 text-center text-sm text-white">
            {emailSent ? (
              <>Enter the 6-digit OTP sent to your email {email || mobile}</>
            ) : (
              <>Enter the 6-digit OTP sent to {mobile}</>
            )}
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e?.target?.value?.replace(/\D/g, ''))}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
             className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-md text-base font-semibold text-white bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] hover:from-[#FF7A3D] hover:to-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF7A3D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
           >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
