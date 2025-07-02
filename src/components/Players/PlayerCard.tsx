import React from 'react';
import { User, Target, TrendingUp, Award, Users } from 'lucide-react';
import { Player } from '../../types';

interface PlayerCardProps {
  player: Player;
  teamName: string;
  onClick?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, teamName, onClick }) => {
  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'gardien':
        return 'bg-yellow-100 text-yellow-800';
      case 'défenseur':
        return 'bg-blue-100 text-blue-800';
      case 'milieu':
        return 'bg-green-100 text-green-800';
      case 'attaquant':
        return 'bg-red-100 text-red-800';
      case 'ailier':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceRating = () => {
    const goals = player.stats.goals;
    const assists = player.stats.assists;
    const games = player.stats.gamesPlayed || 1;
    
    const avgGoals = goals / games;
    const avgAssists = assists / games;
    const totalContribution = avgGoals + (avgAssists * 0.7);
    
    if (totalContribution >= 1) return { rating: 'Excellent', color: 'text-green-600' };
    if (totalContribution >= 0.5) return { rating: 'Très bon', color: 'text-blue-600' };
    if (totalContribution >= 0.3) return { rating: 'Bon', color: 'text-yellow-600' };
    return { rating: 'Moyen', color: 'text-gray-600' };
  };

  const performance = getPerformanceRating();

  return (
    <div 
      className="bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {player.photo ? (
              <img
                src={player.photo}
                alt={player.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-xl">#{player.number}</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 truncate">{player.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>
                {player.position}
              </span>
              <span className="text-sm text-gray-600">#{player.number}</span>
            </div>
          </div>
        </div>

        {/* Team Info */}
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{teamName}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Target className="h-4 w-4 text-green-500" />
              <span className="font-bold text-green-700">{player.stats.goals}</span>
            </div>
            <div className="text-xs text-green-600">Buts</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="font-bold text-blue-700">{player.stats.assists}</span>
            </div>
            <div className="text-xs text-blue-600">Passes</div>
          </div>
        </div>

        {/* Performance Rating */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Performance</span>
          <span className={`text-sm font-medium ${performance.color}`}>
            {performance.rating}
          </span>
        </div>

        {/* Additional Info */}
        <div className="space-y-2 text-sm text-gray-600">
          {player.age && (
            <div className="flex justify-between">
              <span>Âge</span>
              <span className="font-medium">{player.age} ans</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Matchs joués</span>
            <span className="font-medium">{player.stats.gamesPlayed}</span>
          </div>
          {player.nationality && (
            <div className="flex justify-between">
              <span>Nationalité</span>
              <span className="font-medium">{player.nationality}</span>
            </div>
          )}
        </div>

        {/* Discipline */}
        {(player.stats.yellowCards > 0 || player.stats.redCards > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Discipline</span>
              <div className="flex items-center space-x-2">
                {player.stats.yellowCards > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-4 bg-yellow-400 rounded"></div>
                    <span className="text-yellow-700 font-medium">{player.stats.yellowCards}</span>
                  </div>
                )}
                {player.stats.redCards > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-4 bg-red-500 rounded"></div>
                    <span className="text-red-700 font-medium">{player.stats.redCards}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Awards */}
        {player.awards && player.awards.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Distinctions</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {player.awards.slice(0, 2).map((award, index) => (
                <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                  {award}
                </span>
              ))}
              {player.awards.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{player.awards.length - 2} autres
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button className="w-full mt-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
          <User className="h-4 w-4" />
          <span>Voir le profil</span>
        </button>
      </div>
    </div>
  );
};