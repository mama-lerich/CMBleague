import React, { useState } from 'react';
import { BarChart3, Trophy, Target, Users, Medal, TrendingUp } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const Statistics: React.FC = () => {
  const { currentTournament } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'teams'>('overview');

  if (!currentTournament) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Aucun tournoi sélectionné
          </h2>
          <p className="text-gray-500">
            Sélectionnez un tournoi pour voir les statistiques
          </p>
        </div>
      </div>
    );
  }

  const allPlayers = currentTournament.teams.flatMap(team => team.players);
  const totalGoals = allPlayers.reduce((sum, player) => sum + player.stats.goals, 0);
  const totalAssists = allPlayers.reduce((sum, player) => sum + player.stats.assists, 0);
  const totalYellowCards = allPlayers.reduce((sum, player) => sum + player.stats.yellowCards, 0);
  const totalRedCards = allPlayers.reduce((sum, player) => sum + player.stats.redCards, 0);

  const topScorers = allPlayers
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 10);

  const topAssistants = allPlayers
    .sort((a, b) => b.stats.assists - a.stats.assists)
    .slice(0, 10);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Buts Totaux</h3>
              <p className="text-3xl font-bold mt-1">{totalGoals}</p>
            </div>
            <Target className="h-12 w-12 opacity-80" />
          </div>
          <div className="mt-4 text-sm opacity-90">
            Moyenne: {currentTournament.matches.filter(m => m.status === 'finished').length > 0 
              ? (totalGoals / currentTournament.matches.filter(m => m.status === 'finished').length).toFixed(1) 
              : '0'} buts/match
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Passes Décisives</h3>
              <p className="text-3xl font-bold mt-1">{totalAssists}</p>
            </div>
            <TrendingUp className="h-12 w-12 opacity-80" />
          </div>
          <div className="mt-4 text-sm opacity-90">
            Par {allPlayers.length} joueurs
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Cartons Jaunes</h3>
              <p className="text-3xl font-bold mt-1">{totalYellowCards}</p>
            </div>
            <div className="h-12 w-8 bg-yellow-400 rounded opacity-80"></div>
          </div>
          <div className="mt-4 text-sm opacity-90">
            Fair-play en cours
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Cartons Rouges</h3>
              <p className="text-3xl font-bold mt-1">{totalRedCards}</p>
            </div>
            <div className="h-12 w-8 bg-red-400 rounded opacity-80"></div>
          </div>
          <div className="mt-4 text-sm opacity-90">
            Exclusions directes
          </div>
        </div>
      </div>

      {/* Tournament Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
            Progression du Tournoi
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Matchs joués</span>
              <span className="font-bold">
                {currentTournament.matches.filter(m => m.status === 'finished').length} / {currentTournament.matches.length}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(currentTournament.matches.filter(m => m.status === 'finished').length / currentTournament.matches.length) * 100}%` 
                }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-700">
                  {currentTournament.matches.filter(m => m.status === 'upcoming').length}
                </div>
                <div className="text-sm text-blue-600">À venir</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-700">
                  {currentTournament.matches.filter(m => m.status === 'live').length}
                </div>
                <div className="text-sm text-red-600">En direct</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Users className="h-6 w-6 text-blue-500 mr-2" />
            Répartition par Groupe
          </h3>
          
          <div className="space-y-3">
            {currentTournament.groups.map((group) => {
              const groupTeams = currentTournament.teams.filter(t => t.group === group);
              return (
                <div key={group} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                      {group}
                    </div>
                    <span className="font-medium">Groupe {group}</span>
                  </div>
                  <span className="text-gray-600">
                    {groupTeams.length} équipe{groupTeams.length !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlayers = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Scorers */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Target className="h-6 w-6 text-green-500 mr-2" />
          Meilleurs Buteurs
        </h3>
        
        <div className="space-y-3">
          {topScorers.map((player, index) => (
            <div key={player.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-sm text-gray-600">#{player.number} • {player.position}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-green-600">{player.stats.goals}</div>
                <div className="text-xs text-gray-500">buts</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Assistants */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
          Meilleurs Passeurs
        </h3>
        
        <div className="space-y-3">
          {topAssistants.map((player, index) => (
            <div key={player.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-sm text-gray-600">#{player.number} • {player.position}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-blue-600">{player.stats.assists}</div>
                <div className="text-xs text-gray-500">passes</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTeams = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Medal className="h-6 w-6 text-purple-500 mr-2" />
        Classement Général
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Pos</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Équipe</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">MJ</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">V</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">N</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">D</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">BP</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">BC</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Diff</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Pts</th>
            </tr>
          </thead>
          <tbody>
            {currentTournament.teams
              .sort((a, b) => b.stats.points - a.stats.points)
              .map((team, index) => (
                <tr key={team.id} className={`border-b border-gray-100 ${index < 3 ? 'bg-green-50' : ''}`}>
                  <td className="py-3 px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold">{team.name}</div>
                    <div className="text-sm text-gray-600">Groupe {team.group}</div>
                  </td>
                  <td className="text-center py-3 px-4">{team.stats.gamesPlayed}</td>
                  <td className="text-center py-3 px-4 text-green-600 font-medium">{team.stats.wins}</td>
                  <td className="text-center py-3 px-4 text-gray-600">{team.stats.draws}</td>
                  <td className="text-center py-3 px-4 text-red-600 font-medium">{team.stats.losses}</td>
                  <td className="text-center py-3 px-4">{team.stats.goalsFor}</td>
                  <td className="text-center py-3 px-4">{team.stats.goalsAgainst}</td>
                  <td className={`text-center py-3 px-4 font-medium ${
                    team.stats.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {team.stats.goalDifference >= 0 ? '+' : ''}{team.stats.goalDifference}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">
                      {team.stats.points}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-7 w-7 text-purple-600 mr-3" />
              Statistiques du Tournoi
            </h1>
            <p className="text-gray-600 mt-1">
              Données complètes du {currentTournament.name}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {[
            { key: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { key: 'players', label: 'Joueurs', icon: Users },
            { key: 'teams', label: 'Équipes', icon: Trophy }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-purple-600 text-white shadow-lg'
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
      {activeTab === 'teams' && renderTeams()}
    </div>
  );
};