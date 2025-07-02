import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, Target, Users, AlertTriangle } from 'lucide-react';
import { Match, MatchEvent } from '../../types';
import { format } from 'date-fns';

interface LiveScoreProps {
  match: Match;
}

export const LiveScore: React.FC<LiveScoreProps> = ({ match }) => {
  const [currentMinute, setCurrentMinute] = useState(match.liveMinute || 0);
  const [isPlaying, setIsPlaying] = useState(match.status === 'live');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && match.status === 'live') {
      interval = setInterval(() => {
        setCurrentMinute(prev => prev + 1);
      }, 60000); // Update every minute
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, match.status]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'yellow_card':
        return <div className="w-3 h-4 bg-yellow-400 rounded"></div>;
      case 'red_card':
        return <div className="w-3 h-4 bg-red-500 rounded"></div>;
      case 'substitution':
        return <Users className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (match.status !== 'live') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Ce match n'est pas en cours</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Match Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-bold">EN DIRECT</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span className="font-bold">{currentMinute}'</span>
            </div>
          </div>
        </div>

        {/* Score Display */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {match.homeTeam.name}
              </h2>
              <div className="text-sm text-gray-600">Domicile</div>
            </div>

            <div className="flex-shrink-0 mx-8">
              <div className="bg-gray-900 text-white rounded-lg p-4 min-w-24">
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-4xl font-bold">
                    {match.score?.home || 0}
                  </span>
                  <span className="text-2xl text-gray-400">-</span>
                  <span className="text-4xl font-bold">
                    {match.score?.away || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {match.awayTeam.name}
              </h2>
              <div className="text-sm text-gray-600">Extérieur</div>
            </div>
          </div>

          {/* Match Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="text-center">
                <div className="font-semibold">{match.venue}</div>
                <div>Stade</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{match.referee || 'N/A'}</div>
                <div>Arbitre</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{match.attendance || 'N/A'}</div>
                <div>Spectateurs</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{match.weather || 'Beau temps'}</div>
                <div>Météo</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Events */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Événements du Match
        </h3>

        <div className="space-y-3">
          {match.events && match.events.length > 0 ? (
            match.events
              .sort((a, b) => b.minute - a.minute)
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-12 text-center">
                    <span className="text-sm font-bold text-gray-600">
                      {event.minute}'
                    </span>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {event.playerName}
                    </div>
                    {event.description && (
                      <div className="text-sm text-gray-600">
                        {event.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 text-sm text-gray-500">
                    {event.teamId === match.homeTeam.id 
                      ? match.homeTeam.name 
                      : match.awayTeam.name
                    }
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun événement pour le moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Match Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Statistiques du Match
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Possession</span>
            <div className="flex items-center space-x-4">
              <span className="font-bold">55%</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '55%' }}></div>
              </div>
              <span className="font-bold">45%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tirs</span>
            <div className="flex items-center space-x-8">
              <span className="font-bold">8</span>
              <span className="font-bold">5</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tirs cadrés</span>
            <div className="flex items-center space-x-8">
              <span className="font-bold">4</span>
              <span className="font-bold">2</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Corners</span>
            <div className="flex items-center space-x-8">
              <span className="font-bold">6</span>
              <span className="font-bold">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};