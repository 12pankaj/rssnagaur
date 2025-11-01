'use client';

import React from 'react';
import VitritSavaymsevakReport from '@/components/reports/VitritSavaymsevakReport';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function VitritSavaymsevakReportPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <VitritSavaymsevakReport />
    </div>
  );
}