import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, Target, Users, Clock, AlertTriangle } from 'lucide-react';
import { Match, MatchEvent, Player } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface MatchLiveControlProps {
  match: Match;
  onUpdateMatch: (updatedMatch: Match) => void;
}

export const MatchLiveControl: React.FC<MatchLiveControlProps> = ({ match, onUpdateMatch }) => {
  const { currentTournament } = useApp();
  const [currentMinute, setCurrentMinute] = useState(match.liveMinute || 0);
  const [isRunning, setIsRunning] = useState(match.status === 'live');
  const [homeScore, setHomeScore] = useState(match.score?.home || 0);
  const [awayScore, setAwayScore] = useState(match.score?.away || 0);
  const [events, setEvents] = useState<MatchEvent[]>(match.events || []);
  
  // Event form
  const [eventForm, setEventForm] = useState({
    type: 'goal' as MatchEvent['type'],
    minute: currentMinute,
    playerId: '',
    playerName: '',
    teamId: match.homeTeam.id,
    description: ''
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && match.status === 'live') {
      interval = setInterval(() => {
        setCurrentMinute(prev => {
          const newMinute = prev + 1;
          if (newMinute >= 90) {
            setIsRunning(false);
            handleEndMatch();
          }
          return newMinute;
        });
      }, 1000); // 1 second = 1 minute in game time for demo
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, match.status]);

  const handleStartMatch = () => {
    const updatedMatch = {
      ...match,
      status: 'live' as const,
      liveMinute: currentMinute
    };
    setIsRunning(true);
    onUpdateMatch(updatedMatch);
  };

  const handlePauseMatch = () => {
    setIsRunning(false);
    const updatedMatch = {
      ...match,
      liveMinute: currentMinute
    };
    onUpdateMatch(updatedMatch);
  };

  const handleEndMatch = () => {
    setIsRunning(false);
    const updatedMatch = {
      ...match,
      status: 'finished' as const,
      score: { home: homeScore, away: awayScore },
      events,
      liveMinute: currentMinute
    };
    onUpdateMatch(updatedMatch);
  };

  const handleAddEvent = () => {
    if (!eventForm.playerName) {
      alert('Veuillez sélectionner un joueur');
      return;
    }

    const newEvent: MatchEvent = {
      id: Date.now().toString(),
      type: eventForm.type,
      minute: eventForm.minute,
      playerId: eventForm.playerId,
      playerName: eventForm.playerName,
      teamId: eventForm.teamId,
      description: eventForm.description
    };

    // Update score if it's a goal
    if (eventForm.type === 'goal') {
      if (eventForm.teamId === match.homeTeam.id) {
        setHomeScore(prev => prev + 1);
      } else {
        setAwayScore(prev => prev + 1);
      }
    }

    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);

    const updatedMatch = {
      ...match,
      events: updatedEvents,
      score: eventForm.type === 'goal' 
        ? { 
            home: eventForm.teamId === match.homeTeam.id ? homeScore + 1 : homeScore,
            away: eventForm.teamId === match.awayTeam.id ? awayScore + 1 : awayScore
          }
        : match.score,
      liveMinute: currentMinute
    };

    onUpdateMatch(updatedMatch);

    // Reset form
    setEventForm({
      type: 'goal',
      minute: currentMinute,
      playerId: '',
      playerName: '',
      teamId: match.homeTeam.id,
      description: ''
    });
  };

  const getTeamPlayers = (teamId: string): Player[] => {
    const team = teamId === match.homeTeam.id ? match.homeTeam : match.awayTeam;
    return team.players || [];
  };

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

  return (
    <div className="space-y-6">
      {/* Match Control Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Contrôle du Match en Direct
          </h2>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="font-bold text-lg">{currentMinute}'</span>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <h3 className="font-bold text-lg">{match.homeTeam.name}</h3>
            <div className="text-sm text-gray-600">Domicile</div>
          </div>

          <div className="flex-shrink-0 mx-8">
            <div className="bg-gray-900 text-white rounded-lg p-4 min-w-24">
              <div className="flex items-center justify-center space-x-4">
                <input
                  type="number"
                  value={homeScore}
                  onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                  className="w-12 text-center text-2xl font-bold bg-transparent border-none text-white"
                  min="0"
                />
                <span className="text-2xl text-gray-400">-</span>
                <input
                  type="number"
                  value={awayScore}
                  onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                  className="w-12 text-center text-2xl font-bold bg-transparent border-none text-white"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="text-center flex-1">
            <h3 className="font-bold text-lg">{match.awayTeam.name}</h3>
            <div className="text-sm text-gray-600">Extérieur</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          {match.status === 'upcoming' && (
            <button
              onClick={handleStartMatch}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Play className="h-5 w-5" />
              <span>Démarrer le Match</span>
            </button>
          )}

          {match.status === 'live' && (
            <>
              <button
                onClick={isRunning ? handlePauseMatch : () => setIsRunning(true)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isRunning 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                <span>{isRunning ? 'Pause' : 'Reprendre'}</span>
              </button>

              <button
                onClick={handleEndMatch}
                className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                <Square className="h-5 w-5" />
                <span>Terminer</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add Event */}
      {match.status === 'live' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 text-blue-500 mr-2" />
            Ajouter un Événement
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'événement
              </label>
              <select
                value={eventForm.type}
                onChange={(e) => setEventForm({...eventForm, type: e.target.value as MatchEvent['type']})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="goal">But</option>
                <option value="yellow_card">Carton jaune</option>
                <option value="red_card">Carton rouge</option>
                <option value="substitution">Remplacement</option>
                <option value="penalty">Penalty</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minute
              </label>
              <input
                type="number"
                value={eventForm.minute}
                onChange={(e) => setEventForm({...eventForm, minute: parseInt(e.target.value) || 0})}
                min="0"
                max="120"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Équipe
              </label>
              <select
                value={eventForm.teamId}
                onChange={(e) => setEventForm({...eventForm, teamId: e.target.value, playerId: '', playerName: ''})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={match.homeTeam.id}>{match.homeTeam.name}</option>
                <option value={match.awayTeam.id}>{match.awayTeam.name}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Joueur
              </label>
              <select
                value={eventForm.playerId}
                onChange={(e) => {
                  const player = getTeamPlayers(eventForm.teamId).find(p => p.id === e.target.value);
                  setEventForm({
                    ...eventForm, 
                    playerId: e.target.value,
                    playerName: player?.name || ''
                  });
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un joueur</option>
                {getTeamPlayers(eventForm.teamId).map((player) => (
                  <option key={player.id} value={player.id}>
                    #{player.number} {player.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <input
                type="text"
                value={eventForm.description}
                onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                placeholder="Description de l'événement..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleAddEvent}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Ajouter l'Événement
          </button>
        </div>
      )}

      {/* Events Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Événements du Match ({events.length})
        </h3>

        <div className="space-y-3">
          {events.length > 0 ? (
            events
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
              <p>Aucun événement enregistré</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};