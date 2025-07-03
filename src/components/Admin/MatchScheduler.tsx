import React, { useState } from 'react';
import { Calendar, Plus, X, Save, Shuffle, AlertCircle, Check, Target, Clock, MapPin } from 'lucide-react';
import { Match, Team } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { generateMatches } from '../../utils/matchGenerator';

interface MatchSchedulerProps {
  onClose: () => void;
}

export const MatchScheduler: React.FC<MatchSchedulerProps> = ({ onClose }) => {
  const { currentTournament, setCurrentTournament, tournaments, setTournaments } = useApp();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!currentTournament) return null;

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleGenerateMatches = async () => {
    if (currentTournament.teams.length < 2) {
      alert('Vous devez avoir au moins 2 équipes pour générer des matchs');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir générer automatiquement tous les matchs ? Cela remplacera les matchs existants.')) {
      setIsGenerating(true);
      
      try {
        // Générer les matchs selon le format du tournoi
        const generatedMatches = generateMatches({
          teams: currentTournament.teams,
          format: currentTournament.format,
          startDate: currentTournament.startDate,
          venues: ['Stade Municipal', 'Terrain Central', 'Stade des Jeunes', 'Complexe Sportif']
        });

        const updatedTournament = {
          ...currentTournament,
          matches: generatedMatches
        };

        setCurrentTournament(updatedTournament);
        setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
        
        showSuccessMessage();
      } catch (error) {
        console.error('Erreur lors de la génération des matchs:', error);
        alert('Erreur lors de la génération des matchs');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleDeleteAllMatches = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les matchs ? Cette action est irréversible.')) {
      const updatedTournament = {
        ...currentTournament,
        matches: []
      };

      setCurrentTournament(updatedTournament);
      setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
      showSuccessMessage();
    }
  };

  const getFormatDescription = () => {
    switch (currentTournament.format) {
      case 'league':
        return 'Format Liga : Tous les matchs aller-retour entre toutes les équipes';
      case 'world_cup':
        return 'Format Coupe du Monde : Phase de groupes + phases éliminatoires';
      case 'champions_league':
        return 'Format Ligue des Champions : Phase de groupes + phases éliminatoires avec matchs aller-retour';
      default:
        return 'Format personnalisé';
    }
  };

  const getExpectedMatchCount = () => {
    const teamCount = currentTournament.teams.length;
    
    switch (currentTournament.format) {
      case 'league':
        // Tous contre tous, aller-retour
        return teamCount * (teamCount - 1);
      case 'world_cup':
        // Phase de groupes + phases éliminatoires
        const groupMatches = Math.floor(teamCount / 4) * 6; // 6 matchs par groupe de 4
        const knockoutMatches = teamCount - 1; // Approximation
        return groupMatches + knockoutMatches;
      case 'champions_league':
        // Phase de groupes (aller-retour) + phases éliminatoires (aller-retour)
        const groupMatchesChampions = Math.floor(teamCount / 4) * 12; // 12 matchs par groupe de 4 (aller-retour)
        const knockoutMatchesChampions = (teamCount / 2) * 2; // Approximation avec aller-retour
        return groupMatchesChampions + knockoutMatchesChampions;
      default:
        return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 z-10">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Opération réussie !</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-6 w-6 text-orange-500 mr-2" />
            Planification Automatique des Matchs
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tournament Info */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
              <Target className="h-6 w-6 mr-2" />
              Informations du Tournoi
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Configuration Actuelle</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <div><strong>Nom:</strong> {currentTournament.name}</div>
                  <div><strong>Format:</strong> {currentTournament.formatConfig?.name || currentTournament.format}</div>
                  <div><strong>Équipes:</strong> {currentTournament.teams.length}</div>
                  <div><strong>Groupes:</strong> {currentTournament.groups.length}</div>
                  <div><strong>Matchs existants:</strong> {currentTournament.matches.length}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Prévisions</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <div><strong>Matchs attendus:</strong> ~{getExpectedMatchCount()}</div>
                  <div><strong>Durée estimée:</strong> {Math.ceil(getExpectedMatchCount() / 7)} semaines</div>
                  <div><strong>Début:</strong> {currentTournament.startDate.toLocaleDateString('fr-FR')}</div>
                  <div><strong>Fin prévue:</strong> {currentTournament.endDate.toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Description du format:</strong> {getFormatDescription()}
              </p>
            </div>
          </div>

          {/* Format Details */}
          {currentTournament.formatConfig && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Shuffle className="h-6 w-6 text-purple-500 mr-2" />
                Phases du Tournoi
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentTournament.formatConfig.phases.map((phase, index) => (
                  <div key={phase.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <h4 className="font-semibold text-gray-900">{phase.name}</h4>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Type:</strong> {phase.type}</div>
                      <div><strong>Format:</strong> {phase.format}</div>
                      {phase.teamsAdvancing && (
                        <div><strong>Qualifiés:</strong> {phase.teamsAdvancing} équipes</div>
                      )}
                      {phase.homeAndAway && (
                        <div className="text-green-600"><strong>Aller-retour</strong></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Matches Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="h-6 w-6 text-green-500 mr-2" />
              État Actuel des Matchs
            </h3>
            
            {currentTournament.matches.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">
                      {currentTournament.matches.filter(m => m.status === 'upcoming').length}
                    </div>
                    <div className="text-sm text-blue-600">À venir</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-700">
                      {currentTournament.matches.filter(m => m.status === 'live').length}
                    </div>
                    <div className="text-sm text-red-600">En cours</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      {currentTournament.matches.filter(m => m.status === 'finished').length}
                    </div>
                    <div className="text-sm text-green-600">Terminés</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700">
                      {currentTournament.matches.length}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>

                {/* Recent matches preview */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Derniers matchs créés :</h4>
                  <div className="space-y-2">
                    {currentTournament.matches.slice(-5).map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {match.homeTeam.name} vs {match.awayTeam.name}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {match.date.toLocaleDateString('fr-FR')} • {match.round}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">
                  Aucun match programmé
                </h4>
                <p className="text-gray-500">
                  Utilisez la génération automatique pour créer le calendrier complet
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Actions Disponibles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleGenerateMatches}
                disabled={isGenerating || currentTournament.teams.length < 2}
                className="flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-4 rounded-lg font-medium transition-colors"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Génération en cours...</span>
                  </>
                ) : (
                  <>
                    <Shuffle className="h-5 w-5" />
                    <span>Générer Automatiquement</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDeleteAllMatches}
                disabled={currentTournament.matches.length === 0}
                className="flex items-center justify-center space-x-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white p-4 rounded-lg font-medium transition-colors"
              >
                <X className="h-5 w-5" />
                <span>Supprimer Tous les Matchs</span>
              </button>
            </div>

            {/* Warnings */}
            <div className="mt-4 space-y-2">
              {currentTournament.teams.length < 2 && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800 text-sm">
                    Vous devez avoir au moins 2 équipes pour générer des matchs
                  </span>
                </div>
              )}

              {currentTournament.matches.length > 0 && (
                <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="text-orange-800 text-sm">
                    La génération automatique remplacera tous les matchs existants
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Format Features */}
          {currentTournament.formatConfig && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Caractéristiques du Format {currentTournament.formatConfig.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Avantages :</h4>
                  <ul className="space-y-1">
                    {currentTournament.formatConfig.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Recommandations :</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Équipes recommandées:</strong> {currentTournament.formatConfig.recommendedTeams.join(', ')}</div>
                    <div><strong>Équipes actuelles:</strong> {currentTournament.teams.length}</div>
                    <div><strong>Statut:</strong> 
                      <span className={`ml-1 font-medium ${
                        currentTournament.formatConfig.recommendedTeams.includes(currentTournament.teams.length)
                          ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {currentTournament.formatConfig.recommendedTeams.includes(currentTournament.teams.length)
                          ? 'Optimal' : 'Acceptable'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};