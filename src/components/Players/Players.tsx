import React, { useState } from 'react';
import { Users, Search, Filter, Target, Award, TrendingUp } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { PlayerCard } from './PlayerCard';
import { PlayerProfile } from './PlayerProfile';
import { Player } from '../../types';

export const Players: React.FC = () => {
  const { currentTournament } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'goals' | 'assists' | 'games'>('goals');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  if (!currentTournament) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Aucun tournoi sélectionné
          </h2>
          <p className="text-gray-500">
            Sélectionnez un tournoi pour voir les joueurs
          </p>
        </div>
      </div>
    );
  }

  if (selectedPlayer) {
    return (
      <PlayerProfile 
        player={selectedPlayer} 
        onBack={() => setSelectedPlayer(null)} 
      />
    );
  }

  const allPlayers = currentTournament.teams.flatMap(team => 
    team.players.map(player => ({ ...player, teamName: team.name }))
  );

  const filteredPlayers = allPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.number.toString().includes(searchTerm) ||
                         player.teamName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = selectedTeam === 'all' || currentTournament.teams.find(t => t.name === player.teamName)?.id === selectedTeam;
    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
    
    return matchesSearch && matchesTeam && matchesPosition;
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'goals':
        return b.stats.goals - a.stats.goals;
      case 'assists':
        return b.stats.assists - a.stats.assists;
      case 'games':
        return b.stats.gamesPlayed - a.stats.gamesPlayed;
      default:
        return 0;
    }
  });

  const positions = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant', 'Ailier'];
  const topScorer = allPlayers.sort((a, b) => b.stats.goals - a.stats.goals)[0];
  const topAssistant = allPlayers.sort((a, b) => b.stats.assists - a.stats.assists)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-7 w-7 text-purple-600 mr-3" />
              Joueurs du Tournoi
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredPlayers.length} joueur{filteredPlayers.length !== 1 ? 's' : ''} 
              {searchTerm && ` correspondant à "${searchTerm}"`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              Trié par {sortBy === 'goals' ? 'buts' : sortBy === 'assists' ? 'passes' : sortBy === 'games' ? 'matchs' : 'nom'}
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un joueur..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Toutes les équipes</option>
            {currentTournament.teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>

          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tous les postes</option>
            {positions.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="goals">Trier par buts</option>
            <option value="assists">Trier par passes</option>
            <option value="games">Trier par matchs</option>
            <option value="name">Trier par nom</option>
          </select>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topScorer && (
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Meilleur Buteur</h3>
                <p className="text-2xl font-bold mt-1">{topScorer.name}</p>
                <p className="text-sm opacity-90 mt-1">#{topScorer.number} • {topScorer.position}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{topScorer.stats.goals}</div>
                <div className="text-sm opacity-90">buts</div>
              </div>
            </div>
            <button
              onClick={() => setSelectedPlayer(topScorer)}
              className="mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Voir le profil
            </button>
          </div>
        )}

        {topAssistant && topAssistant.stats.assists > 0 && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Meilleur Passeur</h3>
                <p className="text-2xl font-bold mt-1">{topAssistant.name}</p>
                <p className="text-sm opacity-90 mt-1">#{topAssistant.number} • {topAssistant.position}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{topAssistant.stats.assists}</div>
                <div className="text-sm opacity-90">passes</div>
              </div>
            </div>
            <button
              onClick={() => setSelectedPlayer(topAssistant)}
              className="mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Voir le profil
            </button>
          </div>
        )}
      </div>

      {/* Players Grid */}
      {sortedPlayers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              teamName={player.teamName}
              onClick={() => setSelectedPlayer(player)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12">
          <div className="text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun joueur trouvé
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `Aucun joueur ne correspond à "${searchTerm}"`
                : 'Aucun joueur ne correspond aux filtres sélectionnés'
              }
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {allPlayers.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Award className="h-6 w-6 text-yellow-500 mr-2" />
            Statistiques des Joueurs
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {allPlayers.length}
              </div>
              <div className="text-sm text-purple-600">Joueurs totaux</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {allPlayers.reduce((sum, p) => sum + p.stats.goals, 0)}
              </div>
              <div className="text-sm text-green-600">Buts marqués</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {allPlayers.reduce((sum, p) => sum + p.stats.assists, 0)}
              </div>
              <div className="text-sm text-blue-600">Passes décisives</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                {Math.round(allPlayers.reduce((sum, p) => sum + p.stats.goals, 0) / allPlayers.length * 10) / 10}
              </div>
              <div className="text-sm text-orange-600">Buts/joueur</div>
            </div>
          </div>
        </div>
      )}

      {/* Position Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
          Répartition par Poste
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {positions.map(position => {
            const count = allPlayers.filter(p => p.position === position).length;
            const percentage = allPlayers.length > 0 ? (count / allPlayers.length) * 100 : 0;
            
            return (
              <div key={position} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 mb-2">{position}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(0)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};