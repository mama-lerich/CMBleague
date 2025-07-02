import React from 'react';
import { Users, Trophy, Target, TrendingUp } from 'lucide-react';
import { Team } from '../../types';

interface TeamCardProps {
  team: Team;
  rank: number;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, rank }) => {
  const winPercentage = team.stats.gamesPlayed > 0 
    ? Math.round((team.stats.wins / team.stats.gamesPlayed) * 100) 
    : 0;

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2: return 'bg-gray-100 text-gray-800 border-gray-300';
      case 3: return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:shadow-xl hover:border-green-200 transition-all duration-300">
      <div className="p-6">
        {/* Header with rank and team name */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full border-2 font-bold ${getRankColor(rank)}`}>
              #{rank}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
              <p className="text-sm text-gray-600">Groupe {team.group}</p>
            </div>
          </div>
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{team.stats.points}</div>
            <div className="text-sm text-green-600">Points</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">{team.stats.gamesPlayed}</div>
            <div className="text-sm text-blue-600">Matchs</div>
          </div>
        </div>

        {/* Performance indicators */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Victoires</span>
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                {team.stats.wins}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Buts pour/contre</span>
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">
                {team.stats.goalsFor}/{team.stats.goalsAgainst}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Différence de buts</span>
            <div className={`px-2 py-1 rounded text-sm font-medium ${
              team.stats.goalDifference >= 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {team.stats.goalDifference >= 0 ? '+' : ''}{team.stats.goalDifference}
            </div>
          </div>
        </div>

        {/* Win percentage bar */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Taux de victoire</span>
            <span className="text-sm font-medium text-gray-900">{winPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${winPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Team composition */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">Joueurs</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{team.players.length}</span>
          </div>
        </div>

        {/* Action button */}
        <button className="w-full mt-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
          <TrendingUp className="h-4 w-4" />
          <span>Voir l'équipe</span>
        </button>
      </div>
    </div>
  );
};