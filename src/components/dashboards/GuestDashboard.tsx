'use client';

import React from 'react';
import Link from 'next/link';

export default function GuestDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to RSS Nagaur Vibhag</h1>
            <p className="text-gray-600 text-lg">
              
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">RSS</span>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* गृह सम्पर्क अभियान Card */}
        <Link
          href="/grh-sampar"
          className="group block bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">गृह सम्पर्क अभियान</h3>
             <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium group-hover:bg-blue-100 transition-colors">
              Fill Form
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
        
        {/* Vitrit Savaymsevak Form Card */}
        <Link
          href="/vitrit-savaymsevak"
          className="group block bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">स्वयंसेवक विस्तृत सूची विवरण</h3>
             <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium group-hover:bg-green-100 transition-colors">
              Fill Form
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
        <Link
          href="/grh-sampar"
          className="group block bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">अभियान टोली</h3>
             <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium group-hover:bg-blue-100 transition-colors">
              Fill Form
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
        
        <Link
          href="/grh-sampar"
          className="group block bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">मंडल टोली</h3>
             <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium group-hover:bg-blue-100 transition-colors">
              Fill Form
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
        
      </div>

    </div>
  );
}
