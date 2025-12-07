'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface VayapakGrhSamparkData {
  id: number;
  user_name: string;
  district_name: string;
  tehsil_name: string;
  mandal_name: string;
  total_villages: number;
  contacted_villages: number;
  distributed_forms: number;
  distributed_stickers: number;
  book_sales: number;
  contact_teams: number;
  contact_workers: number;
  male: number;
  female: number;
  yoga: number;
  special_contacts: number;
  swayamsevak_houses: number;
  supporter_houses: number;
  neutral_houses: number;
  total_houses: number;
  contacted_houses: number;
  created_at: string;
}

export default function VayapakGrhSamparkReport() {
  const { token } = useAuth();
  const [data, setData] = useState<VayapakGrhSamparkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/vayapak-grh-sampark', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result || []);
      } else {
        toast.error('Failed to fetch data');
      }
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item?.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.district_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.tehsil_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.mandal_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const exportToCSV = () => {
    const csvContent = [
      // Header row
      [
        'ID', 'User', 'District', 'Tehsil', 'Mandal', 
        'Total Villages', 'Contacted Villages', 'Distributed Forms', 'Distributed Stickers',
        'Book Sales', 'Contact Teams', 'Contact Workers', 'Male', 'Female', 'Yoga',
        'Special Contacts', 'Swayamsevak Houses', 'Supporter Houses', 'Neutral Houses',
        'Total Houses', 'Contacted Houses', 'Created At'
      ],
      // Data rows
      ...filteredData.map(item => [
        item.id, item.user_name, item.district_name, item.tehsil_name, item.mandal_name,
        item.total_villages, item.contacted_villages, item.distributed_forms, item.distributed_stickers,
        item.book_sales, item.contact_teams, item.contact_workers, item.male, item.female, item.yoga,
        item.special_contacts, item.swayamsevak_houses, item.supporter_houses, item.neutral_houses,
        item.total_houses, item.contacted_houses, new Date(item.created_at).toLocaleDateString()
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'vayapak-grh-sampark-report.csv');
    toast.success('CSV exported successfully');
  };

  const exportToExcel = () => {
    const worksheetData = filteredData.map(item => ({
      'ID': item.id,
      'User': item.user_name,
      'District': item.district_name,
      'Tehsil': item.tehsil_name,
      'Mandal': item.mandal_name,
      'Total Villages': item.total_villages,
      'Contacted Villages': item.contacted_villages,
      'Distributed Forms': item.distributed_forms,
      'Distributed Stickers': item.distributed_stickers,
      'Book Sales': item.book_sales,
      'Contact Teams': item.contact_teams,
      'Contact Workers': item.contact_workers,
      'Male': item.male,
      'Female': item.female,
      'Yoga': item.yoga,
      'Special Contacts': item.special_contacts,
      'Swayamsevak Houses': item.swayamsevak_houses,
      'Supporter Houses': item.supporter_houses,
      'Neutral Houses': item.neutral_houses,
      'Total Houses': item.total_houses,
      'Contacted Houses': item.contacted_houses,
      'Created At': new Date(item.created_at).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vayapak Grh Sampark Report');
    XLSX.writeFile(workbook, 'vayapak-grh-sampark-report.xlsx');
    toast.success('Excel exported successfully');
  };

  // const exportToPDF = () => {
  //   const doc = new jsPDF();
  //   
  //   // Add title
  //   doc.setFontSize(18);
  //   doc.text('व्यापक गृह संपर्क अभियान रिपोर्ट', 14, 20);
  //   doc.setFontSize(12);
  //   doc.text('Vayapak Grh Sampark Data Report', 14, 24);
  //   
  //   // Add generation date
  //   const date = new Date().toLocaleDateString('hi-IN');
  //   doc.setFontSize(10);
  //   doc.text(`रिपोर्ट जनरेशन दिनांक: ${date}`, 14, 30);
  //   
  //   // Prepare table data
  //   const tableColumn = [
  //     'ID', 'User', 'District', 'Tehsil', 'Mandal', 
  //     'Total Villages', 'Contacted Villages', 'Distributed Forms', 'Distributed Stickers',
  //     'Book Sales', 'Contact Teams', 'Contact Workers', 'Male', 'Female', 'Yoga',
  //     'Special Contacts', 'Swayamsevak Houses', 'Supporter Houses', 'Neutral Houses',
  //     'Total Houses', 'Contacted Houses', 'Created At'
  //   ];
  //   
  //   const tableRows = filteredData.map(item => [
  //     item.id, item.user_name, item.district_name, item.tehsil_name, item.mandal_name,
  //     item.total_villages, item.contacted_villages, item.distributed_forms, item.distributed_stickers,
  //     item.book_sales, item.contact_teams, item.contact_workers, item.male, item.female, item.yoga,
  //     item.special_contacts, item.swayamsevak_houses, item.supporter_houses, item.neutral_houses,
  //     item.total_houses, item.contacted_houses, new Date(item.created_at).toLocaleDateString('hi-IN')
  //   ]);
  //   
  //   // Add table
  //   autoTable(doc, {
  //     head: [tableColumn],
  //     body: tableRows,
  //     startY: 35,
  //     styles: {
  //       fontSize: 6,
  //       cellPadding: 1.5
  //     },
  //     headStyles: {
  //       fillColor: [72, 187, 120],
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
  //   doc.save('vayapak-grh-sampark-report.pdf');
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
          <div className="bg-green-100 p-3 rounded-lg mr-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">व्यापक गृह संपर्क अभियान रिपोर्ट</h1>
            <p className="text-gray-600">Vayapak Grh Sampark Data Report</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Total Entries</h3>
            <p className="text-3xl font-bold text-green-600">{data.length}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Total Villages</h3>
            <p className="text-3xl font-bold text-blue-600">
              {data.reduce((sum, item) => sum + (item.total_villages || 0), 0)}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800">Contacted Villages</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {data.reduce((sum, item) => sum + (item.contacted_villages || 0), 0)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">Total Houses</h3>
            <p className="text-3xl font-bold text-purple-600">
              {data.reduce((sum, item) => sum + (item.total_houses || 0), 0)}
            </p>
          </div>
        </div>

        {/* Export Buttons and Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Data</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                placeholder="Search by user, district, tehsil, mandal..."
              />
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

        {/* Data Table */}
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
                  Villages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Forms/Stickers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teams/Workers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Houses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.user_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-medium">{item.district_name}</div>
                      <div className="text-gray-400">{item.tehsil_name}, {item.mandal_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Total: {item.total_villages}</div>
                    <div>Contacted: {item.contacted_villages}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Forms: {item.distributed_forms}</div>
                    <div>Stickers: {item.distributed_stickers}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.book_sales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Teams: {item.contact_teams}</div>
                    <div>Workers: {item.contact_workers}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Male: {item.male}</div>
                    <div>Female: {item.female}</div>
                    <div>Yoga: {item.yoga}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Total: {item.total_houses}</div>
                    <div>Contacted: {item.contacted_houses}</div>
                    <div>
                      S: {item.swayamsevak_houses}, 
                      Su: {item.supporter_houses}, 
                      N: {item.neutral_houses}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No data found with the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}