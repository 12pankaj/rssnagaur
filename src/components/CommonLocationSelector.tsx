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
}

interface Mandal {
  id: number;
  name: string;
  tehsil_id: number;
}

interface CommonLocationSelectorProps {
  onLocationChange: (districtId: string, tehsilId: string, mandalId: string) => void;
  onNext: () => void;
}

export default function CommonLocationSelector({ onLocationChange, onNext }: CommonLocationSelectorProps) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [tehsils, setTehsils] = useState<Tehsil[]>([]);
  const [mandals, setMandals] = useState<Mandal[]>([]);
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTehsil, setSelectedTehsil] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');

  useEffect(() => {
    loadLocationData();
  }, []);

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
      toast.error('Error loading location data');
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    setSelectedTehsil('');
    setSelectedMandal('');
    onLocationChange(districtId, '', '');
  };

  const handleTehsilChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tehsilId = e.target.value;
    setSelectedTehsil(tehsilId);
    setSelectedMandal('');
    onLocationChange(selectedDistrict, tehsilId, '');
  };

  const handleMandalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mandalId = e.target.value;
    setSelectedMandal(mandalId);
    onLocationChange(selectedDistrict, selectedTehsil, mandalId);
  };

  const handleNext = () => {
    if (!selectedDistrict || !selectedTehsil || !selectedMandal) {
      toast.error('Please select district, tehsil, and mandal');
      return;
    }
    onNext();
  };

  return (
    <div className="bg-green-50 p-4 rounded-lg">
      <h2 className="text-lg font-semibold text-green-800 mb-4">चरण 1: स्थान चुनें</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* District Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">जिला *</label>
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
          >
            <option value="">जिला चुनें</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tehsil Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">खण्ड/नगर *</label>
          <select
            value={selectedTehsil}
            onChange={handleTehsilChange}
            disabled={!selectedDistrict}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent disabled:bg-gray-100"
          >
            <option value="">खण्ड/नगर चुनें</option>
            {tehsils
              .filter(tehsil => !selectedDistrict || tehsil.district_id === parseInt(selectedDistrict))
              .map((tehsil) => (
                <option key={tehsil.id} value={tehsil.id}>
                  {tehsil.name}
                </option>
              ))}
          </select>
        </div>

        {/* Mandal Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">मण्डल/बस्ती *</label>
          <select
            value={selectedMandal}
            onChange={handleMandalChange}
            disabled={!selectedTehsil}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent disabled:bg-gray-100"
          >
            <option value="">मण्डल/बस्ती चुनें</option>
            {mandals
              .filter(mandal => !selectedTehsil || mandal.tehsil_id === parseInt(selectedTehsil))
              .map((mandal) => (
                <option key={mandal.id} value={mandal.id}>
                  {mandal.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!selectedDistrict || !selectedTehsil || !selectedMandal}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          अगला
        </button>
      </div>
    </div>
  );
}