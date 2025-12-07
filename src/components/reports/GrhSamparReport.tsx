'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const exportToCSV = () => {
    const csvContent = [
      // Header row
      [
        'ID', 'User', 'Name', 'Mobile', 'Location', 'District', 'Tehsil', 'Mandal', 'Hobby', 'Created At'
      ],
      // Data rows
      ...forms.map(form => [
        form.id, form.user_name, form.name, form.mobile, form.location || 'N/A',
        form.district_name, form.tehsil_name, form.mandal_name, form.hobby || 'N/A',
        new Date(form.created_at).toLocaleDateString()
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'grh-sampar-report.csv');
    toast.success('CSV exported successfully');
  };

  const exportToExcel = () => {
    const worksheetData = forms.map(form => ({
      'ID': form.id,
      'User': form.user_name,
      'Name': form.name,
      'Mobile': form.mobile,
      'Location': form.location || 'N/A',
      'District': form.district_name,
      'Tehsil': form.tehsil_name,
      'Mandal': form.mandal_name,
      'Hobby': form.hobby || 'N/A',
      'Created At': new Date(form.created_at).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Grh Sampar Report');
    XLSX.writeFile(workbook, 'grh-sampar-report.xlsx');
    toast.success('Excel exported successfully');
  };

  // const exportToPDF = () => {
  //   const doc = new jsPDF();
  //   
  //   // Add title
  //   doc.setFontSize(18);
  //   doc.text('गृह सम्पर्क अभियान रिपोर्ट', 14, 20);
  //   doc.setFontSize(12);
  //   doc.text('Grh Sampar Form Data Report', 14, 24);
  //   
  //   // Add generation date
  //   const date = new Date().toLocaleDateString('hi-IN');
  //   doc.setFontSize(10);
  //   doc.text(`रिपोर्ट जनरेशन दिनांक: ${date}`, 14, 30);
  //   
  //   // Prepare table data
  //   const tableColumn = [
  //     'ID', 'User', 'Name', 'Mobile', 'Location', 'District', 'Tehsil', 'Mandal', 'Hobby', 'Created At'
  //   ];
  //   
  //   const tableRows = forms.map(form => [
  //     form.id, form.user_name, form.name, form.mobile, form.location || 'N/A',
  //     form.district_name, form.tehsil_name, form.mandal_name, form.hobby || 'N/A',
  //     new Date(form.created_at).toLocaleDateString('hi-IN')
  //   ]);
  //   
  //   // Add table
  //   autoTable(doc, {
  //     head: [tableColumn],
  //     body: tableRows,
  //     startY: 35,
  //     styles: {
  //       fontSize: 8,
  //       cellPadding: 2
  //     },
  //     headStyles: {
  //       fillColor: [66, 153, 225],
  //       textColor: [255, 255, 255]
  //     },
  //     didParseCell: function (data) {
  //       // Handle Hindi text rendering
  //       if (data.cell.raw && typeof data.cell.raw === 'string') {
  //         // Use default font which supports Hindi characters
  //         data.cell.styles.font = 'times';
  //       }
  //     }
  //   });
  //   
  //   // Save the PDF
  //   doc.save('grh-sampar-report.pdf');
  //   toast.success('PDF exported successfully');
  // };

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

        {/* Export Buttons and Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg flex-1">
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
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Data</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Export CSV
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Export Excel
              </button>
              {/* <button
                // onClick={exportToPDF}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Export PDF
              </button> */}
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
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tehsil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mandal
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
                    {form.location || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form.district_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form.tehsil_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form.mandal_name}
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