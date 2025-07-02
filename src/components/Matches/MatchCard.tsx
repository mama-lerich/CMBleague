import React from 'react';
import { Calendar, MapPin, Clock, Target, Play, Eye } from 'lucide-react';
import { Match } from '../../types';

interface MatchCardProps {
  match: Match;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const getStatusBadge = () => {
    switch (match.status) {
      case 'upcoming':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">À venir</span>;
      case 'live':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium animate-pulse">🔴 EN DIRECT</span>;
      case 'finished':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">✅ Terminé</span>;
      default:
        return null;
    }
  };

  const getCardBorder = () => {
    switch (match.status) {
      case 'live': return 'border-red-300 shadow-red-100';
      case 'finished': return 'border-green-300 shadow-green-100';
      default: return 'border-gray-100';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 ${getCardBorder()} hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {match.round}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">Groupe {match.group}</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Teams and Score */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 text-center">
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              {match.homeTeam.name}
            </h3>
            <p className="text-sm text-gray-600">Domicile</p>
          </div>

          <div className="flex-shrink-0 mx-6">
            {match.status === 'finished' && match.score ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-3xl font-bold text-green-700">
                    {match.score.home}
                  </span>
                  <span className="text-gray-400">-</span>
                  <span className="text-3xl font-bold text-green-700">
                    {match.score.away}
                  </span>
                </div>
                {match.score.penalties && (
                  <div className="text-center mt-1 text-xs text-green-600">
                    TAB: {match.score.penalties.home}-{match.score.penalties.away}
                  </div>
                )}
              </div>
            ) : match.status === 'live' && match.score ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-3xl font-bold text-red-700">
                    {match.score.home}
                  </span>
                  <span className="text-gray-400">-</span>
                  <span className="text-3xl font-bold text-red-700">
                    {match.score.away}
                  </span>
                </div>
                {match.liveMinute !== undefined && (
                  <div className="text-center mt-1 text-xs text-red-600 animate-pulse font-bold">
                    {match.liveMinute}'
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                <div className="text-center">
                  <Clock className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <div className="text-sm font-medium text-gray-600">
                    {match.date.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 text-center">
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              {match.awayTeam.name}
            </h3>
            <p className="text-sm text-gray-600">Extérieur</p>
          </div>
        </div>

        {/* Match Details */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              {match.date.toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-green-500" />
              {match.venue}
            </div>
          </div>

          {/* Events Summary */}
          {match.events && match.events.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {match.events.slice(-3).map((event) => (
                  <span
                    key={event.id}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      event.type === 'goal' ? 'bg-green-100 text-green-800' :
                      event.type === 'yellow_card' ? 'bg-yellow-100 text-yellow-800' :
                      event.type === 'red_card' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {event.minute}' {event.type === 'goal' ? '⚽' : 
                     event.type === 'yellow_card' ? '🟨' : 
                     event.type === 'red_card' ? '🟥' : '🔄'}
                  </span>
                ))}
                {match.events.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{match.events.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
            {match.status === 'live' ? (
              <>
                <Play className="h-4 w-4" />
                <span>Suivre en direct</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Voir les détails</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};