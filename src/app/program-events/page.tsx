'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VitritSankalanUtsavPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 accent-bg mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Submenu items
  const submenuItems = [
    { id: 1, name: 'प्रारम्भिक वर्ग', href: '#' },
    { id: 2, name: 'प्राथमिक वर्ग ', href: '#' },
    { id: 3, name: 'प्रहार महायज्ञ', href: '#' },
    { id: 4, name: 'विस्तारक योजना ', href: '#' },
    { id: 5, name: 'पाथेय कण', href: '#' },
  ];

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">कार्यक्रम वृत्त संकलन</h1>
          <p className="text-gray-600">कृपया नीचे दिए गए उपलब्ध विकल्पों में से किसी एक का चयन करें</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submenuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group block bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.name}</h3>
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium group-hover:bg-blue-100 transition-colors">
                  Select Event
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}