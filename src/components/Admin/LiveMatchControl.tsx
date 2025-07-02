import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, Target, Users, Clock, AlertTriangle, Save, Edit, Trash2, Timer, RotateCcw, X, CheckCircle, Zap, Settings } from 'lucide-react';
import { Match, MatchEvent, Player } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface LiveMatchControlProps {
  match: Match;
  onUpdateMatch: (updatedMatch: Match) => void;
  onClose?: () => void;
}

type MatchPeriod = 'first_half' | 'half_time' | 'second_half' | 'full_time' | 'extra_first' | 'extra_break' | 'extra_second' | 'penalty_shootout' | 'finished';

export const LiveMatchControl: React.FC<LiveMatchControlProps> = ({ 
  match, 
  onUpdateMatch, 
  onClose 
}) => {
  const { currentTournament } = useApp();
  const [currentMinute, setCurrentMinute] = useState(match.liveMinute || 0);
  const [currentSecond, setCurrentSecond] = useState(0);
  const [isRunning, setIsRunning] = useState(match.status === 'live');
  const [homeScore, setHomeScore] = useState(match.score?.home || 0);
  const [awayScore, setAwayScore] = useState(match.score?.away || 0);
  const [homePenalties, setHomePenalties] = useState(match.score?.penalties?.home || 0);
  const [awayPenalties, setAwayPenalties] = useState(match.score?.penalties?.away || 0);
  const [events, setEvents] = useState<MatchEvent[]>(match.events || []);
  const [showEventForm, setShowEventForm] = useState(false);
  const [matchPeriod, setMatchPeriod] = useState<MatchPeriod>(match.period as MatchPeriod || 'first_half');
  const [customExtraTime, setCustomExtraTime] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  
  // Event form
  const [eventForm, setEventForm] = useState({
    type: 'goal' as MatchEvent['type'],
    minute: currentMinute,
    playerId: '',
    playerName: '',
    teamId: match.homeTeam.id,
    description: ''
  });

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Auto-save match state
  useEffect(() => {
    const updatedMatch = {
      ...match,
      liveMinute: currentMinute,
      period: matchPeriod,
      score: matchPeriod === 'penalty_shootout' 
        ? { 
            home: homeScore, 
            away: awayScore,
            penalties: { home: homePenalties, away: awayPenalties }
          }
        : { home: homeScore, away: awayScore },
      events
    };
    onUpdateMatch(updatedMatch);
  }, [currentMinute, homeScore, awayScore, homePenalties, awayPenalties, events, matchPeriod]);

  // Automatic timer - runs every second when match is live
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && match.status === 'live') {
      interval = setInterval(() => {
        setCurrentSecond(prev => {
          if (prev >= 59) {
            setCurrentMinute(prevMin => prevMin + 1);
            return 0;
          }
          return prev + 1;
        });
      }, 1000); // Real-time seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, match.status]);

  // Auto-determine period based on time
  useEffect(() => {
    if (currentMinute < 45) {
      if (matchPeriod !== 'first_half') setMatchPeriod('first_half');
    } else if (currentMinute >= 45 && currentMinute < 90) {
      if (matchPeriod === 'first_half') setMatchPeriod('second_half');
    } else if (currentMinute >= 90 && currentMinute < 105) {
      if (matchPeriod === 'second_half') setMatchPeriod('extra_first');
    } else if (currentMinute >= 105 && currentMinute < 120) {
      if (matchPeriod === 'extra_first') setMatchPeriod('extra_second');
    }
  }, [currentMinute, matchPeriod]);

  const getDisplayTime = () => {
    const baseMinute = Math.min(currentMinute, getCurrentPeriodMax());
    const extraTime = Math.max(0, currentMinute - getCurrentPeriodMax());
    
    if (extraTime > 0) {
      return `${baseMinute}+${extraTime}'`;
    }
    return `${baseMinute}:${currentSecond.toString().padStart(2, '0')}`;
  };

  const getCurrentPeriodMax = () => {
    switch (matchPeriod) {
      case 'first_half': return 45;
      case 'second_half': return 90;
      case 'extra_first': return 105;
      case 'extra_second': return 120;
      default: return currentMinute;
    }
  };

  const getPeriodLabel = () => {
    switch (matchPeriod) {
      case 'first_half': return '1ère Mi-temps';
      case 'half_time': return 'Mi-temps';
      case 'second_half': return '2ème Mi-temps';
      case 'full_time': return 'Temps réglementaire terminé';
      case 'extra_first': return '1ère Prolongation';
      case 'extra_break': return 'Pause Prolongations';
      case 'extra_second': return '2ème Prolongation';
      case 'penalty_shootout': return 'Séance de Tirs au But';
      case 'finished': return 'Match Terminé';
      default: return '';
    }
  };

  const handleStartMatch = () => {
    const updatedMatch = {
      ...match,
      status: 'live' as const,
      liveMinute: currentMinute,
      period: 'first_half' as const
    };
    setIsRunning(true);
    setMatchPeriod('first_half');
    onUpdateMatch(updatedMatch);
    showSuccessMessage();
  };

  const handlePauseMatch = () => {
    setIsRunning(false);
    showSuccessMessage();
  };

  const handleResumeMatch = () => {
    setIsRunning(true);
    showSuccessMessage();
  };

  const handleEndPeriod = () => {
    setIsRunning(false);
    
    if (matchPeriod === 'first_half') {
      setCurrentMinute(45);
      setCurrentSecond(0);
      setMatchPeriod('half_time');
    } else if (matchPeriod === 'second_half') {
      setCurrentMinute(90);
      setCurrentSecond(0);
      setMatchPeriod('full_time');
    } else if (matchPeriod === 'extra_first') {
      setCurrentMinute(105);
      setCurrentSecond(0);
      setMatchPeriod('extra_break');
    } else if (matchPeriod === 'extra_second') {
      setCurrentMinute(120);
      setCurrentSecond(0);
      setMatchPeriod('penalty_shootout');
    }
    showSuccessMessage();
  };

  const handleStartSecondHalf = () => {
    setCurrentMinute(45);
    setCurrentSecond(0);
    setMatchPeriod('second_half');
    setIsRunning(true);
    showSuccessMessage();
  };

  const handleStartExtraTime = () => {
    if (homeScore === awayScore) {
      setCurrentMinute(90);
      setCurrentSecond(0);
      setMatchPeriod('extra_first');
      setIsRunning(true);
      showSuccessMessage();
    } else {
      handleEndMatch();
    }
  };

  const handleStartPenalties = () => {
    if (homeScore === awayScore) {
      setMatchPeriod('penalty_shootout');
      setHomePenalties(0);
      setAwayPenalties(0);
      setIsRunning(false);
      showSuccessMessage();
    } else {
      handleEndMatch();
    }
  };

  const handleEndMatch = () => {
    setIsRunning(false);
    setMatchPeriod('finished');
    
    const finalScore = matchPeriod === 'penalty_shootout' 
      ? { 
          home: homeScore, 
          away: awayScore,
          penalties: { home: homePenalties, away: awayPenalties }
        }
      : { home: homeScore, away: awayScore };

    const updatedMatch = {
      ...match,
      status: 'finished' as const,
      score: finalScore,
      events,
      liveMinute: currentMinute,
      period: 'finished' as const
    };
    onUpdateMatch(updatedMatch);
    showSuccessMessage();
  };

  const handleAddCustomTime = () => {
    const minutes = parseInt(customExtraTime);
    if (!isNaN(minutes) && minutes > 0) {
      setCurrentMinute(prev => prev + minutes);
      setCustomExtraTime('');
      showSuccessMessage();
    }
  };

  const handleQuickJump = (minute: number) => {
    setCurrentMinute(minute);
    setCurrentSecond(0);
    showSuccessMessage();
  };

  const handleSetCustomTime = (minute: number, second: number = 0) => {
    setCurrentMinute(minute);
    setCurrentSecond(second);
    showSuccessMessage();
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
      if (matchPeriod === 'penalty_shootout') {
        if (eventForm.teamId === match.homeTeam.id) {
          setHomePenalties(prev => prev + 1);
        } else {
          setAwayPenalties(prev => prev + 1);
        }
      } else {
        if (eventForm.teamId === match.homeTeam.id) {
          setHomeScore(prev => prev + 1);
        } else {
          setAwayScore(prev => prev + 1);
        }
      }
    }

    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);

    // Reset form
    setEventForm({
      type: 'goal',
      minute: currentMinute,
      playerId: '',
      playerName: '',
      teamId: match.homeTeam.id,
      description: ''
    });
    setShowEventForm(false);
    showSuccessMessage();
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      const eventToDelete = events.find(e => e.id === eventId);
      const updatedEvents = events.filter(e => e.id !== eventId);
      
      // Update score if it was a goal
      if (eventToDelete?.type === 'goal') {
        if (matchPeriod === 'penalty_shootout') {
          if (eventToDelete.teamId === match.homeTeam.id) {
            setHomePenalties(prev => Math.max(0, prev - 1));
          } else {
            setAwayPenalties(prev => Math.max(0, prev - 1));
          }
        } else {
          if (eventToDelete.teamId === match.homeTeam.id) {
            setHomeScore(prev => Math.max(0, prev - 1));
          } else {
            setAwayScore(prev => Math.max(0, prev - 1));
          }
        }
      }
      
      setEvents(updatedEvents);
      showSuccessMessage();
    }
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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2 z-10">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-800 text-sm font-medium">Sauvegardé !</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Contrôle du Match en Direct
            </h2>
            <p className="text-gray-600 mt-1">
              {match.homeTeam.name} vs {match.awayTeam.name} • {match.venue}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="font-bold text-2xl text-gray-900 font-mono">
                {getDisplayTime()}
              </span>
            </div>
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isRunning ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-blue-100 text-blue-800'
            }`}>
              {isRunning ? '🔴 LIVE' : getPeriodLabel()}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Live Match Display */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${isRunning ? 'bg-white animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="font-bold text-lg">
                  {match.status === 'live' ? (isRunning ? '🔴 EN DIRECT' : '⏸️ EN PAUSE') : match.status === 'upcoming' ? '⏳ À VENIR' : '✅ TERMINÉ'}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Timer className="h-6 w-6" />
                  <span className="font-bold text-4xl font-mono">{getDisplayTime()}</span>
                </div>
                <div className="text-lg opacity-90">
                  {getPeriodLabel()}
                </div>
              </div>
            </div>

            {/* Score Display */}
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {match.homeTeam.name}
                </h2>
                <div className="text-sm opacity-90">Domicile</div>
              </div>

              <div className="flex-shrink-0 mx-8">
                <div className="bg-black bg-opacity-30 rounded-xl p-6 min-w-40">
                  <div className="flex items-center justify-center space-x-6">
                    <div className="text-center">
                      <input
                        type="number"
                        value={homeScore}
                        onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                        className="w-20 text-center text-4xl font-bold bg-transparent border-none text-white"
                        min="0"
                        disabled={match.status === 'finished'}
                      />
                    </div>
                    <span className="text-3xl text-gray-300">-</span>
                    <div className="text-center">
                      <input
                        type="number"
                        value={awayScore}
                        onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                        className="w-20 text-center text-4xl font-bold bg-transparent border-none text-white"
                        min="0"
                        disabled={match.status === 'finished'}
                      />
                    </div>
                  </div>
                  
                  {/* Penalty Score */}
                  {matchPeriod === 'penalty_shootout' && (
                    <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-white border-opacity-30">
                      <div className="text-center">
                        <input
                          type="number"
                          value={homePenalties}
                          onChange={(e) => setHomePenalties(parseInt(e.target.value) || 0)}
                          className="w-16 text-center text-xl font-bold bg-transparent border-none text-white"
                          min="0"
                        />
                      </div>
                      <span className="text-sm text-gray-300 font-medium">TIRS AU BUT</span>
                      <div className="text-center">
                        <input
                          type="number"
                          value={awayPenalties}
                          onChange={(e) => setAwayPenalties(parseInt(e.target.value) || 0)}
                          className="w-16 text-center text-xl font-bold bg-transparent border-none text-white"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {match.awayTeam.name}
                </h2>
                <div className="text-sm opacity-90">Extérieur</div>
              </div>
            </div>
          </div>

          {/* Time Controls */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                Contrôles du Temps
              </h3>
              <button
                onClick={() => setShowTimeSettings(!showTimeSettings)}
                className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Paramètres</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Temps additionnel</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentMinute(prev => prev + 1)}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm font-medium"
                  >
                    +1 min
                  </button>
                  <button
                    onClick={() => setCurrentMinute(prev => prev + 2)}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm font-medium"
                  >
                    +2 min
                  </button>
                  <button
                    onClick={() => setCurrentMinute(prev => prev + 5)}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm font-medium"
                  >
                    +5 min
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Sauts rapides</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleQuickJump(45)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded text-sm font-medium"
                  >
                    45'
                  </button>
                  <button
                    onClick={() => handleQuickJump(90)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded text-sm font-medium"
                  >
                    90'
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Prolongations</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleQuickJump(105)}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-2 rounded text-sm font-medium"
                  >
                    105'
                  </button>
                  <button
                    onClick={() => handleQuickJump(120)}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-2 rounded text-sm font-medium"
                  >
                    120'
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Temps personnalisé</h4>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={customExtraTime}
                    onChange={(e) => setCustomExtraTime(e.target.value)}
                    placeholder="Min"
                    className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                    min="1"
                    max="30"
                  />
                  <button
                    onClick={handleAddCustomTime}
                    disabled={!customExtraTime}
                    className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-sm font-medium disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Time Settings */}
            {showTimeSettings && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Réglage précis du temps</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Minutes</label>
                    <input
                      type="number"
                      value={currentMinute}
                      onChange={(e) => setCurrentMinute(parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-center font-bold"
                      min="0"
                      max="150"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Secondes</label>
                    <input
                      type="number"
                      value={currentSecond}
                      onChange={(e) => setCurrentSecond(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-center font-bold"
                      min="0"
                      max="59"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Période</label>
                    <select
                      value={matchPeriod}
                      onChange={(e) => setMatchPeriod(e.target.value as MatchPeriod)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      <option value="first_half">1ère Mi-temps</option>
                      <option value="half_time">Mi-temps</option>
                      <option value="second_half">2ème Mi-temps</option>
                      <option value="full_time">Temps réglementaire</option>
                      <option value="extra_first">1ère Prolongation</option>
                      <option value="extra_break">Pause Prolongations</option>
                      <option value="extra_second">2ème Prolongation</option>
                      <option value="penalty_shootout">Tirs au but</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Contrôles du Match</h3>
            <div className="flex justify-center space-x-4 flex-wrap gap-3">
              {match.status === 'upcoming' && (
                <button
                  onClick={handleStartMatch}
                  className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg"
                >
                  <Play className="h-5 w-5" />
                  <span>Démarrer le Match</span>
                </button>
              )}

              {match.status === 'live' && (
                <>
                  <button
                    onClick={isRunning ? handlePauseMatch : handleResumeMatch}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors shadow-lg ${
                      isRunning 
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    <span>{isRunning ? 'Pause' : 'Reprendre'}</span>
                  </button>

                  <button
                    onClick={() => setShowEventForm(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Événement</span>
                  </button>

                  <button
                    onClick={handleEndPeriod}
                    className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-lg"
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span>Fin Période</span>
                  </button>
                </>
              )}

              {/* Period-specific buttons */}
              {matchPeriod === 'half_time' && (
                <button
                  onClick={handleStartSecondHalf}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Play className="h-5 w-5" />
                  <span>2ème Mi-temps</span>
                </button>
              )}

              {matchPeriod === 'full_time' && (
                <button
                  onClick={handleStartExtraTime}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-lg"
                >
                  <Timer className="h-5 w-5" />
                  <span>Prolongations</span>
                </button>
              )}

              {matchPeriod === 'extra_break' && (
                <button
                  onClick={() => {
                    setCurrentMinute(105);
                    setCurrentSecond(0);
                    setMatchPeriod('extra_second');
                    setIsRunning(true);
                  }}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-lg"
                >
                  <Play className="h-5 w-5" />
                  <span>2ème Prolongation</span>
                </button>
              )}

              {(matchPeriod === 'penalty_shootout' || (currentMinute >= 120 && homeScore === awayScore)) && (
                <button
                  onClick={handleStartPenalties}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  <Target className="h-5 w-5" />
                  <span>Tirs au But</span>
                </button>
              )}

              {match.status === 'live' && (
                <button
                  onClick={handleEndMatch}
                  className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg"
                >
                  <Square className="h-5 w-5" />
                  <span>Terminer</span>
                </button>
              )}

              {match.status === 'finished' && (
                <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg font-medium flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Match terminé</span>
                </div>
              )}
            </div>
          </div>

          {/* Add Event Form */}
          {showEventForm && match.status === 'live' && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
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
                    <option value="goal">⚽ But</option>
                    <option value="yellow_card">🟨 Carton jaune</option>
                    <option value="red_card">🟥 Carton rouge</option>
                    <option value="substitution">🔄 Remplacement</option>
                    <option value="penalty">🎯 Penalty</option>
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
                    max="150"
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

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleAddEvent}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Ajouter l'Événement
                </button>
                <button
                  onClick={() => setShowEventForm(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Events Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Événements du Match ({events.length})
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {events.length > 0 ? (
                events
                  .sort((a, b) => b.minute - a.minute)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                          {event.type === 'goal' ? '⚽ But' : 
                           event.type === 'yellow_card' ? '🟨 Carton jaune' : 
                           event.type === 'red_card' ? '🟥 Carton rouge' : 
                           event.type === 'substitution' ? '🔄 Remplacement' : 
                           '🎯 Penalty'}
                          {event.description && ` • ${event.description}`}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        {event.teamId === match.homeTeam.id 
                          ? match.homeTeam.name 
                          : match.awayTeam.name
                        }
                      </div>

                      {match.status === 'live' && (
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="flex-shrink-0 text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucun événement enregistré</p>
                  <p className="text-sm mt-1">Cliquez sur "Événement" pour ajouter des buts, cartons, etc.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};