'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface HinduSammelanData {
  id: number;
  total_mandals: number;
  total_contacted_mandals: number;
  total_contacted_villages: number;
  total_basti: number;
  total_contacted_basti: number;
  other_info: string;
  total_distributed_forms: number;
  total_distributed_stickers: number;
  total_book_sales: number;
  total_participating_teams: number;
  total_participating_workers: number;
  male_workers: number;
  female_workers: number;
  yoga_workers: number;
  special_person_contacts: number;
  total_houses: number;
  total_contacted_houses: number;
  swayamsevak_houses: number;
  supporter_houses: number;
  neutral_houses: number;
  district_name: string;
  tehsil_name: string;
  mandal_name: string;
  user_name: string;
  created_at: string;
}

export default function HinduSammelanReport() {
  const { token } = useAuth();
  const [events, setEvents] = useState<HinduSammelanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    districtId: '',
    tehsilId: '',
    mandalId: ''
  });
  const [districts, setDistricts] = useState<{id: number, name: string}[]>([]);
  const [tehsils, setTehsils] = useState<{id: number, name: string, district_id: number}[]>([]);
  const [mandals, setMandals] = useState<{id: number, name: string, tehsil_id: number}[]>([]);

  useEffect(() => {
    fetchDistricts();
    fetchEvents();
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
    fetchEvents();
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

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/forms/hindu-sammelan', window.location.origin);
      if (filters.districtId) url.searchParams.append('districtId', filters.districtId);
      if (filters.tehsilId) url.searchParams.append('tehsilId', filters.tehsilId);
      if (filters.mandalId) url.searchParams.append('mandalId', filters.mandalId);

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error fetching events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Error fetching events');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(events.map(event => ({
      'ID': event.id,
      'कुल मंडल': event.total_mandals,
      'कुल सम्पर्कित मंडल': event.total_contacted_mandals,
      'कुल सम्पर्कित ग्राम': event.total_contacted_villages,
      'कुल बस्ती': event.total_basti,
      'कुल सम्पर्कित बस्ती': event.total_contacted_basti,
      'अन्य जानकारी': event.other_info,
      'कुल वितरित कर पत्रक': event.total_distributed_forms,
      'कुल वितरित स्टिकर': event.total_distributed_stickers,
      'कुल पुस्तक बिक्री': event.total_book_sales,
      'कुल सहभागी टोली': event.total_participating_teams,
      'कुल सहभागी कार्यकर्ता': event.total_participating_workers,
      'पुरुष': event.male_workers,
      'मातृशक्ति': event.female_workers,
      'योग': event.yoga_workers,
      'विशेष व्यक्ति संपर्क': event.special_person_contacts,
      'कुल घर': event.total_houses,
      'कुल सम्पर्कित घर': event.total_contacted_houses,
      'स्वयंसेवक घर': event.swayamsevak_houses,
      'समर्थक घर': event.supporter_houses,
      'तटस्थ घर': event.neutral_houses,
      'जिला': event.district_name,
      'खंड': event.tehsil_name,
      'मंडल': event.mandal_name,
      'उपयोगकर्ता': event.user_name,
      'जमा तिथि': new Date(event.created_at).toLocaleDateString()
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'हिन्दू सम्मेलन रिपोर्ट');
    XLSX.writeFile(workbook, 'hindu_sammelan_report.xlsx');
  };

  const exportToPDF = () => {
    toast.error('PDF export temporarily unavailable');
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">हिन्दू सम्मेलन रिपोर्ट</h1>
        <p className="text-gray-600">सम्मेलन और समिति की विस्तृत रिपोर्ट</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">जिला</label>
          <select
            name="districtId"
            value={filters.districtId}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">सभी जिले</option>
            {districts.map(district => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">खंड</label>
          <select
            name="tehsilId"
            value={filters.tehsilId}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!filters.districtId}
          >
            <option value="">सभी खंड</option>
            {tehsils.map(tehsil => (
              <option key={tehsil.id} value={tehsil.id}>
                {tehsil.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">मंडल</label>
          <select
            name="mandalId"
            value={filters.mandalId}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!filters.tehsilId}
          >
            <option value="">सभी मंडल</option>
            {mandals.map(mandal => (
              <option key={mandal.id} value={mandal.id}>
                {mandal.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end space-x-2">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            disabled={loading || events.length === 0}
          >
            Excel में डाउनलोड
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-gray-400 text-white rounded-md disabled:opacity-50"
            disabled={true}
            title="PDF export temporarily unavailable"
          >
            PDF में डाउनलोड
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Results */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">कुल मंडल</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">सम्पर्कित मंडल</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">सम्पर्कित ग्राम</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">कुल बस्ती</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">सम्पर्कित बस्ती</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">वितरित पत्रक</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">वितरित स्टिकर</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">पुस्तक बिक्री</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">सहभागी टोली</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">कार्यकर्ता</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">पुरुष</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">महिला</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">योग</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">विशेष संपर्क</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">कुल घर</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">सम्पर्कित घर</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">जिला</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">खंड</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">मंडल</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">उपयोगकर्ता</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event, index) => (
                  <tr key={event.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.total_mandals}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.total_contacted_mandals}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.total_contacted_villages}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.total_basti}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.total_contacted_basti}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.total_distributed_forms}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.total_distributed_stickers}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.total_book_sales}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.total_participating_teams}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.total_participating_workers}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.male_workers}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.female_workers}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.yoga_workers}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.special_person_contacts}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.total_houses}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.total_contacted_houses}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.district_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.tehsil_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.mandal_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 border-b">{event.user_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={21} className="py-8 px-4 text-center text-gray-500">
                    कोई डेटा उपलब्ध नहीं है
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">सारांश</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">कुल प्रविष्टियाँ</p>
            <p className="text-xl font-bold text-blue-600">{events.length}</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">कुल सम्पर्कित मंडल</p>
            <p className="text-xl font-bold text-green-600">
              {events.reduce((sum, event) => sum + event.total_contacted_mandals, 0)}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">कुल सहभागी कार्यकर्ता</p>
            <p className="text-xl font-bold text-pink-600">
              {events.reduce((sum, event) => sum + event.total_participating_workers, 0)}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">कुल सम्पर्कित घर</p>
            <p className="text-xl font-bold text-purple-600">
              {events.reduce((sum, event) => sum + event.total_contacted_houses, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}