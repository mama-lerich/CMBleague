import React, { useState } from 'react';
import { Calendar, Plus, Save, X, Clock, MapPin, Users, Shuffle, AlertCircle } from 'lucide-react';
import { Match, Team } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface MatchSchedulerProps {
  onClose: () => void;
}

export const MatchScheduler: React.FC<MatchSchedulerProps> = ({ onClose }) => {
  const { currentTournament, setCurrentTournament, tournaments, setTournaments } = useApp();
  const [activeTab, setActiveTab] = useState<'manual' | 'auto' | 'manage'>('manual');
  const [showSuccess, setShowSuccess] = useState(false);

  // Manual match creation
  const [matchForm, setMatchForm] = useState({
    homeTeamId: '',
    awayTeamId: '',
    date: '',
    time: '15:00',
    venue: '',
    round: 'Phase de groupes',
    group: 'A'
  });

  // Auto generation settings
  const [autoSettings, setAutoSettings] = useState({
    startDate: '',
    matchesPerDay: 2,
    restDaysBetweenRounds: 1,
    venues: ['Stade Municipal', 'Terrain Central', 'Complexe Sportif'],
    timeSlots: ['15:00', '17:00', '19:00']
  });

  if (!currentTournament) return null;

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCreateMatch = () => {
    if (!matchForm.homeTeamId || !matchForm.awayTeamId || !matchForm.date) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (matchForm.homeTeamId === matchForm.awayTeamId) {
      alert('Une équipe ne peut pas jouer contre elle-même');
      return;
    }

    const homeTeam = currentTournament.teams.find(t => t.id === matchForm.homeTeamId);
    const awayTeam = currentTournament.teams.find(t => t.id === matchForm.awayTeamId);

    if (!homeTeam || !awayTeam) {
      alert('Équipes non trouvées');
      return;
    }

    const matchDateTime = new Date(`${matchForm.date}T${matchForm.time}`);

    const newMatch: Match = {
      id: Date.now().toString(),
      homeTeam,
      awayTeam,
      date: matchDateTime,
      venue: matchForm.venue,
      status: 'upcoming',
      group: matchForm.group,
      round: matchForm.round
    };

    const updatedTournament = {
      ...currentTournament,
      matches: [...currentTournament.matches, newMatch]
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));

    // Reset form
    setMatchForm({
      homeTeamId: '',
      awayTeamId: '',
      date: '',
      time: '15:00',
      venue: '',
      round: 'Phase de groupes',
      group: 'A'
    });

    showSuccessMessage();
  };

  const generateGroupMatches = () => {
    if (!autoSettings.startDate) {
      alert('Veuillez définir une date de début');
      return;
    }

    const newMatches: Match[] = [];
    let currentDate = new Date(autoSettings.startDate);
    let matchesCreatedToday = 0;
    let timeSlotIndex = 0;
    let venueIndex = 0;

    // Generate matches for each group
    currentTournament.groups.forEach(group => {
      const groupTeams = currentTournament.teams.filter(t => t.group === group);
      
      // Generate round-robin matches for this group
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          const homeTeam = groupTeams[i];
          const awayTeam = groupTeams[j];

          // Check if we need to move to next day
          if (matchesCreatedToday >= autoSettings.matchesPerDay) {
            currentDate.setDate(currentDate.getDate() + 1);
            matchesCreatedToday = 0;
            timeSlotIndex = 0;
          }

          const matchTime = autoSettings.timeSlots[timeSlotIndex % autoSettings.timeSlots.length];
          const venue = autoSettings.venues[venueIndex % autoSettings.venues.length];

          const matchDateTime = new Date(`${currentDate.toISOString().split('T')[0]}T${matchTime}`);

          newMatches.push({
            id: `${Date.now()}-${newMatches.length}`,
            homeTeam,
            awayTeam,
            date: matchDateTime,
            venue,
            status: 'upcoming',
            group,
            round: 'Phase de groupes'
          });

          matchesCreatedToday++;
          timeSlotIndex++;
          venueIndex++;
        }
      }

      // Add rest days between groups
      if (autoSettings.restDaysBetweenRounds > 0) {
        currentDate.setDate(currentDate.getDate() + autoSettings.restDaysBetweenRounds);
        matchesCreatedToday = 0;
        timeSlotIndex = 0;
      }
    });

    const updatedTournament = {
      ...currentTournament,
      matches: [...currentTournament.matches, ...newMatches]
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
    showSuccessMessage();
  };

  const handleDeleteMatch = (matchId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce match ?')) {
      const updatedTournament = {
        ...currentTournament,
        matches: currentTournament.matches.filter(m => m.id !== matchId)
      };

      setCurrentTournament(updatedTournament);
      setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
      showSuccessMessage();
    }
  };

  const renderManualTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Plus className="h-6 w-6 text-blue-500 mr-2" />
          Créer un Match Manuellement
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Équipe domicile *
            </label>
            <select
              value={matchForm.homeTeamId}
              onChange={(e) => setMatchForm({...matchForm, homeTeamId: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choisir l'équipe domicile</option>
              {currentTournament.teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Équipe extérieur *
            </label>
            <select
              value={matchForm.awayTeamId}
              onChange={(e) => setMatchForm({...matchForm, awayTeamId: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choisir l'équipe extérieur</option>
              {currentTournament.teams
                .filter(team => team.id !== matchForm.homeTeamId)
                .map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={matchForm.date}
              onChange={(e) => setMatchForm({...matchForm, date: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure
            </label>
            <input
              type="time"
              value={matchForm.time}
              onChange={(e) => setMatchForm({...matchForm, time: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lieu
            </label>
            <input
              type="text"
              value={matchForm.venue}
              onChange={(e) => setMatchForm({...matchForm, venue: e.target.value})}
              placeholder="Stade Municipal"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phase
            </label>
            <select
              value={matchForm.round}
              onChange={(e) => setMatchForm({...matchForm, round: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Phase de groupes">Phase de groupes</option>
              <option value="Huitième de finale">Huitième de finale</option>
              <option value="Quart de finale">Quart de finale</option>
              <option value="Demi-finale">Demi-finale</option>
              <option value="Finale">Finale</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Groupe
            </label>
            <select
              value={matchForm.group}
              onChange={(e) => setMatchForm({...matchForm, group: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currentTournament.groups.map(group => (
                <option key={group} value={group}>Groupe {group}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCreateMatch}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Créer le Match</span>
        </button>
      </div>
    </div>
  );

  const renderAutoTab = () => (
    <div className="space-y-6">
      {/* Auto Generation Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Shuffle className="h-6 w-6 text-purple-500 mr-2" />
          Génération Automatique des Matchs
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de début *
            </label>
            <input
              type="date"
              value={autoSettings.startDate}
              onChange={(e) => setAutoSettings({...autoSettings, startDate: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matchs par jour
            </label>
            <select
              value={autoSettings.matchesPerDay}
              onChange={(e) => setAutoSettings({...autoSettings, matchesPerDay: parseInt(e.target.value)})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="1">1 match par jour</option>
              <option value="2">2 matchs par jour</option>
              <option value="3">3 matchs par jour</option>
              <option value="4">4 matchs par jour</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jours de repos entre phases
            </label>
            <select
              value={autoSettings.restDaysBetweenRounds}
              onChange={(e) => setAutoSettings({...autoSettings, restDaysBetweenRounds: parseInt(e.target.value)})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="0">Aucun jour de repos</option>
              <option value="1">1 jour de repos</option>
              <option value="2">2 jours de repos</option>
              <option value="3">3 jours de repos</option>
            </select>
          </div>
        </div>

        {/* Venues Management */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lieux disponibles
          </label>
          <div className="space-y-2">
            {autoSettings.venues.map((venue, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => {
                    const newVenues = [...autoSettings.venues];
                    newVenues[index] = e.target.value;
                    setAutoSettings({...autoSettings, venues: newVenues});
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => {
                    const newVenues = autoSettings.venues.filter((_, i) => i !== index);
                    setAutoSettings({...autoSettings, venues: newVenues});
                  }}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setAutoSettings({
                ...autoSettings, 
                venues: [...autoSettings.venues, 'Nouveau stade']
              })}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              + Ajouter un lieu
            </button>
          </div>
        </div>

        {/* Time Slots Management */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Créneaux horaires
          </label>
          <div className="space-y-2">
            {autoSettings.timeSlots.map((time, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    const newTimeSlots = [...autoSettings.timeSlots];
                    newTimeSlots[index] = e.target.value;
                    setAutoSettings({...autoSettings, timeSlots: newTimeSlots});
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => {
                    const newTimeSlots = autoSettings.timeSlots.filter((_, i) => i !== index);
                    setAutoSettings({...autoSettings, timeSlots: newTimeSlots});
                  }}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setAutoSettings({
                ...autoSettings, 
                timeSlots: [...autoSettings.timeSlots, '15:00']
              })}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              + Ajouter un créneau
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-purple-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-purple-900 mb-2">Aperçu de la génération</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-purple-600">Groupes:</span>
              <div className="font-bold">{currentTournament.groups.length}</div>
            </div>
            <div>
              <span className="text-purple-600">Équipes:</span>
              <div className="font-bold">{currentTournament.teams.length}</div>
            </div>
            <div>
              <span className="text-purple-600">Matchs estimés:</span>
              <div className="font-bold">
                {currentTournament.groups.reduce((total, group) => {
                  const groupTeams = currentTournament.teams.filter(t => t.group === group);
                  return total + (groupTeams.length * (groupTeams.length - 1) / 2);
                }, 0)}
              </div>
            </div>
            <div>
              <span className="text-purple-600">Durée estimée:</span>
              <div className="font-bold">
                {Math.ceil(currentTournament.groups.reduce((total, group) => {
                  const groupTeams = currentTournament.teams.filter(t => t.group === group);
                  return total + (groupTeams.length * (groupTeams.length - 1) / 2);
                }, 0) / autoSettings.matchesPerDay)} jours
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={generateGroupMatches}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Shuffle className="h-5 w-5" />
          <span>Générer les Matchs de Poule</span>
        </button>
      </div>
    </div>
  );

  const renderManageTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Matchs Programmés ({currentTournament.matches.length})
        </h3>
        
        {currentTournament.matches.length > 0 ? (
          <div className="space-y-4">
            {currentTournament.matches
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map(match => (
                <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h4 className="font-semibold text-lg">
                          {match.homeTeam.name} vs {match.awayTeam.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          match.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          match.status === 'live' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {match.status === 'upcoming' ? 'À venir' : 
                           match.status === 'live' ? 'En cours' : 'Terminé'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {match.date.toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {match.date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {match.venue}
                        </div>
                        <div>
                          {match.round} • Groupe {match.group}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun match programmé
            </h4>
            <p className="text-gray-500">
              Créez des matchs manuellement ou utilisez la génération automatique
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 z-10">
            <Save className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Opération réussie !</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-6 w-6 text-blue-500 mr-2" />
            Planification des Matchs
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-6 border-b border-gray-200">
          {[
            { key: 'manual', label: 'Manuel', icon: Plus },
            { key: 'auto', label: 'Automatique', icon: Shuffle },
            { key: 'manage', label: 'Gérer', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'manual' && renderManualTab()}
          {activeTab === 'auto' && renderAutoTab()}
          {activeTab === 'manage' && renderManageTab()}
        </div>
      </div>
    </div>
  );
};