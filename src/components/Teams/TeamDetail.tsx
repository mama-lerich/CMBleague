import React, { useState } from 'react';
import { Users, Trophy, Target, Calendar, MapPin, User, ArrowLeft, Edit, Plus, Award, TrendingUp } from 'lucide-react';
import { Team, Player } from '../../types';
import { PlayerProfile } from '../Players/PlayerProfile';

interface TeamDetailProps {
  team: Team;
  onBack: () => void;
  onEdit?: () => void;
}

export const TeamDetail: React.FC<TeamDetailProps> = ({ team, onBack, onEdit }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'stats' | 'history'>('overview');

  if (selectedPlayer) {
    return (
      <PlayerProfile 
        player={selectedPlayer} 
        onBack={() => setSelectedPlayer(null)} 
      />
    );
  }

  const topScorer = team.players.sort((a, b) => b.stats.goals - a.stats.goals)[0];
  const topAssistant = team.players.sort((a, b) => b.stats.assists - a.stats.assists)[0];
  const mostExperienced = team.players.sort((a, b) => b.stats.gamesPlayed - a.stats.gamesPlayed)[0];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Team Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Points</h3>
              <p className="text-3xl font-bold mt-1">{team.stats.points}</p>
            </div>
            <Trophy className="h-12 w-12 opacity-80" />
          </div>
          <div className="mt-4 text-sm opacity-90">
            Classement actuel
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Victoires</h3>
              <p className="text-3xl font-bold mt-1">{team.stats.wins}</p>
            </div>
            <Award className="h-12 w-12 opacity-80" />
          </div>
          <div className="mt-4 text-sm opacity-90">
            Sur {team.stats.gamesPlayed} matchs
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Buts</h3>
              <p className="text-3xl font-bold mt-1">{team.stats.goalsFor}</p>
            </div>
            <Target className="h-12 w-12 opacity-80" />
          </div>
          <div className="mt-4 text-sm opacity-90">
            Différence: {team.stats.goalDifference >= 0 ? '+' : ''}{team.stats.goalDifference}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Joueurs</h3>
              <p className="text-3xl font-bold mt-1">{team.players.length}</p>
            </div>
            <Users className="h-12 w-12 opacity-80" />
          </div>
          <div className="mt-4 text-sm opacity-90">
            Effectif complet
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
            Performance de l'Équipe
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Taux de victoire</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${team.stats.gamesPlayed > 0 ? (team.stats.wins / team.stats.gamesPlayed) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="font-bold">
                  {team.stats.gamesPlayed > 0 ? Math.round((team.stats.wins / team.stats.gamesPlayed) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Efficacité offensive</span>
              <span className="font-bold">
                {team.stats.gamesPlayed > 0 ? (team.stats.goalsFor / team.stats.gamesPlayed).toFixed(1) : '0'} buts/match
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Solidité défensive</span>
              <span className="font-bold">
                {team.stats.gamesPlayed > 0 ? (team.stats.goalsAgainst / team.stats.gamesPlayed).toFixed(1) : '0'} buts encaissés/match
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Forme récente</span>
              <div className="flex space-x-1">
                {team.stats.form.slice(-5).map((result, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      result === 'W' ? 'bg-green-500' :
                      result === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Award className="h-6 w-6 text-yellow-500 mr-2" />
            Joueurs Clés
          </h3>
          
          <div className="space-y-4">
            {topScorer && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-semibold text-green-900">Meilleur buteur</div>
                  <div className="text-sm text-green-700">{topScorer.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{topScorer.stats.goals}</div>
                  <div className="text-xs text-green-600">buts</div>
                </div>
              </div>
            )}

            {topAssistant && topAssistant.stats.assists > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-semibold text-blue-900">Meilleur passeur</div>
                  <div className="text-sm text-blue-700">{topAssistant.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{topAssistant.stats.assists}</div>
                  <div className="text-xs text-blue-600">passes</div>
                </div>
              </div>
            )}

            {mostExperienced && (
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-semibold text-purple-900">Plus expérimenté</div>
                  <div className="text-sm text-purple-700">{mostExperienced.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{mostExperienced.stats.gamesPlayed}</div>
                  <div className="text-xs text-purple-600">matchs</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlayers = () => (
    <div className="space-y-6">
      {/* Players Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {team.players.map((player) => (
          <div
            key={player.id}
            className="bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedPlayer(player)}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-700">#{player.number}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 truncate">{player.name}</h3>
                  <p className="text-sm text-gray-600">{player.position}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-bold text-green-700">{player.stats.goals}</div>
                  <div className="text-green-600">Buts</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-bold text-blue-700">{player.stats.assists}</div>
                  <div className="text-blue-600">Passes</div>
                </div>
              </div>

              {player.age && (
                <div className="mt-3 text-center text-sm text-gray-600">
                  {player.age} ans • {player.nationality}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {team.players.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12">
          <div className="text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun joueur enregistré
            </h3>
            <p className="text-gray-500">
              L'effectif de cette équipe n'a pas encore été renseigné
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      {/* Detailed Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Statistiques Détaillées</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Matchs</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Joués</span>
                <span className="font-medium">{team.stats.gamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Victoires</span>
                <span className="font-medium text-green-600">{team.stats.wins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nuls</span>
                <span className="font-medium text-yellow-600">{team.stats.draws}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Défaites</span>
                <span className="font-medium text-red-600">{team.stats.losses}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Buts</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Marqués</span>
                <span className="font-medium text-green-600">{team.stats.goalsFor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Encaissés</span>
                <span className="font-medium text-red-600">{team.stats.goalsAgainst}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Différence</span>
                <span className={`font-medium ${team.stats.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {team.stats.goalDifference >= 0 ? '+' : ''}{team.stats.goalDifference}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Moy./match</span>
                <span className="font-medium">
                  {team.stats.gamesPlayed > 0 ? (team.stats.goalsFor / team.stats.gamesPlayed).toFixed(1) : '0'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Discipline</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Cartons jaunes</span>
                <span className="font-medium text-yellow-600">
                  {team.players.reduce((sum, p) => sum + p.stats.yellowCards, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cartons rouges</span>
                <span className="font-medium text-red-600">
                  {team.players.reduce((sum, p) => sum + p.stats.redCards, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fair-play</span>
                <span className="font-medium text-green-600">
                  {team.players.reduce((sum, p) => sum + p.stats.yellowCards + p.stats.redCards, 0) <= 5 ? 'Excellent' : 'Bon'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Retour aux équipes</span>
      </button>

      {/* Team Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div 
          className="p-8 text-white"
          style={{ 
            background: `linear-gradient(135deg, ${team.colors?.primary || '#16A34A'}, ${team.colors?.secondary || '#FFFFFF'}40)`
          }}
        >
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                  Groupe {team.group}
                </span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                  {team.stats.points} points
                </span>
              </div>
            </div>

            {onEdit && (
              <button
                onClick={onEdit}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Modifier</span>
              </button>
            )}
          </div>
        </div>

        {/* Team Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {team.coach && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-gray-600">Entraîneur</div>
                  <div className="font-medium">{team.coach}</div>
                </div>
              </div>
            )}
            {team.founded && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-gray-600">Fondé en</div>
                  <div className="font-medium">{team.founded}</div>
                </div>
              </div>
            )}
            {team.homeVenue && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-gray-600">Stade</div>
                  <div className="font-medium">{team.homeVenue}</div>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-gray-600">Effectif</div>
                <div className="font-medium">{team.players.length} joueurs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-6">
          {[
            { key: 'overview', label: 'Vue d\'ensemble', icon: Trophy },
            { key: 'players', label: 'Joueurs', icon: Users },
            { key: 'stats', label: 'Statistiques', icon: Target }
          ].map((tab) => {
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
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'players' && renderPlayers()}
      {activeTab === 'stats' && renderStats()}
    </div>
  );
};