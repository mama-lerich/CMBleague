import React from 'react';
import { Trophy, Target } from 'lucide-react';
import { Match } from '../../types';

interface RecentResultsProps {
  matches: Match[];
}

export const RecentResults: React.FC<RecentResultsProps> = ({ matches }) => {
  const recentMatches = matches
    .filter(match => match.status === 'finished')
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Trophy className="h-6 w-6 text-blue-600 mr-2" />
          Résultats Récents
        </h2>
      </div>

      <div className="space-y-3">
        {recentMatches.map((match) => (
          <div
            key={match.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="font-semibold">{match.homeTeam.name}</span>
                    <span className="text-gray-500 mx-2">vs</span>
                    <span className="font-semibold">{match.awayTeam.name}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {match.score && (
                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-lg">
                        {match.score.home} - {match.score.away}
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {match.date.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                </div>
              </div>
              
              <div className="mt-1 text-xs text-gray-500">
                {match.round} • {match.venue}
              </div>
            </div>
          </div>
        ))}

        {recentMatches.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun résultat disponible</p>
          </div>
        )}
      </div>
    </div>
  );
};