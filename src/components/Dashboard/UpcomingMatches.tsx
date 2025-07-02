import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Match } from '../../types';

interface UpcomingMatchesProps {
  matches: Match[];
}

export const UpcomingMatches: React.FC<UpcomingMatchesProps> = ({ matches }) => {
  const upcomingMatches = matches.filter(match => match.status === 'upcoming').slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Calendar className="h-6 w-6 text-green-600 mr-2" />
          Prochains Matchs
        </h2>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {upcomingMatches.length} à venir
        </span>
      </div>

      <div className="space-y-4">
        {upcomingMatches.map((match) => (
          <div
            key={match.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {match.homeTeam.name} vs {match.awayTeam.name}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {match.round}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {match.date.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {match.venue}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {upcomingMatches.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun match programmé pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
};