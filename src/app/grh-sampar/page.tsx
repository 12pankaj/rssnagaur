'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import EnhancedLocationSelector from '@/components/EnhancedLocationSelector';

interface Location {
  id: number;
  name: string;
}

interface FormData {
  name: string;
  mobile: string;
  hobby: string;
  location: string;
  work: string;
  description: string;
}

export default function GrhSamparForm() {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTehsil, setSelectedTehsil] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  
  const [forms, setForms] = useState<FormData[]>([{ name: '', mobile: '', hobby: '', location: '', work: '', description: '' }]);
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
  }, [isAuthenticated, user, router]);

  const addForm = () => {
    setForms([...forms, { name: '', mobile: '', hobby: 'Join RSS', location: '', work: '', description: '' }]);
  };

  const updateForm = (index: number, field: keyof FormData, value: string) => {
    const updatedForms = [...forms];
    updatedForms[index][field] = value;
    setForms(updatedForms);
  };

  const removeForm = (index: number) => {
    if (forms.length > 1) {
      setForms(forms.filter((_, i) => i !== index));
    } else {
      toast.error('कम से कम एक प्रविष्टि आवश्यक है');
    }
  };

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

  const validateForm = () => {
    for (const form of forms) {
      if (!form.name.trim()) {
        toast.error('नाम आवश्यक है');
        return false;
      }
      if (!form.mobile.trim()) {
        toast.error('दूरभाष आवश्यक है');
        return false;
      }
      if (!/^\d{10}$/.test(form.mobile)) {
        toast.error('दूरभाष 10 अंकों का होना चाहिए');
        return false;
      }
      if (!form.location.trim()) {
        toast.error('स्थान आवश्यक है');
        return false;
      }
      if (!form.work.trim()) {
        toast.error('कार्य/व्यवसाय आवश्यक है');
        return false;
      }
      if (!form.hobby.trim()) {
        form.hobby='Join RSS';
        // toast.error('अभिरुचि आवश्यक है');
        // return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (forms.length === 0) {
      toast.error('Please add at least one form entry');
      return;
    }

    if (!validateForm()) {
      return;
    }
//console.log("ogdof");

 setIsSubmitting(true);

    try {
      const formData = forms.map(form => ({
        districtId: parseInt(selectedDistrict),
        tehsilId: parseInt(selectedTehsil),
        mandalId: parseInt(selectedMandal),
        name: form.name,
        mobile: form.mobile,
        hobby: form.hobby,
        location: form.location,
        work: form.work,
        description: form.description
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
          <EnhancedLocationSelector 
            onLocationChange={handleLocationChange}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800 mb-4">चरण 2: फॉर्म विवरण भरें</h2>
              
              <div className="mb-4">
                <button
                  onClick={addForm}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  नई प्रविष्टि जोड़ें
                </button>
              </div>

              {forms.map((form, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">प्रविष्टि {index + 1}</h3>
                    {forms.length > 1 && (
                      <button
                        onClick={() => removeForm(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        हटाएं
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">नाम *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => updateForm(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="नाम दर्ज करें"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">दूरभाष *</label>
                      <input
                        type="tel"
                        value={form.mobile}
                        onChange={(e) => updateForm(index, 'mobile', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="मोबाइल नंबर दर्ज करें"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">स्थान *</label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) => updateForm(index, 'location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="स्थान दर्ज करें"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">कार्य/व्यवसाय *</label>
                      <input
                        type="text"
                        value={form.work}
                        onChange={(e) => updateForm(index, 'work', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="कार्य/व्यवसाय दर्ज करें"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">अभिरुचि *</label>
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
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">विशेष विवरण </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => updateForm(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="विशेष विवरण दर्ज करें"
                        rows={3}
                        required
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
                  पीछे
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                   className=" flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
                  {isSubmitting ? 'सहेजा जा रहा है...' : 'सभी प्रविष्टियाँ सहेजें'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}