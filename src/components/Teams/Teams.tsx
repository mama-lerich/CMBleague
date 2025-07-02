import React, { useState } from 'react';
import { Users, Trophy, Filter, Search, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { TeamCard } from './TeamCard';
import { TeamDetail } from './TeamDetail';
import { Team } from '../../types';

export const Teams: React.FC = () => {
  const { currentTournament, userRole } = useApp();
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'points' | 'goals' | 'wins'>('points');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  if (!currentTournament) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Aucun tournoi sélectionné
          </h2>
          <p className="text-gray-500">
            Sélectionnez un tournoi pour voir les équipes
          </p>
        </div>
      </div>
    );
  }

  if (selectedTeam) {
    return (
      <TeamDetail 
        team={selectedTeam} 
        onBack={() => setSelectedTeam(null)}
        onEdit={userRole === 'admin' ? () => console.log('Edit team') : undefined}
      />
    );
  }

  const filteredTeams = currentTournament.teams.filter((team: Team) => {
    const matchesGroup = selectedGroup === 'all' || team.group === selectedGroup;
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.coach?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const sortedTeams = [...filteredTeams].sort((a, b) => {
    switch (sortBy) {
      case 'points':
        return b.stats.points - a.stats.points;
      case 'goals':
        return b.stats.goalDifference - a.stats.goalDifference;
      case 'wins':
        return b.stats.wins - a.stats.wins;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-7 w-7 text-green-600 mr-3" />
              Équipes du Tournoi
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredTeams.length} équipe{filteredTeams.length !== 1 ? 's' : ''} 
              {selectedGroup !== 'all' && ` dans le groupe ${selectedGroup}`}
              {searchTerm && ` correspondant à "${searchTerm}"`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-600">Classement par {sortBy === 'points' ? 'points' : sortBy === 'goals' ? 'différence de buts' : 'victoires'}</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une équipe..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Group Filter */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Tous les groupes</option>
              {currentTournament.groups.map((group) => (
                <option key={group} value={group}>
                  Groupe {group}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex space-x-2">
            {[
              { key: 'points', label: 'Points' },
              { key: 'goals', label: 'Diff. buts' },
              { key: 'wins', label: 'Victoires' }
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key as any)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  sortBy === option.key
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      {sortedTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedTeams.map((team, index) => (
            <div key={team.id} onClick={() => setSelectedTeam(team)}>
              <TeamCard team={team} rank={index + 1} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12">
          <div className="text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Aucune équipe trouvée
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `Aucune équipe ne correspond à "${searchTerm}"`
                : 'Aucune équipe ne correspond aux filtres sélectionnés'
              }
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {currentTournament.teams.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Filter className="h-6 w-6 text-blue-600 mr-2" />
            Statistiques du Tournoi
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {currentTournament.teams.length}
              </div>
              <div className="text-sm text-blue-600">Équipes totales</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {currentTournament.teams.reduce((sum, team) => sum + team.players.length, 0)}
              </div>
              <div className="text-sm text-green-600">Joueurs totaux</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                {currentTournament.teams.reduce((sum, team) => sum + team.stats.goalsFor, 0)}
              </div>
              <div className="text-sm text-orange-600">Buts marqués</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {Math.round(currentTournament.teams.reduce((sum, team) => sum + (team.stats.gamesPlayed > 0 ? (team.stats.wins / team.stats.gamesPlayed) * 100 : 0), 0) / currentTournament.teams.length)}%
              </div>
              <div className="text-sm text-purple-600">Taux victoire moyen</div>
            </div>
          </div>
        </div>
      )}

      {/* Group Standings */}
      {currentTournament.groups.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentTournament.groups.map((group) => {
            const groupTeams = currentTournament.teams
              .filter(t => t.group === group)
              .sort((a, b) => b.stats.points - a.stats.points);
            
            return (
              <div key={group} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Classement Groupe {group}
                </h3>
                
                <div className="space-y-2">
                  {groupTeams.map((team, index) => (
                    <div 
                      key={team.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedTeam(team)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{team.name}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">{team.stats.gamesPlayed} MJ</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">
                          {team.stats.points} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};