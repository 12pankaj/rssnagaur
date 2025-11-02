'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import EnhancedLocationSelector from '@/components/EnhancedLocationSelector';
// import CommonLocationSelector from '@/components/LocationManagement';

interface TeamData {
  mandal_leader: string;
  leader_phone: string;
  mandal_secretary: string;
  secretary_phone: string;
  member1: string;
  member1_phone: string;
  member2: string;
  member2_phone: string;
  member3: string;
  member3_phone: string;
  member4: string;
  member4_phone: string;
  member5: string;
  member5_phone: string;
  member6: string;
  member6_phone: string;
  member7: string;
  member7_phone: string;
  member8: string;
  member8_phone: string;
  member9: string;
  member9_phone: string;
}

export default function MandalTeamForm() {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTehsil, setSelectedTehsil] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  
  // Initialize team data with empty strings
  // Required fields: mandal_leader, leader_phone, and at least one member with name and phone
  const [team, setTeam] = useState<TeamData>({
    mandal_leader: '',
    leader_phone: '',
    mandal_secretary: '',
    secretary_phone: '',
    member1: '',
    member1_phone: '',
    member2: '',
    member2_phone: '',
    member3: '',
    member3_phone: '',
    member4: '',
    member4_phone: '',
    member5: '',
    member5_phone: '',
    member6: '',
    member6_phone: '',
    member7: '',
    member7_phone: '',
    member8: '',
    member8_phone: '',
    member9: '',
    member9_phone: ''
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
    setTeam(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!team.mandal_leader || !team.leader_phone || !team.mandal_secretary || !team.secretary_phone) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Check if at least 5 team members are filled
    let filledMembers = 0;
    const memberErrors = [];
    
    for (let i = 1; i <= 9; i++) {
      const memberName = team[`member${i}` as keyof TeamData];
      const memberPhone = team[`member${i}_phone` as keyof TeamData];
      
      if (memberName || memberPhone) {
        if (!memberName) {
          memberErrors.push(`Please fill name for member ${i}`);
        }
        if (!memberPhone) {
          memberErrors.push(`Please fill phone for member ${i}`);
        }
        if (memberName && memberPhone) {
          filledMembers++;
        }
      }
    }
    
    if (filledMembers < 5) {
      toast.error('Please fill at least 5 team members completely');
      return;
    }
    
    if (memberErrors.length > 0) {
      toast.error(memberErrors[0]); // Show first error
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/forms/mandal-teams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          districtId: parseInt(selectedDistrict),
          tehsilId: parseInt(selectedTehsil),
          mandalId: parseInt(selectedMandal),
          ...team
        })
      });

      if (response.ok) {
        toast.success('Mandal team submitted successfully!');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to submit mandal team');
      }
    } catch (error) {
      toast.error('Error submitting mandal team');
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">मण्डल टोली विवरण</h1>
        
        {/* {currentStep === 1 && (
        //   <CommonLocationSelector 
        //     onLocationChange={handleLocationChange}
        //     onNext={handleNext}
        //     title="चरण 1: स्थान का चयन करें"
        //     subtitle="कृपया जिला, खण्ड/नगर और मण्डल/बस्ती चुनें"
        //   />
        )} */}
    {currentStep === 1 && (
          <EnhancedLocationSelector
            onLocationChange={handleLocationChange}
            onNext={handleNext}
          />
        )}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800 mb-4">चरण 2: मण्डल टोली विवरण भरें</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">मण्डल पालक  *</label>
                  <input
                    type="text"
                    name="mandal_leader"
                    value={team.mandal_leader}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                    placeholder="मण्डल पालक का नाम दर्ज करें"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">दूरभाष *</label>
                  <input
                    type="tel"
                    name="leader_phone"
                    value={team.leader_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                    placeholder="मण्डल पालक का फ़ोन नंबर दर्ज करें"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">मण्डल कार्यवाह *</label>
                  <input
                    type="text"
                    name="mandal_secretary"
                    value={team.mandal_secretary}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                    placeholder="मण्डल कार्यवाह का नाम दर्ज करें"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">दूरभाष *</label>
                  <input
                    type="tel"
                    name="secretary_phone"
                    value={team.secretary_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                    placeholder="मण्डल कार्यवाह का फ़ोन नंबर दर्ज करें"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-3">टोली के सदस्य * (कम से कम 5)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <div key={i} className="grid grid-cols-1 gap-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">सदस्य {i} (सहयोगी)</label>
                     
                      <input
                        type="text"
                        name={`member${i}`}
                        value={team[`member${i}` as keyof TeamData]}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder={`सदस्य ${i} का नाम`}
                      />
                      
                      <label className="block text-sm font-medium text-gray-700 mb-2">दूरभाष *</label>
                      <input
                        type="tel"
                        name={`member${i}_phone`}
                        value={team[`member${i}_phone` as keyof TeamData]}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder={`सदस्य ${i} का फ़ोन नंबर`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  पीछे
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'सहेजा जा रहा है...' : 'सहेजें'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}