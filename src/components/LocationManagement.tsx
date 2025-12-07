'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface District {
  id: number;
  name: string;
}

interface Tehsil {
  id: number;
  name: string;
  district_id: number;
  district_name?: string;
}

interface Mandal {
  id: number;
  name: string;
  tehsil_id: number;
  tehsil_name?: string;
  district_name?: string;
}

export default function LocationManagement() {
  const [activeTab, setActiveTab] = useState<'districts' | 'tehsils' | 'mandals'>('districts');
  const [districts, setDistricts] = useState<District[]>([]);
  const [tehsils, setTehsils] = useState<Tehsil[]>([]);
  const [mandals, setMandals] = useState<Mandal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [districtForm, setDistrictForm] = useState({ name: '' });
  const [tehsilForm, setTehsilForm] = useState({ name: '', district_id: '' });
  const [mandalForm, setMandalForm] = useState({ name: '', tehsil_id: '' });

  // Get count for current tab
  const getCount = () => {
    switch (activeTab) {
      case 'districts': return districts.length;
      case 'tehsils': return tehsils.length;
      case 'mandals': return mandals.length;
      default: return 0;
    }
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showForm) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showForm]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Load districts when switching to tehsils or mandals tabs
  useEffect(() => {
    if ((activeTab === 'tehsils' || activeTab === 'mandals') && districts.length === 0) {
      loadDistricts();
    }
  }, [activeTab]);

  // Load tehsils when switching to mandals tab
  useEffect(() => {
    if (activeTab === 'mandals' && tehsils.length === 0) {
      loadTehsils();
    }
  }, [activeTab]);

  const loadDistricts = async () => {
    try {
      const response = await fetch('/api/locations/districts');
      const data = await response.json();
      setDistricts(data.districts || []);
    } catch (error) {
      console.error('Failed to load districts:', error);
    }
  };

  const loadTehsils = async () => {
    try {
      const response = await fetch('/api/locations/tehsils');
      const data = await response.json();
      setTehsils(data.tehsils || []);
    } catch (error) {
      console.error('Failed to load tehsils:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'districts') {
        const response = await fetch('/api/locations/districts');
        const data = await response.json();
        setDistricts(data.districts || []);
      } else if (activeTab === 'tehsils') {
        const response = await fetch('/api/locations/tehsils');
        const data = await response.json();
        setTehsils(data.tehsils || []);
      } else if (activeTab === 'mandals') {
        const response = await fetch('/api/locations/mandals');
        const data = await response.json();
        console.log(data);
        
        setMandals(data.mandals || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (activeTab === 'districts') {
        response = await fetch('/api/locations/districts', {
          method: editingItem ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem ? { id: editingItem.id, ...districtForm } : districtForm),
        });
      } else if (activeTab === 'tehsils') {
        response = await fetch('/api/locations/tehsils', {
          method: editingItem ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem ? { id: editingItem.id, ...tehsilForm } : tehsilForm),
        });
      } else if (activeTab === 'mandals') {
        response = await fetch('/api/locations/mandals', {
          method: editingItem ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem ? { id: editingItem.id, ...mandalForm } : mandalForm),
        });
      }

      const data = await response?.json();
      if (response?.ok) {
        toast.success(editingItem ? 'Updated successfully' : 'Created successfully');
        setShowForm(false);
        setEditingItem(null);
        resetForms();
        loadData();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    try {
      let response;
      if (activeTab === 'districts') {
        response = await fetch(`/api/locations/districts?id=${id}`, { method: 'DELETE' });
      } else if (activeTab === 'tehsils') {
        response = await fetch(`/api/locations/tehsils?id=${id}`, { method: 'DELETE' });
      } else if (activeTab === 'mandals') {
        response = await fetch(`/api/locations/mandals?id=${id}`, { method: 'DELETE' });
      }

      if (response?.ok) {
        toast.success('Deleted successfully');
        loadData();
      } else {
        const data = await response?.json();
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    if (activeTab === 'districts') {
      setDistrictForm({ name: item.name });
    } else if (activeTab === 'tehsils') {
      setTehsilForm({ name: item.name, district_id: item.district_id.toString() });
    } else if (activeTab === 'mandals') {
      setMandalForm({ name: item.name, tehsil_id: item.tehsil_id.toString() });
    }
    setShowForm(true);
  };

  const resetForms = () => {
    setDistrictForm({ name: '' });
    setTehsilForm({ name: '', district_id: '' });
    setMandalForm({ name: '', tehsil_id: '' });
  };

  const openAddForm = () => {
    setEditingItem(null);
    resetForms();
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    resetForms();
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Location Management</h2>
            <p className="text-gray-600 mt-1">
              Manage hierarchical locations: Districts, Tehsils, and Mandals
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}: {getCount()} items
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap gap-2 md:gap-8">
            {[
              { key: 'districts', label: 'Districts', count: districts.length },
              { key: 'tehsils', label: 'Tehsils', count: tehsils.length },
              { key: 'mandals', label: 'Mandals', count: mandals.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3 px-1 md:px-3 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={openAddForm}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add {activeTab.slice(0, -1)}
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadData}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading {activeTab}...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  {activeTab === 'tehsils' && (
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      District
                    </th>
                  )}
                  {activeTab === 'mandals' && (
                    <>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tehsil
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        District
                      </th>
                    </>
                  )}
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeTab === 'districts' && districts.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-gray-500">No districts found</p>
                        <button
                          onClick={openAddForm}
                          className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add your first district
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                {activeTab === 'districts' && districts.map((district) => (
                  <tr key={district.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {district.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(district)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(district.id)}
                          className="inline-flex items-center text-red-600 hover:text-red-900 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeTab === 'tehsils' && tehsils.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-gray-500">No tehsils found</p>
                        <button
                          onClick={openAddForm}
                          className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add your first tehsil
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                {activeTab === 'tehsils' && tehsils.map((tehsil) => (
                  <tr key={tehsil.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tehsil.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tehsil.district_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(tehsil)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tehsil.id)}
                          className="inline-flex items-center text-red-600 hover:text-red-900 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeTab === 'mandals' && mandals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-gray-500">No mandals found</p>
                        <button
                          onClick={openAddForm}
                          className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add your first mandal
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                {activeTab === 'mandals' && mandals.map((mandal) => (
                  <tr key={mandal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {mandal.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mandal.tehsil_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mandal.district_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(mandal)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(mandal.id)}
                          className="inline-flex items-center text-red-600 hover:text-red-900 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-hidden h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
                </h3>
                <button
                  onClick={closeForm}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={
                      activeTab === 'districts' ? districtForm.name :
                      activeTab === 'tehsils' ? tehsilForm.name :
                      mandalForm.name
                    }
                    onChange={(e) => {
                      if (activeTab === 'districts') {
                        setDistrictForm({ ...districtForm, name: e.target.value });
                      } else if (activeTab === 'tehsils') {
                        setTehsilForm({ ...tehsilForm, name: e.target.value });
                      } else if (activeTab === 'mandals') {
                        setMandalForm({ ...mandalForm, name: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={`Enter ${activeTab.slice(0, -1)} name`}
                    required
                  />
                </div>

                {activeTab === 'tehsils' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District
                    </label>
                    <select
                      value={tehsilForm.district_id}
                      onChange={(e) => setTehsilForm({ ...tehsilForm, district_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="">Select District</option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === 'mandals' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tehsil
                    </label>
                    <select
                      value={mandalForm.tehsil_id}
                      onChange={(e) => setMandalForm({ ...mandalForm, tehsil_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="">Select Tehsil</option>
                      {tehsils.map((tehsil) => (
                        <option key={tehsil.id} value={tehsil.id}>
                          {tehsil.name} ({tehsil.district_name})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-5 py-2 rounded-lg text-white transition-colors ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </div>
                    ) : (editingItem ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
