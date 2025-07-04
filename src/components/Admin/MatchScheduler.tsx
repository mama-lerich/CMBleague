import React, { useState } from 'react';
import { Calendar, Plus, X, Zap, Target, Settings } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { AdvancedMatchScheduler } from './AdvancedMatchScheduler';
import { ManualMatchCreator } from './ManualMatchCreator';

interface MatchSchedulerProps {
  onClose: () => void;
}

export const MatchScheduler: React.FC<MatchSchedulerProps> = ({ onClose }) => {
  const { currentTournament } = useApp();
  const [activeMode, setActiveMode] = useState<'auto' | 'manual' | null>(null);

  if (!currentTournament) return null;

  if (activeMode === 'auto') {
    return <AdvancedMatchScheduler onClose={() => setActiveMode(null)} />;
  }

  if (activeMode === 'manual') {
    return <ManualMatchCreator onClose={() => setActiveMode(null)} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-6 w-6 text-orange-500 mr-2" />
            Planification des Matchs
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Tournament Info */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              {currentTournament.name}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Format:</span>
                <div className="text-blue-800 font-bold">
                  {currentTournament.format === 'league' ? 'Liga/Premier League' :
                   currentTournament.format === 'world_cup' ? 'Coupe du Monde' :
                   'Ligue des Champions'}
                </div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Équipes:</span>
                <div className="text-blue-800 font-bold">{currentTournament.teams.length}</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Groupes:</span>
                <div className="text-blue-800 font-bold">{currentTournament.groups.length}</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Matchs existants:</span>
                <div className="text-blue-800 font-bold">{currentTournament.matches.length}</div>
              </div>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Automatic Scheduling */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-8 text-white cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                 onClick={() => setActiveMode('auto')}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Planification Automatique</h3>
                  <p className="text-orange-100">
                    Génération intelligente de tous les matchs selon le format du tournoi
                  </p>
                </div>
                <Zap className="h-16 w-16 opacity-80" />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Respect de l'ordre des phases</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Rotation optimale des équipes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Configuration des horaires et stades</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Respect de la période du tournoi</span>
                </div>
              </div>

              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <h4 className="font-bold mb-2">Fonctionnalités Avancées:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Matchs par jour configurables</li>
                  <li>• Heures de matchs multiples</li>
                  <li>• Gestion des stades et terrains</li>
                  <li>• Journées pour format Liga</li>
                  <li>• Phases éliminatoires automatiques</li>
                </ul>
              </div>

              <button className="w-full mt-6 bg-white bg-opacity-20 hover:bg-opacity-30 py-3 px-6 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Configurer la Planification</span>
              </button>
            </div>

            {/* Manual Creation */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                 onClick={() => setActiveMode('manual')}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Création Manuelle</h3>
                  <p className="text-blue-100">
                    Créez des matchs individuels avec un contrôle total
                  </p>
                </div>
                <Plus className="h-16 w-16 opacity-80" />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Sélection libre des équipes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Date et heure personnalisées</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Choix du stade et arbitre</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Matchs amicaux et spéciaux</span>
                </div>
              </div>

              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <h4 className="font-bold mb-2">Idéal pour :</h4>
                <ul className="text-sm space-y-1">
                  <li>• Matchs de rattrapage</li>
                  <li>• Rencontres amicales</li>
                  <li>• Ajustements de calendrier</li>
                  <li>• Matchs de barrage</li>
                  <li>• Événements spéciaux</li>
                </ul>
              </div>

              <button className="w-full mt-6 bg-white bg-opacity-20 hover:bg-opacity-30 py-3 px-6 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Créer un Match</span>
              </button>
            </div>
          </div>

          {/* Current Matches Summary */}
          {currentTournament.matches.length > 0 && (
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 text-gray-600 mr-2" />
                Matchs Actuels
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentTournament.matches.filter(m => m.status === 'upcoming').length}
                  </div>
                  <div className="text-sm text-gray-600">À venir</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {currentTournament.matches.filter(m => m.status === 'live').length}
                  </div>
                  <div className="text-sm text-gray-600">En direct</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {currentTournament.matches.filter(m => m.status === 'finished').length}
                  </div>
                  <div className="text-sm text-gray-600">Terminés</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {currentTournament.matches.length}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
            </div>
          )}

          {/* Format-specific Information */}
          <div className="mt-8 bg-yellow-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-yellow-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Informations sur le Format {currentTournament.format === 'league' ? 'Liga' : currentTournament.format === 'world_cup' ? 'Coupe du Monde' : 'Ligue des Champions'}
            </h3>
            
            {currentTournament.format === 'league' && (
              <div className="text-yellow-800">
                <p className="mb-2"><strong>Format Liga/Premier League :</strong></p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Toutes les équipes se rencontrent en matchs aller-retour</li>
                  <li>Chaque équipe joue {(currentTournament.teams.length - 1) * 2} matchs au total</li>
                  <li>3 points pour une victoire, 1 point pour un nul</li>
                  <li>L'équipe avec le plus de points remporte le championnat</li>
                </ul>
              </div>
            )}

            {currentTournament.format === 'world_cup' && (
              <div className="text-yellow-800">
                <p className="mb-2"><strong>Format Coupe du Monde :</strong></p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Phase de groupes : chaque équipe joue contre les autres de son groupe</li>
                  <li>Les 2 meilleures équipes de chaque groupe se qualifient</li>
                  <li>Phases éliminatoires : huitièmes, quarts, demi-finales, finale</li>
                  <li>Matchs à élimination directe (prolongations et tirs au but si nécessaire)</li>
                </ul>
              </div>
            )}

            {currentTournament.format === 'champions_league' && (
              <div className="text-yellow-800">
                <p className="mb-2"><strong>Format Ligue des Champions :</strong></p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Phase de groupes avec matchs aller-retour</li>
                  <li>Phases éliminatoires avec matchs aller-retour</li>
                  <li>Règle des buts à l'extérieur en cas d'égalité</li>
                  <li>Finale sur terrain neutre</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};