import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Target, Calendar, Trophy, Award, AlertCircle, Download, Filter } from 'lucide-react';
import { Tournament, Team, Player } from '../../types';

interface TournamentAnalyticsProps {
  tournament: Tournament;
}

export const TournamentAnalytics: React.FC<TournamentAnalyticsProps> = ({ tournament }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'week' | 'month'>('all');
  const [selectedMetric, setSelectedMetric] = useState<'goals' | 'cards' | 'attendance'>('goals');

  const allPlayers = tournament.teams.flatMap(team => team.players);
  const finishedMatches = tournament.matches.filter(m => m.status === 'finished');
  const upcomingMatches = tournament.matches.filter(m => m.status === 'upcoming');
  const liveMatches = tournament.matches.filter(m => m.status === 'live');

  // Calculate advanced statistics
  const totalGoals = allPlayers.reduce((sum, player) => sum + player.stats.goals, 0);
  const totalAssists = allPlayers.reduce((sum, player) => sum + player.stats.assists, 0);
  const totalCards = allPlayers.reduce((sum, player) => sum + player.stats.yellowCards + player.stats.redCards, 0);
  const averageGoalsPerMatch = finishedMatches.length > 0 ? (totalGoals / finishedMatches.length).toFixed(1) : '0';
  
  const topScorer = allPlayers.sort((a, b) => b.stats.goals - a.stats.goals)[0];
  const topAssistant = allPlayers.sort((a, b) => b.stats.assists - a.stats.assists)[0];
  const fairPlayTeam = tournament.teams.sort((a, b) => {
    const aCards = a.players.reduce((sum, p) => sum + p.stats.yellowCards + p.stats.redCards, 0);
    const bCards = b.players.reduce((sum, p) => sum + p.stats.yellowCards + p.stats.redCards, 0);
    return aCards - bCards;
  })[0];

  // Progress calculation
  const progressPercentage = tournament.matches.length > 0 ? (finishedMatches.length / tournament.matches.length) * 100 : 0;

  // Goals per team with enhanced metrics
  const teamAnalytics = tournament.teams.map(team => {
    const teamGoals = team.players.reduce((sum, player) => sum + player.stats.goals, 0);
    const teamAssists = team.players.reduce((sum, player) => sum + player.stats.assists, 0);
    const teamCards = team.players.reduce((sum, player) => sum + player.stats.yellowCards + player.stats.redCards, 0);
    const teamMatches = finishedMatches.filter(m => m.homeTeam.id === team.id || m.awayTeam.id === team.id);
    
    return {
      ...team,
      analytics: {
        goals: teamGoals,
        assists: teamAssists,
        cards: teamCards,
        matchesPlayed: teamMatches.length,
        avgGoalsPerMatch: teamMatches.length > 0 ? (teamGoals / teamMatches.length).toFixed(1) : '0',
        efficiency: team.stats.gamesPlayed > 0 ? ((team.stats.wins / team.stats.gamesPlayed) * 100).toFixed(1) : '0'
      }
    };
  }).sort((a, b) => b.analytics.goals - a.analytics.goals);

  // Performance trends
  const getPerformanceTrend = () => {
    const recentMatches = finishedMatches.slice(-5);
    const goals = recentMatches.reduce((sum, match) => sum + (match.score?.home || 0) + (match.score?.away || 0), 0);
    return recentMatches.length > 0 ? (goals / recentMatches.length).toFixed(1) : '0';
  };

  const exportAnalytics = () => {
    const data = {
      tournament: tournament.name,
      period: new Date().toISOString(),
      overview: {
        totalTeams: tournament.teams.length,
        totalPlayers: allPlayers.length,
        totalMatches: tournament.matches.length,
        finishedMatches: finishedMatches.length,
        totalGoals,
        totalAssists,
        totalCards,
        averageGoalsPerMatch
      },
      topPerformers: {
        topScorer: topScorer ? { name: topScorer.name, goals: topScorer.stats.goals } : null,
        topAssistant: topAssistant ? { name: topAssistant.name, assists: topAssistant.stats.assists } : null,
        fairPlayTeam: fairPlayTeam ? { name: fairPlayTeam.name } : null
      },
      teamAnalytics: teamAnalytics.map(team => ({
        name: team.name,
        group: team.group,
        points: team.stats.points,
        goals: team.analytics.goals,
        efficiency: team.analytics.efficiency
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${tournament.name.replace(/\s+/g, '_')}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-6 w-6 text-purple-500 mr-2" />
              Analyses Avancées du Tournoi
            </h2>
            <p className="text-gray-600 mt-1">
              Statistiques détaillées et tendances de performance
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Toute la période</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
            </select>

            <button
              onClick={exportAnalytics}
              className="flex items-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'goals', label: 'Buts', icon: Target },
            { key: 'cards', label: 'Cartons', icon: AlertCircle },
            { key: 'attendance', label: 'Affluence', icon: Users }
          ].map(filter => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.key}
                onClick={() => setSelectedMetric(filter.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedMetric === filter.key
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Progression</h3>
              <p className="text-3xl font-bold mt-1">{progressPercentage.toFixed(0)}%</p>
            </div>
            <TrendingUp className="h-12 w-12 opacity-80" />
          </div>
          <div className="mt-4">
            <div className="bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm opacity-90 mt-2">
              {finishedMatches.length} / {tournament.matches.length} matchs joués
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Buts Totaux</h3>
              <p className="text-3xl font-bold mt-1">{totalGoals}</p>
            </div>
            <Target className="h-12 w-12 opacity-80" />
          </div>
          <div className="mt-4 text-sm opacity-90">
            Moyenne: {averageGoalsPerMatch} buts/match
            <br />
            Tendance: {getPerformanceTrend()} (5 derniers)
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Joueurs Actifs</h3>
              <p className="text-3xl font-bold mt-1">{allPlayers.length}</p>
            </div>
            <Users className="h-12 w-12 opacity-80" />
          </div>
          <div className="mt-4 text-sm opacity-90">
            Répartis en {tournament.teams.length} équipes
            <br />
            Moy: {(allPlayers.length / tournament.teams.length).toFixed(1)} joueurs/équipe
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Fair-Play</h3>
              <p className="text-3xl font-bold mt-1">{totalCards}</p>
            </div>
            <Award className="h-12 w-12 opacity-80" />
          </div>
          <div className="mt-4 text-sm opacity-90">
            Cartons distribués
            <br />
            Moy: {finishedMatches.length > 0 ? (totalCards / finishedMatches.length).toFixed(1) : '0'} cartons/match
          </div>
        </div>
      </div>

      {/* Performance Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
            Meilleur Buteur
          </h3>
          {topScorer ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-yellow-600">#{topScorer.number}</span>
              </div>
              <h4 className="font-bold text-gray-900">{topScorer.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{topScorer.position}</p>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-600">{topScorer.stats.goals}</div>
                <div className="text-sm text-yellow-700">buts marqués</div>
                <div className="text-xs text-yellow-600 mt-1">
                  {topScorer.stats.gamesPlayed > 0 ? (topScorer.stats.goals / topScorer.stats.gamesPlayed).toFixed(1) : '0'} buts/match
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Aucun but marqué</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
            Meilleur Passeur
          </h3>
          {topAssistant && topAssistant.stats.assists > 0 ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">#{topAssistant.number}</span>
              </div>
              <h4 className="font-bold text-gray-900">{topAssistant.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{topAssistant.position}</p>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{topAssistant.stats.assists}</div>
                <div className="text-sm text-blue-700">passes décisives</div>
                <div className="text-xs text-blue-600 mt-1">
                  {topAssistant.stats.gamesPlayed > 0 ? (topAssistant.stats.assists / topAssistant.stats.gamesPlayed).toFixed(1) : '0'} passes/match
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Aucune passe décisive</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 text-green-500 mr-2" />
            Fair-Play
          </h3>
          {fairPlayTeam ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900">{fairPlayTeam.name}</h4>
              <p className="text-sm text-gray-600 mb-2">Équipe la plus fair-play</p>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">
                  {fairPlayTeam.players.reduce((sum, p) => sum + p.stats.yellowCards + p.stats.redCards, 0)}
                </div>
                <div className="text-sm text-green-700">cartons reçus</div>
                <div className="text-xs text-green-600 mt-1">
                  Groupe {fairPlayTeam.group}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Données insuffisantes</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Team Performance Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
          Performance Détaillée des Équipes
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Équipe</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Buts</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Passes</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Efficacité</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Fair-Play</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Moy/Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teamAnalytics.map((team, index) => (
                <tr key={team.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{team.name}</div>
                        <div className="text-sm text-gray-600">Groupe {team.group}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="font-bold text-green-600">{team.analytics.goals}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="font-bold text-blue-600">{team.analytics.assists}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`font-bold ${
                      parseFloat(team.analytics.efficiency) >= 70 ? 'text-green-600' :
                      parseFloat(team.analytics.efficiency) >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {team.analytics.efficiency}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-3 h-4 bg-yellow-400 rounded"></div>
                      <span className="text-sm">{team.players.reduce((sum, p) => sum + p.stats.yellowCards, 0)}</span>
                      <div className="w-3 h-4 bg-red-500 rounded ml-2"></div>
                      <span className="text-sm">{team.players.reduce((sum, p) => sum + p.stats.redCards, 0)}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="font-medium text-gray-900">{team.analytics.avgGoalsPerMatch}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Match Status Overview with Enhanced Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
          État Détaillé des Matchs
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="text-4xl font-bold text-green-600 mb-2">{finishedMatches.length}</div>
            <div className="text-lg font-medium text-green-700 mb-2">Matchs terminés</div>
            <div className="text-sm text-green-600">
              {tournament.matches.length > 0 ? ((finishedMatches.length / tournament.matches.length) * 100).toFixed(0) : 0}% du tournoi
            </div>
            <div className="mt-3 text-xs text-green-600">
              {totalGoals} buts marqués au total
            </div>
          </div>
          
          <div className="text-center p-6 bg-red-50 rounded-lg">
            <div className="text-4xl font-bold text-red-600 mb-2">{liveMatches.length}</div>
            <div className="text-lg font-medium text-red-700 mb-2">Matchs en cours</div>
            <div className="text-sm text-red-600">
              {liveMatches.length > 0 ? 'Action en direct' : 'Aucun match live'}
            </div>
            <div className="mt-3 text-xs text-red-600">
              Suivi temps réel disponible
            </div>
          </div>
          
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">{upcomingMatches.length}</div>
            <div className="text-lg font-medium text-blue-700 mb-2">Matchs à venir</div>
            <div className="text-sm text-blue-600">
              Programmés prochainement
            </div>
            <div className="mt-3 text-xs text-blue-600">
              {upcomingMatches.length > 0 ? 
                `Prochain: ${upcomingMatches[0]?.date.toLocaleDateString('fr-FR')}` : 
                'Calendrier complet'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};