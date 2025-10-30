'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface FormData {
  id: number;
  name: string;
  mobile: string;
  hobby: string;
  location: string;
  district_name: string;
  tehsil_name: string;
  mandal_name: string;
  user_name: string;
  created_at: string;
}

export default function GrhSamparReport() {
  const { token } = useAuth();
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    districtId: '',
    tehsilId: '',
    mandalId: ''
  });
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [mandals, setMandals] = useState([]);

  useEffect(() => {
    fetchDistricts();
    fetchForms();
  }, []);

  useEffect(() => {
    if (filters.districtId) {
      fetchTehsils(filters.districtId);
    }
  }, [filters.districtId]);

  useEffect(() => {
    if (filters.tehsilId) {
      fetchMandals(filters.tehsilId);
    }
  }, [filters.tehsilId]);

  useEffect(() => {
    fetchForms();
  }, [filters]);

  const fetchDistricts = async () => {
    try {
      const response = await fetch('/api/locations/districts');
      if (response.ok) {
        const data = await response.json();
        setDistricts(data.districts);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchTehsils = async (districtId: string) => {
    try {
      const response = await fetch(`/api/locations/tehsils?districtId=${districtId}`);
      if (response.ok) {
        const data = await response.json();
        setTehsils(data.tehsils);
      }
    } catch (error) {
      console.error('Error fetching tehsils:', error);
    }
  };

  const fetchMandals = async (tehsilId: string) => {
    try {
      const response = await fetch(`/api/locations/mandals?tehsilId=${tehsilId}`);
      if (response.ok) {
        const data = await response.json();
        setMandals(data.mandals);
      }
    } catch (error) {
      console.error('Error fetching mandals:', error);
    }
  };

  const fetchForms = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.districtId) queryParams.append('districtId', filters.districtId);
      if (filters.tehsilId) queryParams.append('tehsilId', filters.tehsilId);
      if (filters.mandalId) queryParams.append('mandalId', filters.mandalId);

      const response = await fetch(`/api/forms/grh-sampar?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setForms(data.forms);
      } else {
        toast.error('Failed to fetch forms');
      }
    } catch (error) {
      toast.error('Error fetching forms');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Reset dependent filters
      if (key === 'districtId') {
        newFilters.tehsilId = '';
        newFilters.mandalId = '';
        setTehsils([]);
        setMandals([]);
      } else if (key === 'tehsilId') {
        newFilters.mandalId = '';
        setMandals([]);
      }
      
      return newFilters;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 accent-bg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">गृह सम्पर्क अभियान रिपोर्ट</h1>
            <p className="text-gray-600">Grh Sampar Form Data Report</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Total Forms</h3>
            <p className="text-3xl font-bold text-blue-600">{forms.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">This Month</h3>
            <p className="text-3xl font-bold text-green-600">
              {forms.filter(form => {
                const formDate = new Date(form.created_at);
                const now = new Date();
                return formDate.getMonth() === now.getMonth() && formDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800">Unique Users</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {new Set(forms.map(form => form.user_name)).size}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <select
                value={filters.districtId}
                onChange={(e) => handleFilterChange('districtId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
              >
                <option value="">All Districts</option>
                {districts.map((district: any) => (
                  <option key={district.id} value={district.id}>{district.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tehsil</label>
              <select
                value={filters.tehsilId}
                onChange={(e) => handleFilterChange('tehsilId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                disabled={!filters.districtId}
              >
                <option value="">All Tehsils</option>
                {tehsils.map((tehsil: any) => (
                  <option key={tehsil.id} value={tehsil.id}>{tehsil.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mandal</label>
              <select
                value={filters.mandalId}
                onChange={(e) => handleFilterChange('mandalId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                disabled={!filters.tehsilId}
              >
                <option value="">All Mandals</option>
                {mandals.map((mandal: any) => (
                  <option key={mandal.id} value={mandal.id}>{mandal.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Forms Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hobby
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {forms.map((form) => (
                <tr key={form.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {form.user_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {form.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form.mobile}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form.district_name}, {form.tehsil_name}, {form.mandal_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form.hobby || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(form.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {forms.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No forms found with the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
