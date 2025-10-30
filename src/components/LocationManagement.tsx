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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Location Management</h2>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'districts', label: 'Districts' },
              { key: 'tehsils', label: 'Tehsils' },
              { key: 'mandals', label: 'Mandals' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={openAddForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add {activeTab.slice(0, -1)}
        </button>
        <button
          onClick={loadData}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  {activeTab === 'tehsils' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      District
                    </th>
                  )}
                  {activeTab === 'mandals' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tehsil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        District
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeTab === 'districts' && districts.map((district) => (
                  <tr key={district.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {district.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(district)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(district.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {activeTab === 'tehsils' && tehsils.map((tehsil) => (
                  <tr key={tehsil.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tehsil.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tehsil.district_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(tehsil)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tehsil.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {activeTab === 'mandals' && mandals.map((mandal) => (
                  <tr key={mandal.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mandal.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mandal.tehsil_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mandal.district_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(mandal)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(mandal.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {activeTab === 'tehsils' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      District
                    </label>
                    <select
                      value={tehsilForm.district_id}
                      onChange={(e) => setTehsilForm({ ...tehsilForm, district_id: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700">
                      Tehsil
                    </label>
                    <select
                      value={mandalForm.tehsil_id}
                      onChange={(e) => setMandalForm({ ...mandalForm, tehsil_id: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
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
