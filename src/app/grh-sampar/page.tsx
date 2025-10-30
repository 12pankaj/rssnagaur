'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Location {
  id: number;
  name: string;
}

interface FormData {
  name: string;
  mobile: string;
  hobby: string;
  location: string;
}

export default function GrhSamparForm() {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [districts, setDistricts] = useState<Location[]>([]);
  const [tehsils, setTehsils] = useState<Location[]>([]);
  const [mandals, setMandals] = useState<Location[]>([]);
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTehsil, setSelectedTehsil] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  
  const [forms, setForms] = useState<FormData[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

const responsibilityOptions = [
  
  'Join RSS',
  'पर्यावरण संरक्षण',
  'गौ सेवा',
  'ग्राम विकास',
  'धर्म जागरण',
  'गुमंतु कार्य',
  'सेवा विभाग',
  'संपर्क विभाग',
  'प्रचार विभाग',
  'विविध संगठन',
    'अन्य'
];
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'guest') {
      router.push('/');
      return;
    }
    fetchDistricts();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchTehsils(selectedDistrict);
      setSelectedTehsil('');
      setSelectedMandal('');
      setTehsils([]);
      setMandals([]);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedTehsil) {
      fetchMandals(selectedTehsil);
      setSelectedMandal('');
      setMandals([]);
    }
  }, [selectedTehsil]);

  const fetchDistricts = async () => {
    try {
      const response = await fetch('/api/locations/districts');
      if (response.ok) {
        const data = await response.json();
        setDistricts(data.districts);
      }
    } catch (error) {
      toast.error('Error fetching districts');
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
      toast.error('Error fetching tehsils');
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
      toast.error('Error fetching mandals');
    }
  };

  const addForm = () => {
    setForms([...forms, { name: '', mobile: '', hobby: '', location: '' }]);
  };

  const updateForm = (index: number, field: keyof FormData, value: string) => {
    const updatedForms = [...forms];
    updatedForms[index][field] = value;
    setForms(updatedForms);
  };

  const removeForm = (index: number) => {
    setForms(forms.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (!selectedDistrict || !selectedTehsil || !selectedMandal) {
      toast.error('Please select district, tehsil, and mandal');
      return;
    }
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    if (forms.length === 0) {
      toast.error('Please add at least one form entry');
      return;
    }

    const validForms = forms.filter(form => form.name && form.mobile);
    if (validForms.length === 0) {
      toast.error('Please fill in at least name and mobile for one entry');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = validForms.map(form => ({
        districtId: parseInt(selectedDistrict),
        tehsilId: parseInt(selectedTehsil),
        mandalId: parseInt(selectedMandal),
        name: form.name,
        mobile: form.mobile,
        hobby: form.hobby || 'join rss',
        location: form.location
      }));

      const response = await fetch('/api/forms/grh-sampar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ forms: formData })
      });

      if (response.ok) {
        toast.success('Forms submitted successfully!');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to submit forms');
      }
    } catch (error) {
      toast.error('Error submitting forms');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'guest') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">गृह सम्पर्क अभियान</h1>
        
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 mb-4">Step 1: Select Location</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tehsil</label>
                  <select
                    value={selectedTehsil}
                    onChange={(e) => setSelectedTehsil(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                    disabled={!selectedDistrict}
                  >
                    <option value="">Select Tehsil</option>
                    {tehsils.map((tehsil) => (
                      <option key={tehsil.id} value={tehsil.id}>{tehsil.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mandal</label>
                  <select
                    value={selectedMandal}
                    onChange={(e) => setSelectedMandal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                    disabled={!selectedTehsil}
                  >
                    <option value="">Select Mandal</option>
                    {mandals.map((mandal) => (
                      <option key={mandal.id} value={mandal.id}>{mandal.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800 mb-4">Step 2: Fill Form Details</h2>
              
              <div className="mb-4">
                <button
                  onClick={addForm}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add New Entry
                </button>
              </div>

              {forms.map((form, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Entry {index + 1}</h3>
                    <button
                      onClick={() => removeForm(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => updateForm(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="Enter name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mobile No. *</label>
                      <input
                        type="tel"
                        value={form.mobile}
                        onChange={(e) => updateForm(index, 'mobile', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="Enter mobile number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">अभिरुचि</label>
                     <select
              id="responsibility_hindi"
              name="responsibility_hindi"
              value={form.hobby}
              onChange={(e) => updateForm(index, 'hobby', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {responsibilityOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
                      {/* <input
                        type="text"
                        value={form.hobby}
                        onChange={(e) => updateForm(index, 'hobby', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="Enter hobby"
                      /> */}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">स्थान</label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) => updateForm(index, 'location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="Enter location"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                   className=" flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
                  {isSubmitting ? 'Saving...' : 'Save All Entries'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
