'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import EnhancedLocationSelector from '@/components/EnhancedLocationSelector';

interface VayapakGrhSamparkData {
  total_villages: string;
  contacted_villages: string;
  distributed_forms: string;
  distributed_stickers: string;
  book_sales: string;
  contact_teams: string;
  contact_workers: string;
  male: string;
  female: string;
  yoga: string;
  special_contacts: string;
  swayamsevak_houses: string;
  supporter_houses: string;
  neutral_houses: string;
  total_houses: string;
  contacted_houses: string;
}

export default function VayapakGrhSamparkForm() {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTehsil, setSelectedTehsil] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  
  const [formData, setFormData] = useState<VayapakGrhSamparkData>({
    total_villages: '',
    contacted_villages: '',
    distributed_forms: '',
    distributed_stickers: '',
    book_sales: '',
    contact_teams: '',
    contact_workers: '',
    male: '',
    female: '',
    yoga: '',
    special_contacts: '',
    swayamsevak_houses: '',
    supporter_houses: '',
    neutral_houses: '',
    total_houses: '',
    contacted_houses: ''
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationChange = (districtId: string, tehsilId: string, mandalId: string) => {
    setSelectedDistrict(districtId);
    setSelectedTehsil(tehsilId);
    setSelectedMandal(mandalId);
  };

  const handleNext = () => {
    if (!selectedDistrict || !selectedTehsil || !selectedMandal) {
      toast.error('Please select district, tehsil, and mandal');
      return;
    }
    setCurrentStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields: (keyof VayapakGrhSamparkData)[] = [
      'total_villages', 'contacted_villages', 'distributed_forms', 'distributed_stickers',
      'book_sales', 'contact_teams', 'contact_workers', 'male', 'female', 'yoga',
      'special_contacts', 'swayamsevak_houses', 'supporter_houses', 'neutral_houses',
      'total_houses', 'contacted_houses'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`${field?.replace(/_/g, ' ')} is required`);
        return;
      }
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/vayapak-grh-sampark', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          districtId: parseInt(selectedDistrict),
          tehsilId: parseInt(selectedTehsil),
          mandalId: parseInt(selectedMandal),
          ...formData
        })
      });

      if (response.ok) {
        toast.success('Vayapak Grh Sampark data submitted successfully!');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to submit vayapak grh sampark data');
      }
    } catch (error) {
      toast.error('Error submitting vayapak grh sampark data');
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">व्यापक गृह संपर्क अभियान</h1>
        
        {currentStep === 1 && (
          <EnhancedLocationSelector 
            onLocationChange={handleLocationChange}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800 mb-4">चरण 2: कार्यक्रम विवरण भरें</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">कुल ग्राम *</label>
                    <input
                      type="text"
                      name="total_villages"
                      value={formData.total_villages}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="कुल ग्राम संख्या दर्ज करें"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">सम्पर्कित ग्राम *</label>
                    <input
                      type="text"
                      name="contacted_villages"
                      value={formData.contacted_villages}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="सम्पर्कित ग्राम संख्या दर्ज करें"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">कुल वितरित कर पत्रक संख्या *</label>
                    <input
                      type="text"
                      name="distributed_forms"
                      value={formData.distributed_forms}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="वितरित पत्रक संख्या दर्ज करें"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">कुल वितरित स्टीकर संख्या *</label>
                    <input
                      type="text"
                      name="distributed_stickers"
                      value={formData.distributed_stickers}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="वितरित स्टीकर संख्या दर्ज करें"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">कुल पुस्तक बिक्री संख्या *</label>
                    <input
                      type="text"
                      name="book_sales"
                      value={formData.book_sales}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="पुस्तक बिक्री संख्या दर्ज करें"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">कुल संपर्क हेतु सहभागी टोली संख्या *</label>
                    <input
                      type="text"
                      name="contact_teams"
                      value={formData.contact_teams}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="सहभागी टोली संख्या दर्ज करें"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">कुल संपर्क हेतु सहभागी कार्यकर्ता संख्या *</label>
                    <input
                      type="text"
                      name="contact_workers"
                      value={formData.contact_workers}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="सहभागी कार्यकर्ता संख्या दर्ज करें"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">पुरुष *</label>
                    <input
                      type="text"
                      name="male"
                      value={formData.male}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="पुरुष संख्या दर्ज करें"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">मातृशक्ति *</label>
                    <input
                      type="text"
                      name="female"
                      value={formData.female}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="मातृशक्ति संख्या दर्ज करें"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">योग *</label>
                    <input
                      type="text"
                      name="yoga"
                      value={formData.yoga}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="योग संख्या दर्ज करें"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">विशेष व्यक्ति संवाद संपर्क संख्या *</label>
                    <input
                      type="text"
                      name="special_contacts"
                      value={formData.special_contacts}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="विशेष संपर्क संख्या दर्ज करें"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">स्वयंसेवक हैं घर संख्या *</label>
                    <input
                      type="text"
                      name="swayamsevak_houses"
                      value={formData.swayamsevak_houses}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="स्वयंसेवक घर संख्या दर्ज करें"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">समर्थक हैं घर संख्या *</label>
                    <input
                      type="text"
                      name="supporter_houses"
                      value={formData.supporter_houses}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="समर्थक घर संख्या दर्ज करें"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">तटस्थ हैं घर संख्या *</label>
                    <input
                      type="text"
                      name="neutral_houses"
                      value={formData.neutral_houses}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="तटस्थ घर संख्या दर्ज करें"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">कुल घर *</label>
                    <input
                      type="text"
                      name="total_houses"
                      value={formData.total_houses}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="कुल घर संख्या दर्ज करें"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">कुल सम्पर्कित घर *</label>
                    <input
                      type="text"
                      name="contacted_houses"
                      value={formData.contacted_houses}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="सम्पर्कित घर संख्या दर्ज करें"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    पीछे
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'सहेजा जा रहा है...' : 'सहेजें'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}