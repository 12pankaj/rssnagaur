'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface MandalTeamData {
  id: number;
  mandal_leader: string;
  leader_phone: string;
  mandal_secretary: string;
  secretary_phone: string;
  member1: string;
  member1_phone: string;
  member2: string;
  member2_phone: string;
  member3: string;
  member3_phone: string;
  member4: string;
  member4_phone: string;
  member5: string;
  member5_phone: string;
  member6: string;
  member6_phone: string;
  member7: string;
  member7_phone: string;
  member8: string;
  member8_phone: string;
  member9: string;
  member9_phone: string;
  district_name: string;
  tehsil_name: string;
  mandal_name: string;
  user_name: string;
  created_at: string;
}

export default function MandalTeamsReport() {
  const { token } = useAuth();
  const [teams, setTeams] = useState<MandalTeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    districtId: '',
    tehsilId: '',
    mandalId: ''
  });
  const [districts, setDistricts] = useState<any[]>([]);
  const [tehsils, setTehsils] = useState<any[]>([]);
  const [mandals, setMandals] = useState<any[]>([]);

  useEffect(() => {
    fetchDistricts();
    fetchTeams();
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
    fetchTeams();
  }, [filters]);

  const fetchDistricts = async () => {
    try {
      const response = await fetch('/api/locations/districts');
      if (response.ok) {
        const data = await response.json();
        setDistricts(data.districts || []);
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
        setTehsils(data.tehsils || []);
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
        setMandals(data.mandals || []);
      }
    } catch (error) {
      console.error('Error fetching mandals:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.districtId) queryParams.append('districtId', filters.districtId);
      if (filters.tehsilId) queryParams.append('tehsilId', filters.tehsilId);
      if (filters.mandalId) queryParams.append('mandalId', filters.mandalId);

      const response = await fetch(`/api/forms/mandal-teams?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      } else {
        toast.error('Failed to fetch mandal teams');
      }
    } catch (error) {
      toast.error('Error fetching mandal teams');
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
          <div className="bg-purple-100 p-3 rounded-lg mr-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">मण्डल टीम रिपोर्ट</h1>
            <p className="text-gray-600">Mandal Team Data Report</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">Total Teams</h3>
            <p className="text-3xl font-bold text-purple-600">{teams.length}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">This Month</h3>
            <p className="text-3xl font-bold text-blue-600">
              {teams.filter(team => {
                const teamDate = new Date(team.created_at);
                const now = new Date();
                return teamDate.getMonth() === now.getMonth() && teamDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Unique Users</h3>
            <p className="text-3xl font-bold text-green-600">
              {new Set(teams.map(team => team.user_name)).size}
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
                {districts.map((district) => (
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
                {tehsils.map((tehsil) => (
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
                {mandals.map((mandal) => (
                  <option key={mandal.id} value={mandal.id}>{mandal.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Teams Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mandal Leader
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Secretary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teams.map((team) => (
                <tr key={team.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {team.user_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {team.district_name}, {team.tehsil_name}, {team.mandal_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{team.mandal_leader}</div>
                    <div className="text-gray-500">{team.leader_phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{team.mandal_secretary || 'N/A'}</div>
                    <div className="text-gray-500">{team.secretary_phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
                        const member = team[`member${i}` as keyof MandalTeamData];
                        const phone = team[`member${i}_phone` as keyof MandalTeamData];
                        return member ? (
                          <div key={i} className="flex justify-between">
                            <span>{member}</span>
                            <span className="text-gray-400 ml-2">{phone || ''}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(team.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {teams.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No mandal teams found with the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}