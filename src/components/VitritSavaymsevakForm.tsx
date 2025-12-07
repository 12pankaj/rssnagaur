'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CommonLocationSelector from '@/components/CommonLocationSelector';
import EnhancedLocationSelector from './EnhancedLocationSelector';

interface VitritSavaymsevakData {
  id?: number;
  name_hindi: string;
  location_hindi: string;
  phone: string;
  age: string;
  class_profession_hindi: string;
  responsibility_hindi: string;
  // New fields
  district_id: string;
  tehsil_id: string;
  mandal_id: string;
  responsibility_details_hindi: string;
  sangh_shikshan_hindi: string;
  ganvesh_information: string;
}

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

const responsibilityOptions = [
  'दायित्व का चयन करें',
  'संघ में दायित्व',
  'विविध संगठन में दायित्व',
  'कोई दायित्व नहीं'
];

const initialFormData: VitritSavaymsevakData = {
  name_hindi: '',
  location_hindi: '',
  phone: '',
  age: '',
  class_profession_hindi: '',
  responsibility_hindi: 'दायित्व का चयन करें',
  // Initialize new fields
  district_id: '',
  tehsil_id: '',
  mandal_id: '',
  responsibility_details_hindi: '',
  sangh_shikshan_hindi: '',
  ganvesh_information: ''
};

export default function VitritSavaymsevakForm() {
  const { user } = useAuth();
   const router = useRouter();
  const [step, setStep] = useState(1); // 1 for location selection, 2 for multiple entries
  const [selectedLocation, setSelectedLocation] = useState({
    district_id: '',
    tehsil_id: '',
    mandal_id: ''
  });
  const [formEntries, setFormEntries] = useState<VitritSavaymsevakData[]>([initialFormData]);
  const [existingEntries, setExistingEntries] = useState<VitritSavaymsevakData[]>([]);
  
  // Location data states
  const [districts, setDistricts] = useState<District[]>([]);
  const [tehsils, setTehsils] = useState<Tehsil[]>([]);
  const [mandals, setMandals] = useState<Mandal[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
    //  fetchExistingData();
      loadLocationData();
    }
  }, [user]);

  const loadLocationData = async () => {
    try {
      // Load districts
      const districtResponse = await fetch('/api/locations/districts');
      if (districtResponse.ok) {
        const districtData = await districtResponse.json();
        setDistricts(districtData.districts || []);
      }
      
      // Load tehsils
      const tehsilResponse = await fetch('/api/locations/tehsils');
      if (tehsilResponse.ok) {
        const tehsilData = await tehsilResponse.json();
        setTehsils(tehsilData.tehsils || []);
      }
      
      // Load mandals
      const mandalResponse = await fetch('/api/locations/mandals');
      if (mandalResponse.ok) {
        const mandalData = await mandalResponse.json();
        setMandals(mandalData.mandals || []);
      }
    } catch (error) {
      console.error('Error loading location data:', error);
    }
  };
  
  const fetchExistingData = async () => {
    try {
      const response = await fetch(`/api/vitrit-savaymsevak?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const formattedData = data.map((item: any) => ({
            ...item,
            district_id: item.district_id?.toString() || '',
            tehsil_id: item.tehsil_id?.toString() || '',
            mandal_id: item.mandal_id?.toString() || '',
            age: item.age?.toString() || ''
          }));
          setExistingEntries(formattedData);
          // Set the location from the first entry
          if (formattedData.length > 0) {
            setSelectedLocation({
              district_id: formattedData[0].district_id,
              tehsil_id: formattedData[0].tehsil_id,
              mandal_id: formattedData[0].mandal_id
            });
            setFormEntries(formattedData);
            setIsEditing(true);
            setStep(2); // Go directly to step 2 if existing data
          }
        }
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
    }
  };

  const handleLocationChange = (districtId: string, tehsilId: string, mandalId: string) => {
    setSelectedLocation({
      district_id: districtId,
      tehsil_id: tehsilId,
      mandal_id: mandalId
    });
    
    // Apply selected location to all form entries
    const updatedEntries = formEntries.map(entry => ({
      ...entry,
      district_id: districtId,
      tehsil_id: tehsilId,
      mandal_id: mandalId
    }));
    
    setFormEntries(updatedEntries);
  };

  const handleNext = () => {
    if (!selectedLocation.district_id) {
      toast.error('जिला आवश्यक है');
      return;
    }
    if (!selectedLocation.tehsil_id) {
      toast.error('खण्ड/नगर आवश्यक है');
      return;
    }
    if (!selectedLocation.mandal_id) {
      toast.error('मण्डल/बस्ती आवश्यक है');
      return;
    }
    
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleEntryChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedEntries = [...formEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [name]: value
    };
    setFormEntries(updatedEntries);
  };

  const addNewEntry = () => {
    // Add new entry with selected location
    setFormEntries([
      ...formEntries,
      {
        ...initialFormData,
        district_id: selectedLocation.district_id,
        tehsil_id: selectedLocation.tehsil_id,
        mandal_id: selectedLocation.mandal_id
      }
    ]);
  };

  const removeEntry = (index: number) => {
    if (formEntries.length > 1) {
      const updatedEntries = [...formEntries];
      updatedEntries.splice(index, 1);
      setFormEntries(updatedEntries);
    } else {
      toast.error('कम से कम एक प्रविष्टि आवश्यक है');
    }
  };

  const validateEntry = (entry: VitritSavaymsevakData): boolean => {
    if (!entry.name_hindi.trim()) {
      toast.error('नाम आवश्यक है');
      return false;
    }
    if (!entry.location_hindi.trim()) {
      toast.error('स्थान आवश्यक है');
      return false;
    }
    if (!entry.phone.trim()) {
      toast.error('दूरभाष क्रमांक आवश्यक है');
      return false;
    }
    if (!/^\d{10}$/.test(entry.phone)) {
      toast.error('दूरभाष क्रमांक 10 अंकों का होना चाहिए');
      return false;
    }
    if (!entry.age.trim()) {
      toast.error('आयु आवश्यक है');
      return false;
    }
    const age = parseInt(entry.age);
    if (isNaN(age) || age < 1 || age > 100) {
      toast.error('कृपया वैध आयु दर्ज करें');
      return false;
    }
    if (!entry.class_profession_hindi.trim()) {
      toast.error('कक्षा/व्यवसाय आवश्यक है');
      return false;
    }
    if (!entry.responsibility_hindi.trim()) {
      toast.error('दायित्व आवश्यक है');
      return false;
    }
    // Check if responsibility details are required
    if ((entry.responsibility_hindi === 'संग में दायित्व' || entry.responsibility_hindi === 'विविध संगठन में दायित्व') && !entry.responsibility_details_hindi.trim()) {
      toast.error('दायित्व है तो यहां लिखें आवश्यक है');
      return false;
    }
    return true;
  };

  const validateForm = (): boolean => {
    for (const entry of formEntries) {
      if (!validateEntry(entry)) {
        return false;
      }
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
      // Prepare data for submission
      const submissionData = formEntries.map(entry => ({
        ...entry,
        age: parseInt(entry.age),
        district_id: parseInt(entry.district_id),
        tehsil_id: parseInt(entry.tehsil_id),
        mandal_id: parseInt(entry.mandal_id),
        userId: user?.id
      }));

      const response = await fetch('/api/vitrit-savaymsevak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries: submissionData }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('डेटा सफलतापूर्वक सहेजा गया');
    router.push('/dashboard');
        // setExistingEntries(formEntries);
        // setIsEditing(true);
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
    setStep(2);
  };

  const handleCancel = () => {
    if (existingEntries.length > 0) {
      setFormEntries(existingEntries);
      setIsEditing(false);
      setStep(1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">स्वयंसेवक विस्तृत सूची विवरण</h1>
          <p className="text-gray-600">अपना स्वयंसेवक विवरण भरें और सहेजें</p>
        </div>

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
              <div className="ml-2 font-medium">विवरण भरें</div>
            </div>
          </div>
        </div>

        {/* {existingEntries.length > 0 && step === 1 && !isEditing && (
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
        )} */}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Location Selection */}
          {step === 1 && (
          <EnhancedLocationSelector 
            onLocationChange={handleLocationChange}
            onNext={handleNext}
          />
        )}
          {/* {step === 1 && (
            
          )} */}

          {/* Step 2: Multiple Entries */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Selected Location Display */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-green-800 mb-2">चयनित स्थान</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium">जिला:</span> 
                    <span className="ml-2">
                      {districts.find(d => d.id === parseInt(selectedLocation.district_id))?.name || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">खण्ड/नगर:</span> 
                    <span className="ml-2">
                      {tehsils.find(t => t.id === parseInt(selectedLocation.tehsil_id))?.name || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">मण्डल/बस्ती:</span> 
                    <span className="ml-2">
                      {mandals.find(m => m.id === parseInt(selectedLocation.mandal_id))?.name || 'N/A'}
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

              {/* Multiple Entries */}
              {formEntries.map((entry, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">प्रविष्टि {index + 1}</h2>
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
                    {/* नाम */}
                    <div>
                      <label htmlFor={`name_hindi-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-lg font-semibold">1. नाम</span>
                        <br />
                        <span className="text-sm text-gray-500">स्वयंसेवक का नाम लिखें (हिन्दी में)</span>
                      </label>
                      <input
                        type="text"
                        id={`name_hindi-${index}`}
                        name="name_hindi"
                        value={entry.name_hindi}
                        onChange={(e) => handleEntryChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="अपना नाम हिन्दी में लिखें"
                        required
                      />
                    </div>

                    {/* स्थान */}
                    <div>
                      <label htmlFor={`location_hindi-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-lg font-semibold">2. स्थान</span>
                        <br />
                        <span className="text-sm text-gray-500">स्वयंसेवक का स्थान लिखें (हिन्दी में)</span>
                      </label>
                      <input
                        type="text"
                        id={`location_hindi-${index}`}
                        name="location_hindi"
                        value={entry.location_hindi}
                        onChange={(e) => handleEntryChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="अपना स्थान हिन्दी में लिखें"
                        required
                      />
                    </div>

                    {/* दूरभाष */}
                    <div>
                      <label htmlFor={`phone-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-lg font-semibold">3. दूरभाष</span>
                        <br />
                        <span className="text-sm text-gray-500">स्वयंसेवक के दूरभाष क्रमांक लिखें (अंग्रेजी अंकों में)</span>
                      </label>
                      <input
                        type="tel"
                        id={`phone-${index}`}
                        name="phone"
                        value={entry.phone}
                        onChange={(e) => handleEntryChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10 अंकों का मोबाइल नंबर"
                        maxLength={10}
                        required
                      />
                    </div>

                    {/* आयु */}
                    <div>
                      <label htmlFor={`age-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-lg font-semibold">4. स्वयंसेवक आयु</span>
                        <br />
                        <span className="text-sm text-gray-500">स्वयंसेवक की संघ आयु लिखें (अंग्रेजी अंकों में)</span>
                      </label>
                      <input
                        type="number"
                        id={`age-${index}`}
                        name="age"
                        value={entry.age}
                        onChange={(e) => handleEntryChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="आयु"
                        min="1"
                        max="100"
                        required
                      />
                    </div>
                  </div>

                  {/* कक्षा/व्यवसाय */}
                  <div className="mt-4">
                    <label htmlFor={`class_profession_hindi-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="text-lg font-semibold">5. स्वयंसेवक कक्षा/व्यवसाय</span>
                      <br />
                      <span className="text-sm text-gray-500">स्वयंसेवक क्या कार्य करते है संक्षिप्त में लिखें (हिन्दी में)</span>
                    </label>
                    <textarea
                      id={`class_profession_hindi-${index}`}
                      name="class_profession_hindi"
                      value={entry.class_profession_hindi}
                      onChange={(e) => handleEntryChange(index, e)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="अपना कक्षा या व्यवसाय हिन्दी में लिखें"
                      required
                    />
                  </div>

                  {/* दायित्व */}
                  <div className="mt-4">
                    <label htmlFor={`responsibility_hindi-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="text-lg font-semibold">6. स्वयंसेवक दायित्व</span>
                      <br />
                      <span className="text-sm text-gray-500">स्वयंसेवक का दायित्व नीचे लिखे (हिन्दी में) अगर कोई दायित्व नहीं है तो पहले विकल्प को चुनें</span>
                    </label>
                    <select
                      id={`responsibility_hindi-${index}`}
                      name="responsibility_hindi"
                      value={entry.responsibility_hindi}
                      onChange={(e) => handleEntryChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {responsibilityOptions.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* दायित्व है तो यहां लिखें */}
                  <div className="mt-4">
                    <label htmlFor={`responsibility_details_hindi-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="text-lg font-semibold">7. दायित्व है तो यहां लिखें</span>
                      <br />
                      <span className="text-sm text-gray-500">अगर दायित्व है तो विस्तार से लिखें (हिन्दी में)</span>
                    </label>
                    <textarea
                      id={`responsibility_details_hindi-${index}`}
                      name="responsibility_details_hindi"
                      value={entry.responsibility_details_hindi}
                      onChange={(e) => handleEntryChange(index, e)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="दायित्व के बारे में विस्तार से लिखें"
                    />
                  </div>
                  
                  {/* संघ शिक्षण */}
                  <div className="mt-4">
                    <label htmlFor={`sangh_shikshan_hindi-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="text-lg font-semibold">8. संघ शिक्षण</span>
                      <br />
                      <span className="text-sm text-gray-500">संघ शिक्षण का स्तर चुनें (हिन्दी में)</span>
                    </label>
                    <select
                      id={`sangh_shikshan_hindi-${index}`}
                      name="sangh_shikshan_hindi"
                      value={entry.sangh_shikshan_hindi}
                      onChange={(e) => handleEntryChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">संघ शिक्षण चुनें</option>
                      <option value="प्रारम्भिक वर्ग">प्रारम्भिक वर्ग</option>
                      <option value="प्राथमिक वर्ग">प्राथमिक वर्ग</option>
                      <option value="प्रथम वर्ष">प्रथम वर्ष</option>
                      <option value="द्वितीय वर्ष">द्वितीय वर्ष</option>
                      <option value="तृतीय वर्ष">तृतीय वर्ष</option>
                      <option value="संघ शिक्षा वर्ग">संघ शिक्षा वर्ग</option>
                      <option value="कार्यकर्ता विकास वर्ग - 1">कार्यकर्ता विकास वर्ग - 1</option>
                      <option value="कार्यकर्ता विकास वर्ग - 2">कार्यकर्ता विकास वर्ग - 2</option>
                    </select>
                  </div>
                  
                  {/* गणवेश जानकारी */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="text-lg font-semibold">9. गणवेश जानकारी</span>
                      <br />
                      <span className="text-sm text-gray-500">गणवेश की स्थिति चुनें (हिन्दी में)</span>
                    </label>
                    <div className="space-y-2">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="ganvesh_information"
                          value="पूर्ण गणवेश"
                          checked={entry.ganvesh_information === "पूर्ण गणवेश"}
                          onChange={(e) => handleEntryChange(index, e)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2">पूर्ण गणवेश</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="ganvesh_information"
                          value="अपूर्ण गणवेश"
                          checked={entry.ganvesh_information === "अपूर्ण गणवेश"}
                          onChange={(e) => handleEntryChange(index, e)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2">अपूर्ण गणवेश</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="ganvesh_information"
                          value="गणवेश नहीं है"
                          checked={entry.ganvesh_information === "गणवेश नहीं है"}
                          onChange={(e) => handleEntryChange(index, e)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2">गणवेश नहीं है</span>
                      </label>
                    </div>
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
                  + नई प्रविष्टि जोड़ें
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
                <div className="space-x-4">
                  {isEditing && existingEntries.length > 0 && (
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
                    {isLoading ? 'सहेजा जा रहा है...' : (isEditing ? 'अपडेट करें' : 'सेव करें')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}