import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Target, Users, ArrowLeft, Trophy, AlertTriangle, Play, Edit } from 'lucide-react';
import { Match, MatchEvent } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface MatchDetailProps {
  match: Match;
  onBack: () => void;
  onEdit?: () => void;
}

export const MatchDetail: React.FC<MatchDetailProps> = ({ match, onBack, onEdit }) => {
  const { userRole } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'stats'>('overview');

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

  const getStatusColor = () => {
    switch (match.status) {
      case 'upcoming': return 'from-blue-500 to-blue-600';
      case 'live': return 'from-red-500 to-red-600';
      case 'finished': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Match Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Informations du Match</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">Date</div>
                <div className="text-sm text-gray-600">
                  {match.date.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Heure</div>
                <div className="text-sm text-gray-600">
                  {match.date.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-orange-500" />
              <div>
                <div className="font-medium">Lieu</div>
                <div className="text-sm text-gray-600">{match.venue}</div>
              </div>
            </div>
            {match.referee && (
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="font-medium">Arbitre</div>
                  <div className="text-sm text-gray-600">{match.referee}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Détails Supplémentaires</h3>
          <div className="space-y-3">
            <div>
              <div className="font-medium">Phase</div>
              <div className="text-sm text-gray-600">{match.round}</div>
            </div>
            <div>
              <div className="font-medium">Groupe</div>
              <div className="text-sm text-gray-600">Groupe {match.group}</div>
            </div>
            {match.attendance && (
              <div>
                <div className="font-medium">Spectateurs</div>
                <div className="text-sm text-gray-600">{match.attendance.toLocaleString()}</div>
              </div>
            )}
            {match.weather && (
              <div>
                <div className="font-medium">Météo</div>
                <div className="text-sm text-gray-600">{match.weather}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Lineups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 text-blue-500 mr-2" />
            {match.homeTeam.name} (Domicile)
          </h3>
          <div className="space-y-2">
            {match.homeTeam.players.slice(0, 11).map((player) => (
              <div key={player.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">
                    {player.number}
                  </span>
                  <span className="font-medium">{player.name}</span>
                </div>
                <span className="text-sm text-gray-600">{player.position}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 text-red-500 mr-2" />
            {match.awayTeam.name} (Extérieur)
          </h3>
          <div className="space-y-2">
            {match.awayTeam.players.slice(0, 11).map((player) => (
              <div key={player.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm font-bold text-red-700">
                    {player.number}
                  </span>
                  <span className="font-medium">{player.name}</span>
                </div>
                <span className="text-sm text-gray-600">{player.position}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Événements du Match ({match.events?.length || 0})
      </h3>

      <div className="space-y-3">
        {match.events && match.events.length > 0 ? (
          match.events
            .sort((a, b) => a.minute - b.minute)
            .map((event) => (
              <div
                key={event.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
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
                  <div className="text-sm text-gray-600">
                    {event.type === 'goal' ? '⚽ But marqué' : 
                     event.type === 'yellow_card' ? '🟨 Carton jaune' : 
                     event.type === 'red_card' ? '🟥 Carton rouge' : 
                     event.type === 'substitution' ? '🔄 Remplacement' : 
                     '🎯 Penalty'}
                    {event.description && ` • ${event.description}`}
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-sm font-medium">
                  <span className={`px-2 py-1 rounded-full ${
                    event.teamId === match.homeTeam.id 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {event.teamId === match.homeTeam.id 
                      ? match.homeTeam.name 
                      : match.awayTeam.name
                    }
                  </span>
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun événement enregistré pour ce match</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      {/* Match Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques du Match</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Possession</span>
            <div className="flex items-center space-x-4">
              <span className="font-bold text-blue-600">55%</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '55%' }}></div>
              </div>
              <span className="font-bold text-red-600">45%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tirs</span>
            <div className="flex items-center space-x-8">
              <span className="font-bold text-blue-600">8</span>
              <span className="font-bold text-red-600">5</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tirs cadrés</span>
            <div className="flex items-center space-x-8">
              <span className="font-bold text-blue-600">4</span>
              <span className="font-bold text-red-600">2</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Corners</span>
            <div className="flex items-center space-x-8">
              <span className="font-bold text-blue-600">6</span>
              <span className="font-bold text-red-600">3</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Fautes</span>
            <div className="flex items-center space-x-8">
              <span className="font-bold text-blue-600">12</span>
              <span className="font-bold text-red-600">15</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Hors-jeu</span>
            <div className="flex items-center space-x-8">
              <span className="font-bold text-blue-600">3</span>
              <span className="font-bold text-red-600">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Player Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Performances - {match.homeTeam.name}
          </h3>
          <div className="space-y-3">
            {match.homeTeam.players
              .filter(p => p.stats.goals > 0 || p.stats.assists > 0)
              .map((player) => (
                <div key={player.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="font-medium">{player.name}</span>
                  <div className="flex space-x-2 text-sm">
                    {player.stats.goals > 0 && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {player.stats.goals} ⚽
                      </span>
                    )}
                    {player.stats.assists > 0 && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {player.stats.assists} 🅰️
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Performances - {match.awayTeam.name}
          </h3>
          <div className="space-y-3">
            {match.awayTeam.players
              .filter(p => p.stats.goals > 0 || p.stats.assists > 0)
              .map((player) => (
                <div key={player.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="font-medium">{player.name}</span>
                  <div className="flex space-x-2 text-sm">
                    {player.stats.goals > 0 && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {player.stats.goals} ⚽
                      </span>
                    )}
                    {player.stats.assists > 0 && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {player.stats.assists} 🅰️
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Retour aux matchs</span>
      </button>

      {/* Match Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className={`bg-gradient-to-r ${getStatusColor()} p-8 text-white`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  match.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                  match.status === 'live' ? 'bg-red-100 text-red-800 animate-pulse' :
                  'bg-green-100 text-green-800'
                }`}>
                  {match.status === 'upcoming' ? '⏳ À venir' :
                   match.status === 'live' ? '🔴 EN DIRECT' : '✅ Terminé'}
                </span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                  {match.round}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <h1 className="text-2xl font-bold">{match.homeTeam.name}</h1>
                  <p className="text-sm opacity-90">Domicile</p>
                </div>

                <div className="flex-shrink-0 mx-8">
                  {match.status === 'finished' && match.score ? (
                    <div className="bg-white bg-opacity-20 rounded-xl p-6">
                      <div className="flex items-center justify-center space-x-4">
                        <span className="text-4xl font-bold">
                          {match.score.home}
                        </span>
                        <span className="text-2xl opacity-70">-</span>
                        <span className="text-4xl font-bold">
                          {match.score.away}
                        </span>
                      </div>
                      {match.score.penalties && (
                        <div className="text-center mt-2 text-sm opacity-90">
                          TAB: {match.score.penalties.home} - {match.score.penalties.away}
                        </div>
                      )}
                    </div>
                  ) : match.status === 'live' && match.score ? (
                    <div className="bg-white bg-opacity-20 rounded-xl p-6">
                      <div className="flex items-center justify-center space-x-4">
                        <span className="text-4xl font-bold">
                          {match.score.home}
                        </span>
                        <span className="text-2xl opacity-70">-</span>
                        <span className="text-4xl font-bold">
                          {match.score.away}
                        </span>
                      </div>
                      {match.liveMinute !== undefined && (
                        <div className="text-center mt-2 text-sm opacity-90 animate-pulse">
                          {match.liveMinute}'
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white bg-opacity-20 rounded-xl p-6">
                      <div className="text-center">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-70" />
                        <div className="text-lg font-bold">
                          {match.date.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center flex-1">
                  <h1 className="text-2xl font-bold">{match.awayTeam.name}</h1>
                  <p className="text-sm opacity-90">Extérieur</p>
                </div>
              </div>
            </div>

            {userRole === 'admin' && onEdit && (
              <button
                onClick={onEdit}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Modifier</span>
              </button>
            )}
          </div>
        </div>

        {/* Match Info Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-gray-600">Date</div>
                <div className="font-medium">{match.date.toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-gray-600">Heure</div>
                <div className="font-medium">
                  {match.date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-gray-600">Lieu</div>
                <div className="font-medium">{match.venue}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-gray-600">Groupe</div>
                <div className="font-medium">Groupe {match.group}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-6">
          {[
            { key: 'overview', label: 'Vue d\'ensemble', icon: Trophy },
            { key: 'events', label: 'Événements', icon: Target },
            { key: 'stats', label: 'Statistiques', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'events' && renderEvents()}
      {activeTab === 'stats' && renderStats()}
    </div>
  );
};