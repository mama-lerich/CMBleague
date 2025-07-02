import React from 'react';
import { Target, Medal } from 'lucide-react';
import { Player } from '../../types';

interface TopScorersProps {
  players: Player[];
}

export const TopScorers: React.FC<TopScorersProps> = ({ players }) => {
  const topScorers = players
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 5);

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-500';
      case 1: return 'text-gray-400';
      case 2: return 'text-orange-600';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Target className="h-6 w-6 text-orange-600 mr-2" />
          Meilleurs Buteurs
        </h2>
      </div>

      <div className="space-y-3">
        {topScorers.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8">
                {index < 3 ? (
                  <Medal className={`h-6 w-6 ${getMedalColor(index)}`} />
                ) : (
                  <span className="text-gray-500 font-bold">#{index + 1}</span>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">{player.name}</h3>
                <p className="text-sm text-gray-600">
                  #{player.number} • {player.position}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-lg text-green-600">
                {player.stats.goals}
              </div>
              <div className="text-xs text-gray-500">
                {player.stats.goals === 1 ? 'but' : 'buts'}
              </div>
            </div>
          </div>
        ))}

        {topScorers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun buteur enregistré</p>
          </div>
        )}
      </div>
    </div>
  );
};