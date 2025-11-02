'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import GrhSamparReport from '@/components/reports/GrhSamparReport';
import VitritSavaymsevakReport from '@/components/reports/VitritSavaymsevakReport';
import MandalTeamsReport from '@/components/reports/MandalTeamsReport';
import CampaignTeamsReport from '@/components/reports/CampaignTeamsReport';

type ReportType = 'dashboard' | 'grh-sampar' | 'vitrit-savaymsevak' | 'mandal-teams' | 'campaign-teams';

export default function Reports() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeReport, setActiveReport] = useState<ReportType>('dashboard');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
      
    }

    if (user?.role === 'guest') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role === 'guest') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const reportCards = [
    {
      id: 'grh-sampar',
      title: 'गृह सम्पर्क अभियान रिपोर्ट',
      subtitle: '',
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      iconBgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      description: ''
    },
    {
      id: 'vitrit-savaymsevak',
      title: 'स्वयंसेवक विस्तृत सूची रिपोर्ट',
      subtitle: '',
      icon: (
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: 'bg-green-50',
      iconBgColor: 'bg-green-100',
      textColor: 'text-green-600',
      description: ''
    },
    {
      id: 'mandal-teams',
      title: 'गृह सम्पर्क मण्डल टोली रिपोर्ट',
      subtitle: '',
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: 'bg-purple-50',
      iconBgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      description: ''
    },
    {
      id: 'campaign-teams',
      title: 'गृह सम्पर्क अभियान टोली रिपोर्ट',
      subtitle: '',
      icon: (
        <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: 'bg-orange-50',
      iconBgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      description: ''
    }
  ];

  const renderReport = () => {
    switch (activeReport) {
      case 'grh-sampar':
        return <GrhSamparReport />;
      case 'vitrit-savaymsevak':
        return <VitritSavaymsevakReport />;
      case 'mandal-teams':
        return <MandalTeamsReport />;
      case 'campaign-teams':
        return <CampaignTeamsReport />;
      default:
        return (
        <div className="p-6 space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports Dashboard</h1>
                <p className="text-gray-600 text-lg">Select a report type to view detailed analytics and data.</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">RSS</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => setActiveReport(card.id as ReportType)}
                  className={`group ${card.bgColor} p-8 rounded-2xl cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-gray-200 hover:scale-105`}
                >
                  <div className="flex items-start space-x-6">
                    <div className={`${card.iconBgColor} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                      {card.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold ${card.textColor} mb-3`}>
                        {card.title}
                      </h3>
                      <p className="text-lg font-semibold text-gray-700 mb-3">
                        {card.subtitle}
                      </p>
                      <p className="text-gray-600 mb-6">
                        {card.description}
                      </p>
                      <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-white/80 text-gray-700 group-hover:bg-white group-hover:shadow-md transition-all duration-200">
                        Click to view report
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {activeReport !== 'dashboard' && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 mx-6 mt-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveReport('dashboard')}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Reports Dashboard
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {activeReport === 'grh-sampar' ? 'गृह सम्पर्क अभियान रिपोर्ट' : 
               activeReport === 'vitrit-savaymsevak' ? 'स्वयंसेवक विस्तृत सूची रिपोर्ट' :
               activeReport === 'mandal-teams' ? 'मण्डल टोली रिपोर्ट' :
               'गृह सम्पर्क अभियान टोली रिपोर्ट'}
            </h2>
          </div>
        </div>
      )}
      
      {renderReport()}
    </div>
  );
}