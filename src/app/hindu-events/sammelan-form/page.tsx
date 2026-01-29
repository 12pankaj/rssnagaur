'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import EnhancedLocationSelector from '@/components/EnhancedLocationSelector';

interface FormData {
  // Location fields (handled by location selector)
  districtId: string;
  tehsilId: string;
  mandalId: string;
  
  // Mandal and Village counts
  totalMandals: string;
  totalContactedMandals: string;
  totalContactedVillages: string;
  
  // Basti counts
  totalBasti: string;
  totalContactedBasti: string;
  
  // Other information
  otherInfo: string;
  
  // Distribution counts
  totalDistributedForms: string;
  totalDistributedStickers: string;
  totalBookSales: string;
  
  // Team participation counts
  totalParticipatingTeams: string;
  totalParticipatingWorkers: string;
  maleWorkers: string;
  femaleWorkers: string;
  yogaWorkers: string;
  
  // Special contact counts
  specialPersonContacts: string;
  
  // House counts
  totalHouses: string;
  totalContactedHouses: string;
  
  // House status counts
  swayamsevakHouses: string;
  supporterHouses: string;
  neutralHouses: string;
}

export default function HinduSammelanForm() {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1); // 1 for location, 2 for form
  const [selectedLocation, setSelectedLocation] = useState({
    district_id: '',
    tehsil_id: '',
    mandal_id: ''
  });
  
  const [formData, setFormData] = useState<FormData>({
    districtId: '',
    tehsilId: '',
    mandalId: '',
    totalMandals: '',
    totalContactedMandals: '',
    totalContactedVillages: '',
    totalBasti: '',
    totalContactedBasti: '',
    otherInfo: '',
    totalDistributedForms: '',
    totalDistributedStickers: '',
    totalBookSales: '',
    totalParticipatingTeams: '',
    totalParticipatingWorkers: '',
    maleWorkers: '',
    femaleWorkers: '',
    yogaWorkers: '',
    specialPersonContacts: '',
    totalHouses: '',
    totalContactedHouses: '',
    swayamsevakHouses: '',
    supporterHouses: '',
    neutralHouses: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please login to access this form</p>
          <button 
            onClick={() => router.push('/')} 
            className="w-full bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white py-3 rounded-full hover:from-[#FF7A3D] hover:to-[#FF6B35] transition-all duration-200 font-semibold shadow-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Handle location change
  const handleLocationChange = (districtId: string, tehsilId: string, mandalId: string) => {
    setSelectedLocation({
      district_id: districtId,
      tehsil_id: tehsilId,
      mandal_id: mandalId
    });
    
    setFormData(prev => ({
      ...prev,
      districtId: districtId,
      tehsilId: tehsilId,
      mandalId: mandalId
    }));
  };

  // Handle next step
  const handleNext = () => {
    if (!selectedLocation.district_id || !selectedLocation.tehsil_id || !selectedLocation.mandal_id) {
      toast.error('कृपया स्थान का चयन करें');
      return;
    }
    setStep(2);
  };

  // Handle back to location selection
  const handleBack = () => {
    setStep(1);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.totalMandals || !formData.totalContactedMandals || !formData.totalContactedVillages) {
      toast.error('कृपया सभी आवश्यक फील्ड भरें');
      return false;
    }
    
    if (parseInt(formData.totalContactedMandals) > parseInt(formData.totalMandals)) {
      toast.error('संपर्कित मंडल की संख्या कुल मंडल से अधिक नहीं हो सकती');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/forms/hindu-sammelan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('फॉर्म सफलतापूर्वक सबमिट किया गया!');
        router.push('/hindu-events');
      } else {
        const data = await response.json();
        toast.error(data.error || 'फॉर्म सबमिट करने में विफल');
      }
    } catch (error) {
      toast.error('फॉर्म सबमिट करने में त्रुटि');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FF8C42] to-[#FF6B35] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden mt-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">हिन्दू सम्मेलन</h1>
                <p className="text-blue-100 mt-2">विस्तृत जानकारी भरें</p>
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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white' : 'bg-gray-200'}`}>
                    1
                  </div>
                  <div className="ml-2 font-medium">स्थान चुनें</div>
                </div>
                <div className="flex-1 h-1 mx-4 bg-gray-200"></div>
                <div className={`flex items-center ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <div className="ml-2 font-medium">विस्तृत जानकारी भरें</div>
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

            {/* Step 2: Form Details */}
            {step === 2 && (
              <div className="space-y-8">
                {/* Selected Location Display */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      स्थान बदलें
                    </button>
                  </div>
                </div>

                {/* Mandal and Village Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">खण्ड -</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        कुल मंडल *
                      </label>
                      <input
                        type="number"
                        name="totalMandals"
                        value={formData.totalMandals}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="कुल मंडल संख्या"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        कुल सम्पर्कित मंडल *
                      </label>
                      <input
                        type="number"
                        name="totalContactedMandals"
                        value={formData.totalContactedMandals}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="सम्पर्कित मंडल संख्या"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        कुल सम्पर्कित ग्राम *
                      </label>
                      <input
                        type="number"
                        name="totalContactedVillages"
                        value={formData.totalContactedVillages}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="सम्पर्कित ग्राम संख्या"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Basti Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">बस्ती जानकारी</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        कुल बस्ती
                      </label>
                      <input
                        type="number"
                        name="totalBasti"
                        value={formData.totalBasti}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="कुल बस्ती संख्या"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        कुल सम्पर्कित बस्ती
                      </label>
                      <input
                        type="number"
                        name="totalContactedBasti"
                        value={formData.totalContactedBasti}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="सम्पर्कित बस्ती संख्या"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Other Information */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">अन्य जानकारी</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      अन्य जानकारी
                    </label>
                    <textarea
                      name="otherInfo"
                      value={formData.otherInfo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="अतिरिक्त जानकारी दर्ज करें"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Distribution Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">वितरण जानकारी</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        कुल वितरित कर पत्रक संख्या
                      </label>
                      <input
                        type="number"
                        name="totalDistributedForms"
                        value={formData.totalDistributedForms}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="पत्रक संख्या"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        कुल वितरित स्टिकर संख्या
                      </label>
                      <input
                        type="number"
                        name="totalDistributedStickers"
                        value={formData.totalDistributedStickers}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="स्टिकर संख्या"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        कुल पुस्तक बिक्री संख्या
                      </label>
                      <input
                        type="number"
                        name="totalBookSales"
                        value={formData.totalBookSales}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="पुस्तक संख्या"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Team Participation Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">सहभागी टोली एवं कार्यकर्ता</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        कुल संपर्क हेतु सहभागी टोली संख्या
                      </label>
                      <input
                        type="number"
                        name="totalParticipatingTeams"
                        value={formData.totalParticipatingTeams}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="टोली संख्या"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        कुल संपर्क हेतु सहभागी कार्यकर्ता संख्या
                      </label>
                      <input
                        type="number"
                        name="totalParticipatingWorkers"
                        value={formData.totalParticipatingWorkers}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="कार्यकर्ता संख्या"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        पुरुष
                      </label>
                      <input
                        type="number"
                        name="maleWorkers"
                        value={formData.maleWorkers}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="पुरुष संख्या"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        मातृशक्ति
                      </label>
                      <input
                        type="number"
                        name="femaleWorkers"
                        value={formData.femaleWorkers}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="महिला संख्या"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        योग
                      </label>
                      <input
                        type="number"
                        name="yogaWorkers"
                        value={formData.yogaWorkers}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="योग संख्या"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Contacts Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">विशेष संपर्क जानकारी</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      विशेष व्यक्ति संवाद संपर्क संख्या
                    </label>
                    <input
                      type="number"
                      name="specialPersonContacts"
                      value={formData.specialPersonContacts}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="विशेष संपर्क संख्या"
                      min="0"
                    />
                  </div>
                </div>

                {/* House Status Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">घर स्थिति जानकारी</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        कुल घर
                      </label>
                      <input
                        type="number"
                        name="totalHouses"
                        value={formData.totalHouses}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="कुल घर संख्या"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        कुल सम्पर्कित घर
                      </label>
                      <input
                        type="number"
                        name="totalContactedHouses"
                        value={formData.totalContactedHouses}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="सम्पर्कित घर संख्या"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        स्वयंसेवक हैं घर संख्या
                      </label>
                      <input
                        type="number"
                        name="swayamsevakHouses"
                        value={formData.swayamsevakHouses}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="स्वयंसेवक घर"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        समर्थक हैं घर संख्या
                      </label>
                      <input
                        type="number"
                        name="supporterHouses"
                        value={formData.supporterHouses}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="समर्थक घर"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        तटस्थ हैं घर संख्या
                      </label>
                      <input
                        type="number"
                        name="neutralHouses"
                        value={formData.neutralHouses}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF7A3D] focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="तटस्थ घर"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                  >
                    पीछे
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-full hover:from-[#FF7A3D] hover:to-[#FF6B35] disabled:opacity-50 shadow-md font-semibold transition-all duration-200"
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