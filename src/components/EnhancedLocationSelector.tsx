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

interface EnhancedLocationSelectorProps {
  onLocationChange: (districtId: string, tehsilId: string, mandalId: string) => void;
  onNext: () => void;
}

export default function EnhancedLocationSelector({ onLocationChange, onNext }: EnhancedLocationSelectorProps) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [tehsils, setTehsils] = useState<Tehsil[]>([]);
  const [mandals, setMandals] = useState<Mandal[]>([]);
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTehsil, setSelectedTehsil] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');

  useEffect(() => {
    fetchDistricts();
  }, []);

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
        setDistricts(data.districts || []);
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
        setTehsils(data.tehsils || []);
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
        setMandals(data.mandals || []);
      }
    } catch (error) {
      toast.error('Error fetching mandals');
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    onLocationChange(districtId, '', '');
  };

  const handleTehsilChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tehsilId = e.target.value;
    setSelectedTehsil(tehsilId);
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
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-4">Step 1: Select Location</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
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
              onChange={handleTehsilChange}
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
              onChange={handleMandalChange}
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
            disabled={!selectedDistrict || !selectedTehsil || !selectedMandal}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}