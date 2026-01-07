'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import EnhancedLocationSelector from '@/components/EnhancedLocationSelector';

interface FormData {
  responsibility: string;
  name: string;
  biradari: string;
  location: string;
  phone: string;
}

export default function HinduSammelanAyojanForm() {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get location parameters from URL
  const districtParam = searchParams.get('district');
  const tehsilParam = searchParams.get('tehsil');
  const mandalParam = searchParams.get('mandal');
  
  const [step, setStep] = useState(1); // 1 for location selection, 2 for multiple entries
  const [selectedLocation, setSelectedLocation] = useState({
    district_id: districtParam || '',
    tehsil_id: tehsilParam || '',
    mandal_id: mandalParam || ''
  });
  
  const [formEntries, setFormEntries] = useState<FormData[]>([
    {
      responsibility: 'सरक्षक मण्डल',
      name: '',
      biradari: '',
      location: '',
      phone: ''
    }
  ]);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const responsibilityOptions = [
    'सरक्षक मण्डल',
    'संयोजक',
    'सह संयोजक',
    'तह संयोजक',
    'सह संयोजक',
    'सह संयोजक',
    'कोषाध्यक्ष',
    'सह कोषाध्यक्ष',
    'सम्पर्क प्रमुख',
    'तह सम्पर्क प्रमुख',
    'प्रचार प्रमुख',
    'सह प्रचार प्रमुख',
    'सदस्य'
  ];

  const handleFormChange = (index: number, field: keyof FormData, value: string) => {
    const newEntries = [...formEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setFormEntries(newEntries);
  };

  const validateForm = (): boolean => {
    if (!selectedLocation.district_id || !selectedLocation.tehsil_id || !selectedLocation.mandal_id) {
      toast.error('कृपया स्थान का चयन करें');
      return false;
    }

    for (let i = 0; i < formEntries.length; i++) {
      const entry = formEntries[i];
      if (entry.name || entry.biradari || entry.location || entry.phone) {
        if (!entry.name || !entry.phone) {
          toast.error(`प्रवेश ${i + 1}: नाम और दूरभाष आवश्यक है`);
          return false;
        }
        if (entry.phone.length !== 10) {
          toast.error(`प्रवेश ${i + 1}: दूरभाष 10 अंकों का होना चाहिए`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (formEntries.length === 0) {
      toast.error('Please add at least one form entry');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const filteredEntries = formEntries.filter(entry => entry.name || entry.phone || entry.biradari || entry.location);
      
      if (filteredEntries.length === 0) {
        toast.error('कृपया कम से कम एक सदस्य की जानकारी भरें');
        setIsSubmitting(false);
        return;
      }

      const formData = filteredEntries.map(entry => ({
        districtId: parseInt(selectedLocation.district_id),
        tehsilId: parseInt(selectedLocation.tehsil_id),
        mandalId: parseInt(selectedLocation.mandal_id),
        responsibility: entry.responsibility,
        name: entry.name,
        biradari: entry.biradari,
        location: entry.location,
        phone: entry.phone
      }));

      const response = await fetch('/api/forms/hindu-sammelan-ayojan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ forms: formData })
      });

      if (response.ok) {
        toast.success('सदस्य जानकारी सफलतापूर्वक सबमिट की गई!');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        toast.error(data.error || 'सदस्य जानकारी सबमिट करने में विफल');
      }
    } catch (error) {
      toast.error('सदस्य जानकारी सबमिट करने में त्रुटि');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle location change
  const handleLocationChange = (districtId: string, tehsilId: string, mandalId: string) => {
    setSelectedLocation({
      district_id: districtId,
      tehsil_id: tehsilId,
      mandal_id: mandalId
    });
    
    // Apply selected location to all form entries
    const updatedEntries = formEntries.map(entry => ({
      ...entry,
      districtId: districtId,
      tehsilId: tehsilId,
      mandalId: mandalId
    }));
    
    setFormEntries(updatedEntries);
  };
  
  // Handle next step
  const handleNext = () => {
    if (!selectedLocation.district_id) {
      toast.error('जिला आवश्यक है');
      return;
    }
    if (!selectedLocation.tehsil_id) {
      toast.error('तहसील आवश्यक है');
      return;
    }
    if (!selectedLocation.mandal_id) {
      toast.error('मंडल आवश्यक है');
      return;
    }
    
    setStep(2);
  };
  
  // Handle back to location selection
  const handleBack = () => {
    setStep(1);
  };
  
  // Handle entry change
  const handleEntryChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedEntries = [...formEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [name]: value
    };
    setFormEntries(updatedEntries);
  };
  
  // Add new entry
  const addNewEntry = () => {
    // Add new entry with selected location
    setFormEntries([
      ...formEntries,
      {
        responsibility: 'सदस्य',
        name: '',
        biradari: '',
        location: '',
        phone: ''
      }
    ]);
  };
  
  // Remove entry
  const removeEntry = (index: number) => {
    if (formEntries.length > 1) {
      const updatedEntries = [...formEntries];
      updatedEntries.splice(index, 1);
      setFormEntries(updatedEntries);
    } else {
      toast.error('कम से कम एक प्रविष्टि आवश्यक है');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please login to access this form</p>
          <button 
            onClick={() => router.push('/')} 
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">हिन्दू सम्मेलन आयोजन समिति</h1>
                <p className="text-blue-100 mt-2">सदस्य जानकारी भरें</p>
              </div>
              {step === 2 && (
                <button 
                  onClick={handleBack}
                  className="text-white hover:text-blue-200 transition-colors"
                  title="Change Location"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex items-center">
                <div className={`flex items-center ${step === 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    1
                  </div>
                  <div className="ml-2 font-medium">स्थान चुनें</div>
                </div>
                <div className="flex-1 h-1 mx-4 bg-gray-200"></div>
                <div className={`flex items-center ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <div className="ml-2 font-medium">सदस्य जानकारी भरें</div>
                </div>
              </div>
            </div>

            {/* Step 1: Location Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">स्थान का चयन करें</h2>
                <EnhancedLocationSelector 
                  onLocationChange={handleLocationChange}
                  onNext={handleNext}
                />
              </div>
            )}

            {/* Step 2: Multiple Entries */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Selected Location Display */}
                <div className="bg-green-50 p-4 rounded-lg">
                  {/* <h2 className="text-lg font-semibold text-green-800 mb-2">चयनित स्थान</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="font-medium">जिला:</span> 
                      <span className="ml-2">
                        {selectedLocation.district_id ? `ID: ${selectedLocation.district_id}` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">तहसील:</span> 
                      <span className="ml-2">
                        {selectedLocation.tehsil_id ? `ID: ${selectedLocation.tehsil_id}` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">मंडल:</span> 
                      <span className="ml-2">
                        {selectedLocation.mandal_id ? `ID: ${selectedLocation.mandal_id}` : 'N/A'}
                      </span>
                    </div>
                  </div> */}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      स्थान बदलें
                    </button>
                  </div>
                </div>

                {/* Multiple Entries */}
                {formEntries.map((entry, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-800">सदस्य {index + 1}</h2>
                      {formEntries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEntry(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          हटाएं
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* दायित्व */}
                      <div>
                        <label htmlFor={`responsibility-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-lg font-semibold">दायित्व</span>
                          <br />
                          <span className="text-sm text-gray-500">सदस्य का दायित्व चुनें</span>
                        </label>
                        <select
                          id={`responsibility-${index}`}
                          name="responsibility"
                          value={entry.responsibility}
                          onChange={(e) => handleEntryChange(index, e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {responsibilityOptions.map((option, idx) => (
                            <option key={idx} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>

                      {/* नाम */}
                      <div>
                        <label htmlFor={`name-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-lg font-semibold">नाम *</span>
                          <br />
                          <span className="text-sm text-gray-500">सदस्य का नाम लिखें</span>
                        </label>
                        <input
                          type="text"
                          id={`name-${index}`}
                          name="name"
                          value={entry.name}
                          onChange={(e) => handleEntryChange(index, e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="नाम दर्ज करें"
                          required
                        />
                      </div>

                      {/* बिरादरी */}
                      <div>
                        <label htmlFor={`biradari-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-lg font-semibold">बिरादरी</span>
                          <br />
                          <span className="text-sm text-gray-500">सदस्य की बिरादरी लिखें</span>
                        </label>
                        <input
                          type="text"
                          id={`biradari-${index}`}
                          name="biradari"
                          value={entry.biradari}
                          onChange={(e) => handleEntryChange(index, e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="बिरादरी दर्ज करें"
                        />
                      </div>

                      {/* स्थान */}
                      <div>
                        <label htmlFor={`location-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-lg font-semibold">स्थान</span>
                          <br />
                          <span className="text-sm text-gray-500">सदस्य का स्थान लिखें</span>
                        </label>
                        <input
                          type="text"
                          id={`location-${index}`}
                          name="location"
                          value={entry.location}
                          onChange={(e) => handleEntryChange(index, e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="स्थान दर्ज करें"
                        />
                      </div>
                    </div>

                    {/* दूरभाष */}
                    <div className="mt-4">
                      <label htmlFor={`phone-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-lg font-semibold">दूरभाष *</span>
                        <br />
                        <span className="text-sm text-gray-500">सदस्य के दूरभाष क्रमांक लिखें (10 अंकों में)</span>
                      </label>
                      <input
                        type="tel"
                        id={`phone-${index}`}
                        name="phone"
                        value={entry.phone}
                        onChange={(e) => {
                          // Only allow numbers and limit to 10 digits
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          const updatedEntries = [...formEntries];
                          updatedEntries[index] = { ...updatedEntries[index], phone: value };
                          setFormEntries(updatedEntries);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10 अंकों का फोन नंबर"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                ))}

                {/* Add New Entry Button */}
                <div className="flex justify-center my-6">
                  <button
                    type="button"
                    onClick={addNewEntry}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    + नया सदस्य जोड़ें
                  </button>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    पीछे
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'सबमिट हो रहा है...' : 'सबमिट करें'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}