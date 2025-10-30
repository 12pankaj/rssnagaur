'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface VitritSavaymsevakData {
  name_hindi: string;
  location_hindi: string;
  phone: string;
  age: string;
  class_profession_hindi: string;
  responsibility_hindi: string;
}

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

export default function VitritSavaymsevakForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<VitritSavaymsevakData>({
    name_hindi: '',
    location_hindi: '',
    phone: '',
    age: '',
    class_profession_hindi: '',
    responsibility_hindi: 'कोई दायित्व नहीं है'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingData, setExistingData] = useState<VitritSavaymsevakData | null>(null);

  useEffect(() => {
    if (user) {
      fetchExistingData();
    }
  }, [user]);

  const fetchExistingData = async () => {
    try {
      const response = await fetch(`/api/vitrit-savaymsevak?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setExistingData(data.data);
          setFormData(data.data);
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name_hindi.trim()) {
      toast.error('नाम आवश्यक है');
      return false;
    }
    if (!formData.location_hindi.trim()) {
      toast.error('स्थान आवश्यक है');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('दूरभाष क्रमांक आवश्यक है');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error('दूरभाष क्रमांक 10 अंकों का होना चाहिए');
      return false;
    }
    if (!formData.age.trim()) {
      toast.error('आयु आवश्यक है');
      return false;
    }
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 1 || age > 100) {
      toast.error('कृपया वैध आयु दर्ज करें');
      return false;
    }
    if (!formData.class_profession_hindi.trim()) {
      toast.error('कक्षा/व्यवसाय आवश्यक है');
      return false;
    }
    if (!formData.responsibility_hindi.trim()) {
      toast.error('दायित्व आवश्यक है');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/vitrit-savaymsevak', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          userId: user?.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(isEditing ? 'डेटा सफलतापूर्वक अपडेट किया गया' : 'डेटा सफलतापूर्वक सहेजा गया');
        setExistingData(formData);
        setIsEditing(true);
      } else {
        toast.error(data.error || 'एक त्रुटि हुई');
      }
    } catch (error) {
      toast.error('एक त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (existingData) {
      setFormData(existingData);
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">स्वयंसेवक विस्तृत सूची विवरण</h1>
          <p className="text-gray-600">अपना स्वयंसेवक विवरण भरें और सहेजें</p>
        </div>

        {existingData && !isEditing && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex justify-between items-center">
              <p className="text-blue-700">आपका डेटा पहले से सहेजा गया है।</p>
              <button
                onClick={handleEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                संपादित करें
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* नाम */}
            <div>
              <label htmlFor="name_hindi" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-lg font-semibold">1. नाम</span>
                <br />
                <span className="text-sm text-gray-500">स्वयंसेवक का नाम लिखें (हिन्दी में)</span>
              </label>
              <input
                type="text"
                id="name_hindi"
                name="name_hindi"
                value={formData.name_hindi}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="अपना नाम हिन्दी में लिखें"
                required
              />
            </div>

            {/* स्थान */}
            <div>
              <label htmlFor="location_hindi" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-lg font-semibold">2. स्थान</span>
                <br />
                <span className="text-sm text-gray-500">स्वयंसेवक का स्थान लिखें (हिन्दी में)</span>
              </label>
              <input
                type="text"
                id="location_hindi"
                name="location_hindi"
                value={formData.location_hindi}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="अपना स्थान हिन्दी में लिखें"
                required
              />
            </div>

            {/* दूरभाष */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-lg font-semibold">3. दूरभाष</span>
                <br />
                <span className="text-sm text-gray-500">स्वयंसेवक के दूरभाष क्रमांक लिखें (अंग्रेजी अंकों में)</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10 अंकों का मोबाइल नंबर"
                maxLength={10}
                required
              />
            </div>

            {/* आयु */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-lg font-semibold">4. स्वयंसेवक आयु</span>
                <br />
                <span className="text-sm text-gray-500">स्वयंसेवक की संघ आयु लिखें (अंग्रेजी अंकों में)</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="आयु"
                min="1"
                max="100"
                required
              />
            </div>
          </div>

          {/* कक्षा/व्यवसाय */}
          <div>
            <label htmlFor="class_profession_hindi" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-lg font-semibold">5. स्वयंसेवक कक्षा/व्यवसाय</span>
              <br />
              <span className="text-sm text-gray-500">स्वयंसेवक क्या कार्य करते है संक्षिप्त में लिखें (हिन्दी में)</span>
            </label>
            <textarea
              id="class_profession_hindi"
              name="class_profession_hindi"
              value={formData.class_profession_hindi}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="अपना कक्षा या व्यवसाय हिन्दी में लिखें"
              required
            />
          </div>

          {/* दायित्व */}
          <div>
            <label htmlFor="responsibility_hindi" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-lg font-semibold">6. स्वयंसेवक दायित्व</span>
              <br />
              <span className="text-sm text-gray-500">स्वयंसेवक का दायित्व नीचे लिखे (हिन्दी में) अगर कोई दायित्व नहीं है तो पहले विकल्प को चुनें</span>
            </label>
            <select
              id="responsibility_hindi"
              name="responsibility_hindi"
              value={formData.responsibility_hindi}
              onChange={handleChange}
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

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            {isEditing && existingData && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                रद्द करें
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'सहेजा जा रहा है...' : (isEditing ? 'अपडेट करें' : 'सहेजें')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
