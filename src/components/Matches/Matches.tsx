import React, { useState } from 'react';
import { Calendar, Filter, Search, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { MatchCard } from './MatchCard';
import { MatchDetail } from './MatchDetail';
import { Match } from '../../types';

export const Matches: React.FC = () => {
  const { currentTournament, userRole } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'live' | 'finished'>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  if (!currentTournament) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Aucun tournoi sélectionné
          </h2>
          <p className="text-gray-500">
            Sélectionnez un tournoi pour voir les matchs
          </p>
        </div>
      </div>
    );
  }

  if (selectedMatch) {
    return (
      <MatchDetail 
        match={selectedMatch} 
        onBack={() => setSelectedMatch(null)}
        onEdit={userRole === 'admin' ? () => console.log('Edit match') : undefined}
      />
    );
  }

  const filteredMatches = currentTournament.matches.filter((match: Match) => {
    const statusFilter = selectedFilter === 'all' || match.status === selectedFilter;
    const groupFilter = selectedGroup === 'all' || match.group === selectedGroup;
    const searchFilter = searchTerm === '' || 
      match.homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.venue.toLowerCase().includes(searchTerm.toLowerCase());
    return statusFilter && groupFilter && searchFilter;
  });

  const statusCounts = {
    all: currentTournament.matches.length,
    upcoming: currentTournament.matches.filter(m => m.status === 'upcoming').length,
    live: currentTournament.matches.filter(m => m.status === 'live').length,
    finished: currentTournament.matches.filter(m => m.status === 'finished').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-7 w-7 text-blue-600 mr-3" />
              Matchs du Tournoi
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredMatches.length} match{filteredMatches.length !== 1 ? 's' : ''} 
              {selectedFilter !== 'all' && ` ${selectedFilter === 'upcoming' ? 'à venir' : selectedFilter === 'live' ? 'en direct' : 'terminé'}`}
              {searchTerm && ` correspondant à "${searchTerm}"`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">Filtres actifs</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un match..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Group Filter */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les groupes</option>
              {currentTournament.groups.map((group) => (
                <option key={group} value={group}>
                  Groupe {group}
                </option>
              ))}
            </select>
          </div>

          {/* Add Match Button for Admin */}
          {userRole === 'admin' && (
            <button className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg transition-colors">
              <Plus className="h-4 w-4" />
              <span>Nouveau Match</span>
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Tous', count: statusCounts.all },
            { key: 'upcoming', label: 'À venir', count: statusCounts.upcoming },
            { key: 'live', label: 'En direct', count: statusCounts.live },
            { key: 'finished', label: 'Terminés', count: statusCounts.finished }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedFilter === filter.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Live Matches Alert */}
      {statusCounts.live > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div className="ml-3">
              <p className="text-red-800 font-medium">
                🔴 {statusCounts.live} match{statusCounts.live > 1 ? 's' : ''} en direct actuellement
              </p>
              <p className="text-red-700 text-sm mt-1">
                Cliquez sur un match en direct pour voir les détails en temps réel
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Matches Grid */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMatches
            .sort((a, b) => {
              // Sort by status priority (live first, then upcoming, then finished)
              const statusPriority = { live: 0, upcoming: 1, finished: 2 };
              const aPriority = statusPriority[a.status] || 3;
              const bPriority = statusPriority[b.status] || 3;
              
              if (aPriority !== bPriority) {
                return aPriority - bPriority;
              }
              
              // Then sort by date
              return a.date.getTime() - b.date.getTime();
            })
            .map((match) => (
              <div key={match.id} onClick={() => setSelectedMatch(match)}>
                <MatchCard match={match} />
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12">
          <div className="text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun match trouvé
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `Aucun match ne correspond à "${searchTerm}"`
                : 'Aucun match ne correspond aux filtres sélectionnés'
              }
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {currentTournament.matches.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Filter className="h-6 w-6 text-blue-600 mr-2" />
            Statistiques des Matchs
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {currentTournament.matches.length}
              </div>
              <div className="text-sm text-blue-600">Total matchs</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {Math.round((statusCounts.finished / currentTournament.matches.length) * 100)}%
              </div>
              <div className="text-sm text-green-600">Progression</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                {currentTournament.matches
                  .filter(m => m.score)
                  .reduce((sum, m) => sum + (m.score?.home || 0) + (m.score?.away || 0), 0)}
              </div>
              <div className="text-sm text-orange-600">Buts marqués</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {statusCounts.finished > 0 
                  ? (currentTournament.matches
                      .filter(m => m.score)
                      .reduce((sum, m) => sum + (m.score?.home || 0) + (m.score?.away || 0), 0) / statusCounts.finished).toFixed(1)
                  : '0'
                }
              </div>
              <div className="text-sm text-purple-600">Buts/match</div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Matches Today */}
      {statusCounts.upcoming > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Prochains Matchs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentTournament.matches
              .filter(m => m.status === 'upcoming')
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 6)
              .map((match) => (
                <div 
                  key={match.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="font-medium text-gray-900 mb-2">
                    {match.homeTeam.name} vs {match.awayTeam.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {match.date.toLocaleDateString('fr-FR')} à {match.date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                  </div>
                  <div className="text-xs text-gray-500">
                    {match.venue} • {match.round}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};