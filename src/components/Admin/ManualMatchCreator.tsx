import React, { useState } from 'react';
import { Plus, X, Save, Calendar, MapPin, Clock, Users, AlertCircle, Check } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Match, Team } from '../../types';

interface ManualMatchCreatorProps {
  onClose: () => void;
}

export const ManualMatchCreator: React.FC<ManualMatchCreatorProps> = ({ onClose }) => {
  const { currentTournament, setCurrentTournament, tournaments, setTournaments } = useApp();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [matchForm, setMatchForm] = useState({
    homeTeamId: '',
    awayTeamId: '',
    date: new Date().toISOString().split('T')[0],
    time: '15:00',
    venue: 'Stade Municipal',
    group: 'A',
    round: 'Phase de groupes',
    referee: '',
    weather: '',
    attendance: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!currentTournament) return null;

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!matchForm.homeTeamId) {
      newErrors.homeTeamId = 'Sélectionnez l\'équipe domicile';
    }
    if (!matchForm.awayTeamId) {
      newErrors.awayTeamId = 'Sélectionnez l\'équipe extérieur';
    }
    if (matchForm.homeTeamId === matchForm.awayTeamId) {
      newErrors.teams = 'Une équipe ne peut pas jouer contre elle-même';
    }
    if (!matchForm.date) {
      newErrors.date = 'Sélectionnez une date';
    }
    if (!matchForm.time) {
      newErrors.time = 'Sélectionnez une heure';
    }
    if (!matchForm.venue.trim()) {
      newErrors.venue = 'Saisissez un lieu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateMatch = () => {
    if (!validateForm()) return;

    const homeTeam = currentTournament.teams.find(t => t.id === matchForm.homeTeamId);
    const awayTeam = currentTournament.teams.find(t => t.id === matchForm.awayTeamId);

    if (!homeTeam || !awayTeam) {
      alert('Équipes introuvables');
      return;
    }

    // Créer la date complète
    const matchDateTime = new Date(`${matchForm.date}T${matchForm.time}`);

    const newMatch: Match = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      homeTeam,
      awayTeam,
      date: matchDateTime,
      venue: matchForm.venue.trim(),
      status: 'upcoming',
      group: matchForm.group,
      round: matchForm.round,
      referee: matchForm.referee.trim() || undefined,
      weather: matchForm.weather.trim() || undefined,
      attendance: matchForm.attendance ? parseInt(matchForm.attendance) : undefined
    };

    const updatedTournament = {
      ...currentTournament,
      matches: [...currentTournament.matches, newMatch]
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));

    // Réinitialiser le formulaire
    setMatchForm({
      homeTeamId: '',
      awayTeamId: '',
      date: new Date().toISOString().split('T')[0],
      time: '15:00',
      venue: 'Stade Municipal',
      group: 'A',
      round: 'Phase de groupes',
      referee: '',
      weather: '',
      attendance: ''
    });

    showSuccessMessage();
  };

  const availableTeams = currentTournament.teams;
  const availableGroups = currentTournament.groups;

  const rounds = [
    'Phase de groupes',
    'Huitièmes de finale',
    'Quarts de finale',
    'Demi-finale',
    'Finale',
    'Match amical',
    'Match de classement'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 z-10">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Match créé avec succès !</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Plus className="h-6 w-6 text-blue-500 mr-2" />
            Créer un Match Manuel
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Équipes */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Équipes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Équipe domicile *
                </label>
                <select
                  value={matchForm.homeTeamId}
                  onChange={(e) => setMatchForm({...matchForm, homeTeamId: e.target.value})}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.homeTeamId || errors.teams ? 'border-red-300' : 'border-blue-300'
                  }`}
                >
                  <option value="">Sélectionner une équipe</option>
                  {availableTeams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                {errors.homeTeamId && (
                  <p className="text-red-600 text-sm mt-1">{errors.homeTeamId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Équipe extérieur *
                </label>
                <select
                  value={matchForm.awayTeamId}
                  onChange={(e) => setMatchForm({...matchForm, awayTeamId: e.target.value})}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.awayTeamId || errors.teams ? 'border-red-300' : 'border-blue-300'
                  }`}
                >
                  <option value="">Sélectionner une équipe</option>
                  {availableTeams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                {errors.awayTeamId && (
                  <p className="text-red-600 text-sm mt-1">{errors.awayTeamId}</p>
                )}
              </div>
            </div>

            {errors.teams && (
              <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-red-800 text-sm">{errors.teams}</p>
              </div>
            )}
          </div>

          {/* Date et Heure */}
          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Date et Heure
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={matchForm.date}
                  onChange={(e) => setMatchForm({...matchForm, date: e.target.value})}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.date ? 'border-red-300' : 'border-green-300'
                  }`}
                />
                {errors.date && (
                  <p className="text-red-600 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">
                  Heure *
                </label>
                <input
                  type="time"
                  value={matchForm.time}
                  onChange={(e) => setMatchForm({...matchForm, time: e.target.value})}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.time ? 'border-red-300' : 'border-green-300'
                  }`}
                />
                {errors.time && (
                  <p className="text-red-600 text-sm mt-1">{errors.time}</p>
                )}
              </div>
            </div>
          </div>

          {/* Lieu et Détails */}
          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Lieu et Détails
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-800 mb-2">
                  Stade/Terrain *
                </label>
                <input
                  type="text"
                  value={matchForm.venue}
                  onChange={(e) => setMatchForm({...matchForm, venue: e.target.value})}
                  placeholder="Nom du stade"
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.venue ? 'border-red-300' : 'border-purple-300'
                  }`}
                />
                {errors.venue && (
                  <p className="text-red-600 text-sm mt-1">{errors.venue}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-800 mb-2">
                  Groupe
                </label>
                <select
                  value={matchForm.group}
                  onChange={(e) => setMatchForm({...matchForm, group: e.target.value})}
                  className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {availableGroups.map(group => (
                    <option key={group} value={group}>Groupe {group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-800 mb-2">
                  Phase/Tour
                </label>
                <select
                  value={matchForm.round}
                  onChange={(e) => setMatchForm({...matchForm, round: e.target.value})}
                  className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {rounds.map(round => (
                    <option key={round} value={round}>{round}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-800 mb-2">
                  Arbitre
                </label>
                <input
                  type="text"
                  value={matchForm.referee}
                  onChange={(e) => setMatchForm({...matchForm, referee: e.target.value})}
                  placeholder="Nom de l'arbitre"
                  className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-800 mb-2">
                  Météo
                </label>
                <input
                  type="text"
                  value={matchForm.weather}
                  onChange={(e) => setMatchForm({...matchForm, weather: e.target.value})}
                  placeholder="Ensoleillé, 25°C"
                  className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-800 mb-2">
                  Spectateurs attendus
                </label>
                <input
                  type="number"
                  value={matchForm.attendance}
                  onChange={(e) => setMatchForm({...matchForm, attendance: e.target.value})}
                  placeholder="1000"
                  min="0"
                  className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Aperçu du match */}
          {matchForm.homeTeamId && matchForm.awayTeamId && matchForm.homeTeamId !== matchForm.awayTeamId && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Aperçu du Match</h3>
              
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <h4 className="font-bold text-lg">
                    {availableTeams.find(t => t.id === matchForm.homeTeamId)?.name}
                  </h4>
                  <p className="text-sm text-gray-600">Domicile</p>
                </div>

                <div className="flex-shrink-0 mx-8">
                  <div className="bg-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <Clock className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                      <div className="font-bold">
                        {new Date(`${matchForm.date}T${matchForm.time}`).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-600">{matchForm.time}</div>
                    </div>
                  </div>
                </div>

                <div className="text-center flex-1">
                  <h4 className="font-bold text-lg">
                    {availableTeams.find(t => t.id === matchForm.awayTeamId)?.name}
                  </h4>
                  <p className="text-sm text-gray-600">Extérieur</p>
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-gray-600">
                <p>{matchForm.round} • {matchForm.venue}</p>
                {matchForm.referee && <p>Arbitre: {matchForm.referee}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleCreateMatch}
            disabled={!matchForm.homeTeamId || !matchForm.awayTeamId || matchForm.homeTeamId === matchForm.awayTeamId}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Créer le Match</span>
          </button>
        </div>
      </div>
    </div>
  );
};