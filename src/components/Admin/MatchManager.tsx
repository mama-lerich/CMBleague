import React, { useState } from 'react';
import { Calendar, Play, Edit, Trash2, Plus, Clock, MapPin, Users, Target, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Match } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { LiveMatchControl } from './LiveMatchControl';

interface MatchManagerProps {
  onClose: () => void;
}

export const MatchManager: React.FC<MatchManagerProps> = ({ onClose }) => {
  const { currentTournament, setCurrentTournament, tournaments, setTournaments } = useApp();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showLiveControl, setShowLiveControl] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'live' | 'finished'>('all');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!currentTournament) return null;

  const filteredMatches = currentTournament.matches.filter(match => {
    if (filterStatus === 'all') return true;
    return match.status === filterStatus;
  });

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleUpdateMatch = (updatedMatch: Match) => {
    const updatedMatches = currentTournament.matches.map(match => 
      match.id === updatedMatch.id ? updatedMatch : match
    );
    
    const updatedTournament = {
      ...currentTournament,
      matches: updatedMatches
    };
    
    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
    showSuccessMessage();
  };

  const handleStartMatch = (match: Match) => {
    if (confirm(`Êtes-vous sûr de vouloir démarrer le match ${match.homeTeam.name} vs ${match.awayTeam.name} ?`)) {
      const updatedMatch = {
        ...match,
        status: 'live' as const,
        liveMinute: 0,
        period: 'first_half' as const
      };
      handleUpdateMatch(updatedMatch);
      setSelectedMatch(updatedMatch);
      setShowLiveControl(true);
    }
  };

  const handleResumeMatch = (match: Match) => {
    setSelectedMatch(match);
    setShowLiveControl(true);
  };

  const handleFinishMatch = (match: Match) => {
    if (confirm(`Êtes-vous sûr de vouloir terminer définitivement le match ${match.homeTeam.name} vs ${match.awayTeam.name} ?`)) {
      const updatedMatch = {
        ...match,
        status: 'finished' as const,
        period: 'finished' as const,
        score: match.score || { home: 0, away: 0 }
      };
      handleUpdateMatch(updatedMatch);
    }
  };

  const handleDeleteMatch = (matchId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce match ? Cette action est irréversible.')) {
      const updatedMatches = currentTournament.matches.filter(m => m.id !== matchId);
      const updatedTournament = {
        ...currentTournament,
        matches: updatedMatches
      };
      
      setCurrentTournament(updatedTournament);
      setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
      showSuccessMessage();
    }
  };

  const handleResetMatch = (match: Match) => {
    if (confirm(`Êtes-vous sûr de vouloir remettre à zéro le match ${match.homeTeam.name} vs ${match.awayTeam.name} ?`)) {
      const updatedMatch = {
        ...match,
        status: 'upcoming' as const,
        liveMinute: 0,
        period: undefined,
        score: undefined,
        events: []
      };
      handleUpdateMatch(updatedMatch);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">À venir</span>;
      case 'live':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium animate-pulse">🔴 EN DIRECT</span>;
      case 'finished':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">✅ Terminé</span>;
      default:
        return null;
    }
  };

  const getPeriodLabel = (period?: string) => {
    switch (period) {
      case 'first_half': return '1ère MT';
      case 'half_time': return 'Mi-temps';
      case 'second_half': return '2ème MT';
      case 'full_time': return 'Temps réglementaire';
      case 'extra_first': return '1ère Prol.';
      case 'extra_break': return 'Pause Prol.';
      case 'extra_second': return '2ème Prol.';
      case 'penalty_shootout': return 'Tirs au but';
      case 'finished': return 'Terminé';
      default: return '';
    }
  };

  if (showLiveControl && selectedMatch) {
    return (
      <LiveMatchControl
        match={selectedMatch}
        onUpdateMatch={handleUpdateMatch}
        onClose={() => {
          setShowLiveControl(false);
          setSelectedMatch(null);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 z-10">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Opération réussie !</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-6 w-6 text-blue-500 mr-2" />
              Gestion des Matchs en Direct
            </h2>
            <p className="text-gray-600 mt-1">
              Contrôlez tous les aspects de vos matchs en temps réel
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {currentTournament.matches.filter(m => m.status === 'upcoming').length}
              </div>
              <div className="text-sm text-blue-600">À venir</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">
                {currentTournament.matches.filter(m => m.status === 'live').length}
              </div>
              <div className="text-sm text-red-600">En direct</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {currentTournament.matches.filter(m => m.status === 'finished').length}
              </div>
              <div className="text-sm text-green-600">Terminés</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {currentTournament.matches.length}
              </div>
              <div className="text-sm text-purple-600">Total</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'Tous', count: currentTournament.matches.length },
                { key: 'upcoming', label: 'À venir', count: currentTournament.matches.filter(m => m.status === 'upcoming').length },
                { key: 'live', label: 'En direct', count: currentTournament.matches.filter(m => m.status === 'live').length },
                { key: 'finished', label: 'Terminés', count: currentTournament.matches.filter(m => m.status === 'finished').length }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterStatus(filter.key as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filterStatus === filter.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            <button className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg transition-colors">
              <Plus className="h-4 w-4" />
              <span>Nouveau Match</span>
            </button>
          </div>
        </div>

        {/* Matches List */}
        <div className="p-6">
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <div key={match.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {match.homeTeam.name} vs {match.awayTeam.name}
                      </h3>
                      {getStatusBadge(match.status)}
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        {match.round}
                      </span>
                      {match.period && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                          {getPeriodLabel(match.period)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {match.date.toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {match.date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {match.venue}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Groupe {match.group}
                      </div>
                    </div>

                    {/* Score Display */}
                    {match.score && (
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <Target className="h-5 w-5 text-green-500" />
                          <span className="font-bold text-2xl text-gray-900">
                            {match.score.home} - {match.score.away}
                          </span>
                        </div>
                        {match.status === 'live' && match.liveMinute !== undefined && (
                          <span className="text-lg text-red-600 font-bold animate-pulse">
                            {match.liveMinute}'
                          </span>
                        )}
                        {match.score.penalties && (
                          <span className="text-sm text-purple-600 font-medium">
                            (TAB: {match.score.penalties.home} - {match.score.penalties.away})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Events Summary */}
                    {match.events && match.events.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Événements récents:</h4>
                        <div className="flex flex-wrap gap-2">
                          {match.events.slice(-4).map((event) => (
                            <span
                              key={event.id}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                event.type === 'goal' ? 'bg-green-100 text-green-800' :
                                event.type === 'yellow_card' ? 'bg-yellow-100 text-yellow-800' :
                                event.type === 'red_card' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {event.minute}' {event.playerName} 
                              {event.type === 'goal' ? ' ⚽' : 
                               event.type === 'yellow_card' ? ' 🟨' : 
                               event.type === 'red_card' ? ' 🟥' : ' 🔄'}
                            </span>
                          ))}
                          {match.events.length > 4 && (
                            <span className="text-xs text-gray-500">
                              +{match.events.length - 4} autres...
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {match.status === 'upcoming' && (
                      <button
                        onClick={() => handleStartMatch(match)}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                      >
                        <Play className="h-4 w-4" />
                        <span>Démarrer</span>
                      </button>
                    )}

                    {match.status === 'live' && (
                      <button
                        onClick={() => handleResumeMatch(match)}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium animate-pulse"
                      >
                        <Play className="h-4 w-4" />
                        <span>Contrôler</span>
                      </button>
                    )}

                    {match.status === 'finished' && (
                      <button
                        onClick={() => handleResumeMatch(match)}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                      >
                        <Target className="h-4 w-4" />
                        <span>Voir Détails</span>
                      </button>
                    )}

                    <div className="flex space-x-1">
                      <button
                        onClick={() => console.log('Edit match', match.id)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                        title="Modifier le match"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      {match.status !== 'upcoming' && (
                        <button
                          onClick={() => handleResetMatch(match)}
                          className="text-orange-600 hover:text-orange-800 p-2 rounded hover:bg-orange-50 transition-colors"
                          title="Remettre à zéro"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </button>
                      )}

                      {match.status === 'live' && (
                        <button
                          onClick={() => handleFinishMatch(match)}
                          className="text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50 transition-colors"
                          title="Terminer le match"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                        title="Supprimer le match"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredMatches.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Aucun match trouvé
                </h3>
                <p className="text-gray-500">
                  {filterStatus === 'all' 
                    ? 'Aucun match programmé pour ce tournoi'
                    : `Aucun match ${filterStatus === 'upcoming' ? 'à venir' : filterStatus === 'live' ? 'en direct' : 'terminé'}`
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Live Matches Summary */}
        {currentTournament.matches.filter(m => m.status === 'live').length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-red-50">
            <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
              🔴 Matchs en Direct ({currentTournament.matches.filter(m => m.status === 'live').length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentTournament.matches
                .filter(m => m.status === 'live')
                .map(match => (
                  <div key={match.id} className="bg-white rounded-lg p-4 border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 text-sm">
                        {match.homeTeam.name} vs {match.awayTeam.name}
                      </h4>
                      <span className="text-red-600 font-bold text-sm animate-pulse">
                        {match.liveMinute}'
                      </span>
                    </div>
                    {match.score && (
                      <div className="text-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {match.score.home} - {match.score.away}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => handleResumeMatch(match)}
                      className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                    >
                      Contrôler
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};