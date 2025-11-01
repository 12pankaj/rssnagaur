'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Location {
  id: number;
  name: string;
}

interface TeamData {
  teamNumber: string;
  teamLeader: string;
  leaderPhone: string;
  assistantLeader: string;
  assistantPhone: string;
  member1: string;
  member1Phone: string;
  member2: string;
  member2Phone: string;
  member3: string;
  member3Phone: string;
  location: string;
}

export default function CampaignTeamForm() {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [districts, setDistricts] = useState<Location[]>([]);
  const [tehsils, setTehsils] = useState<Location[]>([]);
  const [mandals, setMandals] = useState<Location[]>([]);
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTehsil, setSelectedTehsil] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  
  const [teams, setTeams] = useState<TeamData[]>([{ 
    teamNumber: '', 
    teamLeader: '', 
    leaderPhone: '', 
    assistantLeader: '', 
    assistantPhone: '', 
    member1: '', 
    member1Phone: '', 
    member2: '', 
    member2Phone: '', 
    member3: '', 
    member3Phone: '' ,
    location: '' 
  }]);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'guest') {
      router.push('/');
      return;
    }
    fetchDistricts();
  }, [isAuthenticated, user, router]);

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
        setDistricts(data.districts);
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
        setTehsils(data.tehsils);
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
        setMandals(data.mandals);
      }
    } catch (error) {
      toast.error('Error fetching mandals');
    }
  };

  const updateTeam = (index: number, field: keyof TeamData, value: string) => {
    const updatedTeams = [...teams];
    updatedTeams[index][field] = value;
    setTeams(updatedTeams);
  };

  const handleNext = () => {
    if (!selectedDistrict || !selectedTehsil || !selectedMandal) {
      toast.error('Please select district, tehsil, and mandal');
      return;
    }
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    if (teams.length === 0) {
      toast.error('Please fill at least one team entry');
      return;
    }

    const validTeams = teams.filter(team => team.teamNumber && team.teamLeader && team.leaderPhone && team.location && team.assistantPhone && team.assistantLeader);
    if (validTeams.length === 0) {
      toast.error('Please fill required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const teamData = validTeams.map(team => ({
        districtId: parseInt(selectedDistrict),
        tehsilId: parseInt(selectedTehsil),
        mandalId: parseInt(selectedMandal),
        location: team.location || '',
        teamNumber: parseInt(team.teamNumber) || 0,
        teamLeader: team.teamLeader,
        leaderPhone: team.leaderPhone,
        assistantLeader: team.assistantLeader || '',
        assistantPhone: team.assistantPhone || '',
        member1: team.member1 || '',
        member1Phone: team.member1Phone || '',
        member2: team.member2 || '',
        member2Phone: team.member2Phone || '',
        member3: team.member3 || '',
        member3Phone: team.member3Phone || ''
      }));

      const response = await fetch('/api/forms/campaign-teams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ teams: teamData })
      });

      if (response.ok) {
        toast.success('Campaign teams submitted successfully!');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to submit campaign teams');
      }
    } catch (error) {
      toast.error('Error submitting campaign teams');
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">गृह सम्पर्क अभियान टोली</h1>
        <p></p>
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 mb-4">चरण 1: स्थान का चयन करें</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">जिला</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                  >
                    <option value="">जिला चुनें</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">खण्ड/नगर</label>
                  <select
                    value={selectedTehsil}
                    onChange={(e) => setSelectedTehsil(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                    disabled={!selectedDistrict}
                  >
                    <option value="">खण्ड/नगर चुनें</option>
                    {tehsils.map((tehsil) => (
                      <option key={tehsil.id} value={tehsil.id}>{tehsil.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">मण्डल/बस्ती</label>
                  <select
                    value={selectedMandal}
                    onChange={(e) => setSelectedMandal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                    disabled={!selectedTehsil}
                  >
                    <option value="">मण्डल/बस्ती चुनें</option>
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
                >
                  अगला
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800 mb-4">चरण 2: टोली विवरण भरें</h2>
              
              {teams.map((team, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">स्थान *</label>
                      <input
                        type="text"
                        value={team.location}
                        onChange={(e) => updateTeam(index, 'location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="स्थान दर्ज करें"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">टोली क्रमांक *</label>
                      <input
                        type="number"
                        value={team.teamNumber}
                        onChange={(e) => updateTeam(index, 'teamNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="टोली क्रमांक दर्ज करें"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">टोली प्रमुख *</label>
                      <input
                        type="text"
                        value={team.teamLeader}
                        onChange={(e) => updateTeam(index, 'teamLeader', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="टोली प्रमुख का नाम दर्ज करें"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">दूरभाष *</label>
                      <input
                        type="tel"
                        value={team.leaderPhone}
                        onChange={(e) => updateTeam(index, 'leaderPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="टोली प्रमुख का फ़ोन नंबर दर्ज करें"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">टोली सह प्रमुख *</label>
                      <input
                        type="text"
                        value={team.assistantLeader}
                        onChange={(e) => updateTeam(index, 'assistantLeader', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="टोली सह प्रमुख का नाम दर्ज करें"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">दूरभाष *</label>
                      <input
                        type="tel"
                        value={team.assistantPhone}
                        onChange={(e) => updateTeam(index, 'assistantPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="टोली सह प्रमुख का फ़ोन नंबर दर्ज करें"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">सदस्य 1 (सहयोगी)</label>
                      <input
                        type="text"
                        value={team.member1}
                        onChange={(e) => updateTeam(index, 'member1', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="सदस्य 1 का नाम दर्ज करें"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">दूरभाष</label>
                      <input
                        type="tel"
                        value={team.member1Phone}
                        onChange={(e) => updateTeam(index, 'member1Phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="सदस्य 1 का फ़ोन नंबर दर्ज करें"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">सदस्य 2 (सहयोगी)</label>
                      <input
                        type="text"
                        value={team.member2}
                        onChange={(e) => updateTeam(index, 'member2', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="सदस्य 2 का नाम दर्ज करें"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">दूरभाष</label>
                      <input
                        type="tel"
                        value={team.member2Phone}
                        onChange={(e) => updateTeam(index, 'member2Phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="सदस्य 2 का फ़ोन नंबर दर्ज करें"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">सदस्य 3 (सहयोगी)</label>
                      <input
                        type="text"
                        value={team.member3}
                        onChange={(e) => updateTeam(index, 'member3', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="सदस्य 3 का नाम दर्ज करें"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">दूरभाष</label>
                      <input
                        type="tel"
                        value={team.member3Phone}
                        onChange={(e) => updateTeam(index, 'member3Phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="सदस्य 3 का फ़ोन नंबर दर्ज करें"
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
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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