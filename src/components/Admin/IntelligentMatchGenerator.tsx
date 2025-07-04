import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Settings, Play, X, Check, AlertCircle, Users, Target, Zap } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Team, Match, TournamentFormat } from '../../types';
import { generateIntelligentMatches } from '../../utils/intelligentMatchGenerator';

interface IntelligentMatchGeneratorProps {
  onClose: () => void;
}

export const IntelligentMatchGenerator: React.FC<IntelligentMatchGeneratorProps> = ({ onClose }) => {
  const { currentTournament, setCurrentTournament, tournaments, setTournaments } = useApp();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto');

  // Configuration pour la génération automatique
  const [config, setConfig] = useState({
    intervalBetweenMatches: 1, // jours
    matchesPerDay: 2,
    matchTimes: ['15:00', '18:00'],
    venues: ['Stade Municipal', 'Terrain Central', 'Stade des Jeunes'],
    journeysCount: 2, // Pour format liga (aller-retour)
    restDaysBetweenRounds: 3,
    groupPhaseFirst: true,
    respectTournamentPeriod: true
  });

  // Configuration pour match manuel
  const [manualMatch, setManualMatch] = useState({
    homeTeamId: '',
    awayTeamId: '',
    date: '',
    time: '15:00',
    venue: 'Stade Municipal',
    round: 'Phase de groupes',
    group: 'A'
  });

  if (!currentTournament) return null;

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleGenerateMatches = async () => {
    setIsGenerating(true);
    
    try {
      const generatedMatches = generateIntelligentMatches({
        tournament: currentTournament,
        config: {
          ...config,
          startDate: currentTournament.startDate,
          endDate: currentTournament.endDate
        }
      });

      const updatedTournament = {
        ...currentTournament,
        matches: [...currentTournament.matches, ...generatedMatches]
      };

      setCurrentTournament(updatedTournament);
      setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
      
      showSuccessMessage();
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      alert('Erreur lors de la génération des matchs');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManualMatch = () => {
    if (!manualMatch.homeTeamId || !manualMatch.awayTeamId || !manualMatch.date) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (manualMatch.homeTeamId === manualMatch.awayTeamId) {
      alert('Une équipe ne peut pas jouer contre elle-même');
      return;
    }

    const homeTeam = currentTournament.teams.find(t => t.id === manualMatch.homeTeamId);
    const awayTeam = currentTournament.teams.find(t => t.id === manualMatch.awayTeamId);

    if (!homeTeam || !awayTeam) {
      alert('Équipes non trouvées');
      return;
    }

    const matchDate = new Date(`${manualMatch.date}T${manualMatch.time}`);
    
    const newMatch: Match = {
      id: Date.now().toString(),
      homeTeam,
      awayTeam,
      date: matchDate,
      venue: manualMatch.venue,
      status: 'upcoming',
      group: manualMatch.group,
      round: manualMatch.round
    };

    const updatedTournament = {
      ...currentTournament,
      matches: [...currentTournament.matches, newMatch]
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));

    // Reset form
    setManualMatch({
      homeTeamId: '',
      awayTeamId: '',
      date: '',
      time: '15:00',
      venue: 'Stade Municipal',
      round: 'Phase de groupes',
      group: 'A'
    });

    showSuccessMessage();
  };

  const addMatchTime = () => {
    const newTime = prompt('Nouvelle heure de match (format HH:MM):', '20:00');
    if (newTime && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTime)) {
      setConfig({
        ...config,
        matchTimes: [...config.matchTimes, newTime]
      });
    }
  };

  const removeMatchTime = (index: number) => {
    if (config.matchTimes.length > 1) {
      setConfig({
        ...config,
        matchTimes: config.matchTimes.filter((_, i) => i !== index)
      });
    }
  };

  const addVenue = () => {
    const newVenue = prompt('Nouveau stade/terrain:');
    if (newVenue && newVenue.trim()) {
      setConfig({
        ...config,
        venues: [...config.venues, newVenue.trim()]
      });
    }
  };

  const removeVenue = (index: number) => {
    if (config.venues.length > 1) {
      setConfig({
        ...config,
        venues: config.venues.filter((_, i) => i !== index)
      });
    }
  };

  const getFormatDescription = () => {
    switch (currentTournament.format) {
      case 'league':
        return 'Format Liga: Tous les équipes se rencontrent en matchs aller-retour';
      case 'world_cup':
        return 'Format Coupe du Monde: Phase de groupes puis phases éliminatoires';
      case 'champions_league':
        return 'Format Ligue des Champions: Groupes puis élimination avec matchs aller-retour';
      default:
        return 'Format personnalisé';
    }
  };

  const renderAutoGeneration = () => (
    <div className="space-y-6">
      {/* Format Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Format du Tournoi: {currentTournament.format.toUpperCase()}
        </h4>
        <p className="text-blue-700 text-sm">{getFormatDescription()}</p>
        <div className="mt-2 text-sm text-blue-600">
          <strong>Équipes:</strong> {currentTournament.teams.length} • 
          <strong> Groupes:</strong> {currentTournament.groups.length} • 
          <strong> Période:</strong> {currentTournament.startDate.toLocaleDateString('fr-FR')} - {currentTournament.endDate.toLocaleDateString('fr-FR')}
        </div>
      </div>

      {/* Configuration de base */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 text-purple-500 mr-2" />
          Configuration de Base
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intervalle entre matchs (jours)
            </label>
            <select
              value={config.intervalBetweenMatches}
              onChange={(e) => setConfig({...config, intervalBetweenMatches: parseInt(e.target.value)})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="0">Même jour</option>
              <option value="1">1 jour</option>
              <option value="2">2 jours</option>
              <option value="3">3 jours</option>
              <option value="7">1 semaine</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matchs par jour
            </label>
            <select
              value={config.matchesPerDay}
              onChange={(e) => setConfig({...config, matchesPerDay: parseInt(e.target.value)})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="1">1 match</option>
              <option value="2">2 matchs</option>
              <option value="3">3 matchs</option>
              <option value="4">4 matchs</option>
              <option value="6">6 matchs</option>
            </select>
          </div>

          {currentTournament.format === 'league' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de journées (aller-retour)
              </label>
              <select
                value={config.journeysCount}
                onChange={(e) => setConfig({...config, journeysCount: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="1">Aller seulement</option>
                <option value="2">Aller-retour</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jours de repos entre tours
            </label>
            <select
              value={config.restDaysBetweenRounds}
              onChange={(e) => setConfig({...config, restDaysBetweenRounds: parseInt(e.target.value)})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="1">1 jour</option>
              <option value="2">2 jours</option>
              <option value="3">3 jours</option>
              <option value="7">1 semaine</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.respectTournamentPeriod}
              onChange={(e) => setConfig({...config, respectTournamentPeriod: e.target.checked})}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Respecter la période du tournoi</span>
          </label>
        </div>
      </div>

      {/* Heures des matchs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 text-blue-500 mr-2" />
          Heures des Matchs
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {config.matchTimes.map((time, index) => (
            <div key={index} className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">{time}</span>
              <button
                onClick={() => removeMatchTime(index)}
                className="text-red-600 hover:text-red-800"
                disabled={config.matchTimes.length === 1}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        
        <button
          onClick={addMatchTime}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Ajouter une heure
        </button>
      </div>

      {/* Stades et terrains */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 text-green-500 mr-2" />
          Stades et Terrains
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {config.venues.map((venue, index) => (
            <div key={index} className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900">{venue}</span>
              <button
                onClick={() => removeVenue(index)}
                className="text-red-600 hover:text-red-800"
                disabled={config.venues.length === 1}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        
        <button
          onClick={addVenue}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Ajouter un stade
        </button>
      </div>

      {/* Aperçu de la génération */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Aperçu de la Génération</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Matchs estimés:</span>
            <div className="font-bold text-lg text-blue-600">
              {currentTournament.format === 'league' 
                ? (currentTournament.teams.length * (currentTournament.teams.length - 1) * config.journeysCount / 2)
                : 'Variable selon format'
              }
            </div>
          </div>
          <div>
            <span className="text-gray-600">Durée estimée:</span>
            <div className="font-bold text-lg text-green-600">
              {Math.ceil((currentTournament.endDate.getTime() - currentTournament.startDate.getTime()) / (1000 * 60 * 60 * 24))} jours
            </div>
          </div>
          <div>
            <span className="text-gray-600">Stades utilisés:</span>
            <div className="font-bold text-lg text-purple-600">{config.venues.length}</div>
          </div>
        </div>
      </div>

      {/* Bouton de génération */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerateMatches}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-3 shadow-lg disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <Zap className="h-6 w-6" />
              <span>Générer Automatiquement</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderManualCreation = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 text-orange-500 mr-2" />
          Créer un Match Manuel
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Équipe domicile *
            </label>
            <select
              value={manualMatch.homeTeamId}
              onChange={(e) => setManualMatch({...manualMatch, homeTeamId: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Sélectionner une équipe</option>
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
              value={manualMatch.awayTeamId}
              onChange={(e) => setManualMatch({...manualMatch, awayTeamId: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Sélectionner une équipe</option>
              {currentTournament.teams
                .filter(team => team.id !== manualMatch.homeTeamId)
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
              value={manualMatch.date}
              onChange={(e) => setManualMatch({...manualMatch, date: e.target.value})}
              min={currentTournament.startDate.toISOString().split('T')[0]}
              max={currentTournament.endDate.toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure
            </label>
            <select
              value={manualMatch.time}
              onChange={(e) => setManualMatch({...manualMatch, time: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {config.matchTimes.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stade
            </label>
            <select
              value={manualMatch.venue}
              onChange={(e) => setManualMatch({...manualMatch, venue: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {config.venues.map(venue => (
                <option key={venue} value={venue}>{venue}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Groupe
            </label>
            <select
              value={manualMatch.group}
              onChange={(e) => setManualMatch({...manualMatch, group: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {currentTournament.groups.map(group => (
                <option key={group} value={group}>Groupe {group}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phase/Tour
            </label>
            <select
              value={manualMatch.round}
              onChange={(e) => setManualMatch({...manualMatch, round: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Phase de groupes">Phase de groupes</option>
              <option value="Huitièmes de finale">Huitièmes de finale</option>
              <option value="Quarts de finale">Quarts de finale</option>
              <option value="Demi-finales">Demi-finales</option>
              <option value="Finale">Finale</option>
              <option value="Match amical">Match amical</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleCreateManualMatch}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Créer le Match</span>
          </button>
        </div>
      </div>

      {/* Matchs existants */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Matchs Existants ({currentTournament.matches.length})
        </h3>
        
        {currentTournament.matches.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {currentTournament.matches
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map(match => (
                <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {match.homeTeam.name} vs {match.awayTeam.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {match.date.toLocaleDateString('fr-FR')} à {match.date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} • {match.venue}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {match.round}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun match créé pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 z-10">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Opération réussie !</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Zap className="h-6 w-6 text-purple-500 mr-2" />
              Générateur Intelligent de Matchs
            </h2>
            <p className="text-gray-600 mt-1">
              Système avancé de génération automatique et création manuelle
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('auto')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'auto'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Zap className="h-5 w-5" />
            <span>Génération Automatique</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'manual'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Création Manuelle</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'auto' && renderAutoGeneration()}
          {activeTab === 'manual' && renderManualCreation()}
        </div>
      </div>
    </div>
  );
};