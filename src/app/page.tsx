'use client';

import React, { useState,useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SignupForm from '@/components/SignupForm';
import LoginForm from '@/components/LoginForm';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
useEffect(() => {
    if (isAuthenticated) {router.push('/dashboard');
    
    }
  }, [isAuthenticated, router]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FF8C42] to-[#FF6B35]">

      {/* Auth Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 items-center">
          {/* Left side - Features */}

          {/* Right side - Auth Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              {isLogin ? <LoginForm /> : <SignupForm />}
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {isLogin ? (
                    <>
                     क्या आपके पास खाता नहीं है?{' '}
                      <span className="text-blue-600 hover:text-blue-500 font-semibold">
                        यहाँ साइन अप करें
                      </span>
                    </>
                  ) : (
                    <>
                    
                     क्या आपके पास पहले से एक खाता मौजूद है?{' '}
                      <span className="text-blue-600 hover:text-blue-500 font-semibold">
                        यहाँ लॉगिन करें
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-md border-t border-gray-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2026 Rashtriya Swayamsevak Sangh - Nagaur Vibhag. All rights reserved. Developed by Pankaj Dadhich.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}