import React from 'react';
import { User, Trophy, Target, Calendar, Award, ArrowLeft } from 'lucide-react';
import { Player } from '../../types';

interface PlayerProfileProps {
  player: Player;
  onBack: () => void;
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({ player, onBack }) => {
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Retour</span>
      </button>

      {/* Player Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {player.photo ? (
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
              )}
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">{player.name}</h1>
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPositionColor(player.position)}`}>
                  {player.position}
                </span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                  #{player.number}
                </span>
              </div>
              {player.age && (
                <p className="text-green-100 mt-2">{player.age} ans</p>
              )}
            </div>
          </div>
        </div>

        {/* Player Info */}
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {player.height && (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{player.height}cm</div>
                <div className="text-sm text-gray-600">Taille</div>
              </div>
            )}
            {player.weight && (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{player.weight}kg</div>
                <div className="text-sm text-gray-600">Poids</div>
              </div>
            )}
            {player.nationality && (
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{player.nationality}</div>
                <div className="text-sm text-gray-600">Nationalité</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{player.stats.gamesPlayed}</div>
              <div className="text-sm text-gray-600">Matchs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Target className="h-6 w-6 text-green-500 mr-2" />
            Statistiques de Performance
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Buts marqués</span>
              <span className="text-2xl font-bold text-green-600">{player.stats.goals}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Passes décisives</span>
              <span className="text-2xl font-bold text-blue-600">{player.stats.assists}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700">Minutes jouées</span>
              <span className="text-2xl font-bold text-purple-600">{player.stats.minutesPlayed}</span>
            </div>

            {player.stats.saves && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-700">Arrêts</span>
                <span className="text-2xl font-bold text-orange-600">{player.stats.saves}</span>
              </div>
            )}
          </div>
        </div>

        {/* Discipline */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-6 w-6 text-yellow-500 mr-2" />
            Discipline
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-6 bg-yellow-400 rounded"></div>
                <span className="text-gray-700">Cartons jaunes</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{player.stats.yellowCards}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-6 bg-red-500 rounded"></div>
                <span className="text-gray-700">Cartons rouges</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{player.stats.redCards}</span>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-sm text-green-600 font-medium">
                {player.stats.redCards === 0 && player.stats.yellowCards <= 2 
                  ? 'Excellent fair-play' 
                  : 'Bon comportement'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Awards */}
      {player.awards && player.awards.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Award className="h-6 w-6 text-yellow-500 mr-2" />
            Récompenses et Distinctions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {player.awards.map((award, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="font-medium text-gray-900">{award}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};