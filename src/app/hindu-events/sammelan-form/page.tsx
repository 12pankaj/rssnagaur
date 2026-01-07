'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import EnhancedLocationSelector from '@/components/EnhancedLocationSelector';

interface FormData {
  date: string;
  committeeName: string;
  patron: string;
  president: string;
  secretary: string;
  treasurer: string;
  totalMale: string;
  totalFemale: string;
  totalWorker: string;
  specialDetails: string;
}

export default function HinduSammelanForm() {
  const { user,token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1); // 1 for location, 2 for form
  const [selectedLocation, setSelectedLocation] = useState({
    district_id: '',
    tehsil_id: '',
    mandal_id: ''
  });
  const [formData, setFormData] = useState<FormData>({
    date: '',
    committeeName: '',
    patron: '',
    president: '',
    secretary: '',
    treasurer: '',
    totalMale: '',
    totalFemale: '',
    totalWorker: '',
    specialDetails: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationChange = (districtId: string, tehsilId: string, mandalId: string) => {
    setSelectedLocation({
      district_id: districtId,
      tehsil_id: tehsilId,
      mandal_id: mandalId
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = (): boolean => {
    if (!selectedLocation.district_id) {
      toast.error('जिला आवश्यक है');
      return false;
    }
    if (!selectedLocation.tehsil_id) {
      toast.error('खण्ड/तहसील आवश्यक है');
      return false;
    }
    if (!selectedLocation.mandal_id) {
      toast.error('मंडल आवश्यक है');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.date.trim()) {
      toast.error('दिनांक आवश्यक है');
      return false;
    }
    if (!formData.committeeName.trim()) {
      toast.error('सम्मेलन समिति का नाम आवश्यक है');
      return false;
    }
    if (!formData.patron.trim()) {
      toast.error('संरक्षक का नाम आवश्यक है');
      return false;
    }
    if (!formData.president.trim()) {
      toast.error('अध्यक्ष का नाम आवश्यक है');
      return false;
    }
    if (!formData.secretary.trim()) {
      toast.error('सचिव का नाम आवश्यक है');
      return false;
    }
    if (!formData.treasurer.trim()) {
      toast.error('कोषाध्यक्ष का नाम आवश्यक है');
      return false;
    }
    if (!formData.totalMale.trim()) {
      toast.error('कुल पुरुष संख्या आवश्यक है');
      return false;
    }
    if (!formData.totalFemale.trim()) {
      toast.error('कुल महिला संख्या आवश्यक है');
      return false;
    }
    if (!formData.totalWorker.trim()) {
      toast.error('कुल कार्यकर्ता संख्या आवश्यक है');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        districtId: parseInt(selectedLocation.district_id),
        tehsilId: parseInt(selectedLocation.tehsil_id),
        mandalId: parseInt(selectedLocation.mandal_id),
        date: formData.date,
        committeeName: formData.committeeName,
        patron: formData.patron,
        president: formData.president,
        secretary: formData.secretary,
        treasurer: formData.treasurer,
        totalMale: parseInt(formData.totalMale),
        totalFemale: parseInt(formData.totalFemale),
        totalWorker: parseInt(formData.totalWorker),
        specialDetails: formData.specialDetails
      };

      const response = await fetch('/api/forms/hindu-sammelan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        toast.success('हिंदू सम्मेलन फॉर्म सफलतापूर्वक सबमिट किया गया!');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        toast.error(data.error || 'फॉर्म सबमिट करने में त्रुटि');
      }
    } catch (error) {
      toast.error('फॉर्म सबमिट करने में त्रुटि');
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-2xl md:text-3xl font-bold">हिंदू सम्मेलन फॉर्म</h1>
            <p className="text-blue-100 mt-2">सम्मेलन और समिति का विवरण भरें</p>
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
                  <div className="ml-2 font-medium">फॉर्म भरें</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
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

              {/* Step 2: Form Details */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Selected Location Display */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-green-800 mb-2">चयनित स्थान</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="font-medium">जिला:</span> 
                        <span className="ml-2">
                          {selectedLocation.district_id ? `ID: ${selectedLocation.district_id}` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">खंड:</span> 
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
                    </div>
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

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Date */}
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-lg font-semibold">दिनांक *</span>
                          <br />
                          <span className="text-sm text-gray-500">सम्मेलन की तारीख</span>
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      {/* Committee Name */}
                      <div>
                        <label htmlFor="committeeName" className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-lg font-semibold">सम्मेलन समिति का नाम *</span>
                          <br />
                          <span className="text-sm text-gray-500">सम्मेलन समिति का नाम लिखें</span>
                        </label>
                        <input
                          type="text"
                          id="committeeName"
                          name="committeeName"
                          value={formData.committeeName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="समिति का नाम"
                          required
                        />
                      </div>
                    </div>

                    {/* Committee Members */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Patron */}
                      <div>
                        <label htmlFor="patron" className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-lg font-semibold">संरक्षक *</span>
                          <br />
                          <span className="text-sm text-gray-500">सम्मेलन समिति के संरक्षक का नाम</span>
                        </label>
                        <input
                          type="text"
                          id="patron"
                          name="patron"
                          value={formData.patron}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="संरक्षक का नाम"
                          required
                        />
                      </div>

                      {/* President */}
                      <div>
                        <label htmlFor="president" className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-lg font-semibold">अध्यक्ष *</span>
                          <br />
                          <span className="text-sm text-gray-500">सम्मेलन समिति के अध्यक्ष का नाम</span>
                        </label>
                        <input
                          type="text"
                          id="president"
                          name="president"
                          value={formData.president}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="अध्यक्ष का नाम"
                          required
                        />
                      </div>

                      {/* Secretary */}
                      <div>
                        <label htmlFor="secretary" className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-lg font-semibold">सचिव *</span>
                          <br />
                          <span className="text-sm text-gray-500">सम्मेलन समिति के सचिव का नाम</span>
                        </label>
                        <input
                          type="text"
                          id="secretary"
                          name="secretary"
                          value={formData.secretary}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="सचिव का नाम"
                          required
                        />
                      </div>

                      {/* Treasurer */}
                      <div>
                        <label htmlFor="treasurer" className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-lg font-semibold">कोषाध्यक्ष *</span>
                          <br />
                          <span className="text-sm text-gray-500">सम्मेलन समिति के कोषाध्यक्ष का नाम</span>
                        </label>
                        <input
                          type="text"
                          id="treasurer"
                          name="treasurer"
                          value={formData.treasurer}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="कोषाध्यक्ष का नाम"
                          required
                        />
                      </div>
                    </div>

                    {/* Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Total Male */}
                      <div>
                        <label htmlFor="totalMale" className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-lg font-semibold">कुल पुरुष संख्या *</span>
                          <br />
                          <span className="text-sm text-gray-500">कुल पुरुष आवेदकों की संख्या</span>
                        </label>
                        <input
                          type="number"
                          id="totalMale"
                          name="totalMale"
                          value={formData.totalMale}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="पुरुष संख्या"
                          min="0"
                          required
                        />
                      </div>

                      {/* Total Female */}
                      <div>
                        <label htmlFor="totalFemale" className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-lg font-semibold">कुल महिला संख्या *</span>
                          <br />
                          <span className="text-sm text-gray-500">कुल महिला आवेदकों की संख्या</span>
                        </label>
                        <input
                          type="number"
                          id="totalFemale"
                          name="totalFemale"
                          value={formData.totalFemale}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="महिला संख्या"
                          min="0"
                          required
                        />
                      </div>

                      {/* Total Worker */}
                      <div>
                        <label htmlFor="totalWorker" className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-lg font-semibold">कुल कार्यकर्ता *</span>
                          <br />
                          <span className="text-sm text-gray-500">कुल कार्यकर्ताओं की संख्या</span>
                        </label>
                        <input
                          type="number"
                          id="totalWorker"
                          name="totalWorker"
                          value={formData.totalWorker}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="कार्यकर्ता संख्या"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    {/* Special Details */}
                    <div>
                      <label htmlFor="specialDetails" className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-lg font-semibold">अन्य जानकारी</span>
                        <br />
                        <span className="text-sm text-gray-500">विशेष विवरण: किसी भी अतिरिक्त टिप्पणी के लिए स्थान</span>
                      </label>
                      <textarea
                        id="specialDetails"
                        name="specialDetails"
                        value={formData.specialDetails}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="कोई अतिरिक्त जानकारी या टिप्पणी..."
                      ></textarea>
                    </div>
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
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'सबमिट हो रहा है...' : 'सबमिट करें'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}