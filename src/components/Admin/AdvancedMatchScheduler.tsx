import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, X, Save, AlertCircle, Check, Settings, Target, Zap } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { generateAdvancedMatches, AdvancedMatchGenerationOptions } from '../../utils/advancedMatchGenerator';
import { TournamentFormat } from '../../types';

interface AdvancedMatchSchedulerProps {
  onClose: () => void;
}

export const AdvancedMatchScheduler: React.FC<AdvancedMatchSchedulerProps> = ({ onClose }) => {
  const { currentTournament, setCurrentTournament, tournaments, setTournaments } = useApp();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Configuration de base
  const [startDate, setStartDate] = useState(
    currentTournament?.startDate.toISOString().split('T')[0] || 
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    currentTournament?.endDate.toISOString().split('T')[0] || 
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  
  // Configuration des matchs
  const [matchesPerDay, setMatchesPerDay] = useState(2);
  const [matchTimes, setMatchTimes] = useState(['15:00', '18:00']);
  const [newMatchTime, setNewMatchTime] = useState('');
  
  // Configuration des stades
  const [venues, setVenues] = useState(['Stade Municipal', 'Terrain Central']);
  const [newVenue, setNewVenue] = useState('');
  
  // Configuration spécifique au format Liga
  const [journeysCount, setJourneysCount] = useState(
    currentTournament ? (currentTournament.teams.length - 1) * 2 : 10
  );
  
  // Configuration des groupes
  const [groupsCount, setGroupsCount] = useState(
    Math.ceil((currentTournament?.teams.length || 8) / 4)
  );
  const [teamsPerGroup, setTeamsPerGroup] = useState(4);

  if (!currentTournament) return null;

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddMatchTime = () => {
    if (newMatchTime && !matchTimes.includes(newMatchTime)) {
      setMatchTimes([...matchTimes, newMatchTime]);
      setNewMatchTime('');
    }
  };

  const handleRemoveMatchTime = (time: string) => {
    if (matchTimes.length > 1) {
      setMatchTimes(matchTimes.filter(t => t !== time));
    }
  };

  const handleAddVenue = () => {
    if (newVenue.trim() && !venues.includes(newVenue.trim())) {
      setVenues([...venues, newVenue.trim()]);
      setNewVenue('');
    }
  };

  const handleRemoveVenue = (venue: string) => {
    if (venues.length > 1) {
      setVenues(venues.filter(v => v !== venue));
    }
  };

  const calculateEstimatedDuration = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    let estimatedMatches = 0;
    
    switch (currentTournament.format) {
      case 'league':
        estimatedMatches = (currentTournament.teams.length * (currentTournament.teams.length - 1));
        break;
      case 'world_cup':
        const groupMatches = groupsCount * (teamsPerGroup * (teamsPerGroup - 1) / 2);
        const knockoutMatches = Math.max(0, (groupsCount * 2) - 1); // Approximation
        estimatedMatches = groupMatches + knockoutMatches;
        break;
      case 'champions_league':
        const clGroupMatches = groupsCount * (teamsPerGroup * (teamsPerGroup - 1));
        const clKnockoutMatches = Math.max(0, ((groupsCount * 2) - 1) * 2); // Aller-retour
        estimatedMatches = clGroupMatches + clKnockoutMatches;
        break;
    }
    
    const requiredDays = Math.ceil(estimatedMatches / matchesPerDay);
    
    return {
      totalDays,
      estimatedMatches,
      requiredDays,
      feasible: requiredDays <= totalDays
    };
  };

  const handleGenerateMatches = async () => {
    if (currentTournament.teams.length < 2) {
      alert('Il faut au moins 2 équipes pour générer des matchs');
      return;
    }

    const estimation = calculateEstimatedDuration();
    if (!estimation.feasible) {
      if (!confirm(`La période sélectionnée (${estimation.totalDays} jours) pourrait être insuffisante pour ${estimation.estimatedMatches} matchs. Continuer quand même ?`)) {
        return;
      }
    }

    setIsGenerating(true);

    try {
      const options: AdvancedMatchGenerationOptions = {
        teams: currentTournament.teams,
        format: currentTournament.format,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        venues,
        matchTimes,
        matchesPerDay,
        journeysCount: currentTournament.format === 'league' ? journeysCount : undefined,
        groupsConfig: currentTournament.format !== 'league' ? {
          groupsCount,
          teamsPerGroup
        } : undefined
      };

      const generatedMatches = generateAdvancedMatches(options);

      const updatedTournament = {
        ...currentTournament,
        matches: generatedMatches,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };

      setCurrentTournament(updatedTournament);
      setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
      
      showSuccessMessage();
    } catch (error) {
      console.error('Erreur lors de la génération des matchs:', error);
      alert('Erreur lors de la génération des matchs. Veuillez vérifier vos paramètres.');
    } finally {
      setIsGenerating(false);
    }
  };

  const estimation = calculateEstimatedDuration();

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 z-10">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Matchs générés avec succès !</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Zap className="h-6 w-6 text-orange-500 mr-2" />
              Planification Automatique Avancée
            </h2>
            <p className="text-gray-600 mt-1">
              Configuration intelligente pour {currentTournament.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Configuration de base */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              Période du Tournoi
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Configuration des matchs */}
          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
              <Settings className="h-6 w-6 mr-2" />
              Configuration des Matchs
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">
                  Matchs par jour
                </label>
                <input
                  type="number"
                  value={matchesPerDay}
                  onChange={(e) => setMatchesPerDay(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="10"
                  className="w-full border border-green-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {currentTournament.format === 'league' && (
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-2">
                    Nombre de journées
                  </label>
                  <input
                    type="number"
                    value={journeysCount}
                    onChange={(e) => setJourneysCount(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="50"
                    className="w-full border border-green-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-green-600 mt-1">
                    Recommandé: {(currentTournament.teams.length - 1) * 2} (aller-retour)
                  </p>
                </div>
              )}
            </div>

            {/* Heures des matchs */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-green-800 mb-2">
                Heures des matchs
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="time"
                  value={newMatchTime}
                  onChange={(e) => setNewMatchTime(e.target.value)}
                  className="border border-green-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleAddMatchTime}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchTimes.map((time) => (
                  <div key={time} className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4" />
                    <span>{time}</span>
                    <button
                      onClick={() => handleRemoveMatchTime(time)}
                      disabled={matchTimes.length === 1}
                      className="text-green-600 hover:text-green-800 disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration des stades */}
          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
              <MapPin className="h-6 w-6 mr-2" />
              Stades et Terrains
            </h3>
            
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
                placeholder="Nom du stade..."
                className="flex-1 border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddVenue()}
              />
              <button
                onClick={handleAddVenue}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Ajouter
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {venues.map((venue) => (
                <div key={venue} className="flex items-center justify-between p-3 bg-purple-100 text-purple-800 rounded-lg">
                  <span className="font-medium">{venue}</span>
                  <button
                    onClick={() => handleRemoveVenue(venue)}
                    disabled={venues.length === 1}
                    className="text-purple-600 hover:text-purple-800 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration spécifique aux groupes */}
          {currentTournament.format !== 'league' && (
            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center">
                <Users className="h-6 w-6 mr-2" />
                Configuration des Groupes
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-orange-800 mb-2">
                    Nombre de groupes
                  </label>
                  <input
                    type="number"
                    value={groupsCount}
                    onChange={(e) => setGroupsCount(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="8"
                    className="w-full border border-orange-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-orange-800 mb-2">
                    Équipes par groupe
                  </label>
                  <input
                    type="number"
                    value={teamsPerGroup}
                    onChange={(e) => setTeamsPerGroup(Math.max(2, parseInt(e.target.value) || 2))}
                    min="2"
                    max="6"
                    className="w-full border border-orange-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Total équipes nécessaires:</strong> {groupsCount * teamsPerGroup}
                  <br />
                  <strong>Équipes disponibles:</strong> {currentTournament.teams.length}
                </p>
              </div>
            </div>
          )}

          {/* Estimation */}
          <div className={`rounded-xl p-6 ${estimation.feasible ? 'bg-green-50' : 'bg-red-50'}`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center ${estimation.feasible ? 'text-green-900' : 'text-red-900'}`}>
              <Target className="h-6 w-6 mr-2" />
              Estimation de la Planification
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${estimation.feasible ? 'text-green-700' : 'text-red-700'}`}>
                  {estimation.estimatedMatches}
                </div>
                <div className={`text-sm ${estimation.feasible ? 'text-green-600' : 'text-red-600'}`}>
                  Matchs estimés
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${estimation.feasible ? 'text-green-700' : 'text-red-700'}`}>
                  {estimation.requiredDays}
                </div>
                <div className={`text-sm ${estimation.feasible ? 'text-green-600' : 'text-red-600'}`}>
                  Jours requis
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${estimation.feasible ? 'text-green-700' : 'text-red-700'}`}>
                  {estimation.totalDays}
                </div>
                <div className={`text-sm ${estimation.feasible ? 'text-green-600' : 'text-red-600'}`}>
                  Jours disponibles
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${estimation.feasible ? 'text-green-700' : 'text-red-700'}`}>
                  {estimation.feasible ? '✓' : '⚠'}
                </div>
                <div className={`text-sm ${estimation.feasible ? 'text-green-600' : 'text-red-600'}`}>
                  Faisabilité
                </div>
              </div>
            </div>
            
            {!estimation.feasible && (
              <div className="mt-4 p-3 bg-red-100 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-red-800 text-sm">
                  <strong>Attention:</strong> La période sélectionnée pourrait être insuffisante. 
                  Considérez augmenter le nombre de matchs par jour ou étendre la période.
                </div>
              </div>
            )}
          </div>
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
            onClick={handleGenerateMatches}
            disabled={isGenerating || currentTournament.teams.length < 2}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Génération...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>Générer les Matchs</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};