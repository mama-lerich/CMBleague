import React, { useState } from 'react';
import { 
  Settings, 
  BarChart3, 
  Users, 
  Calendar, 
  Trophy, 
  Target,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  Download,
  Upload,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { TournamentAnalytics } from './TournamentAnalytics';
import { PlayerManagement } from './PlayerManagement';
import { MatchLiveControl } from './MatchLiveControl';
import { TournamentSettings } from './TournamentSettings';
import { BulkOperations } from './BulkOperations';

interface AdminDashboardProps {
  onBack?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { currentTournament, userRole, setCurrentTournament, tournaments, setTournaments } = useApp();
  const [activeView, setActiveView] = useState<'overview' | 'analytics' | 'players' | 'live' | 'settings' | 'bulk'>('overview');
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showBulkOps, setShowBulkOps] = useState(false);

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Settings className="h-16 w-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Accès refusé
          </h2>
          <p className="text-gray-500">
            Vous devez être administrateur pour accéder à cette section
          </p>
        </div>
      </div>
    );
  }

  if (!currentTournament) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour aux outils de création</span>
          </button>
        )}

        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Aucun tournoi sélectionné
            </h2>
            <p className="text-gray-500 mb-4">
              Sélectionnez un tournoi pour accéder au tableau de bord administrateur
            </p>
            {onBack && (
              <button
                onClick={onBack}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>Créer un nouveau tournoi</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateMatch = (updatedMatch: any) => {
    const updatedMatches = currentTournament.matches.map(match => 
      match.id === updatedMatch.id ? updatedMatch : match
    );
    
    const updatedTournament = {
      ...currentTournament,
      matches: updatedMatches
    };
    
    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
  };

  const handlePlayerUpdate = (updatedPlayer: any) => {
    const updatedTeams = currentTournament.teams.map(team => ({
      ...team,
      players: team.players.map(player => 
        player.id === updatedPlayer.id ? updatedPlayer : player
      )
    }));
    
    const updatedTournament = {
      ...currentTournament,
      teams: updatedTeams
    };
    
    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
  };

  const handlePlayerDelete = (playerId: string, teamId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
      const updatedTeams = currentTournament.teams.map(team => 
        team.id === teamId 
          ? { ...team, players: team.players.filter(p => p.id !== playerId) }
          : team
      );
      
      const updatedTournament = {
        ...currentTournament,
        teams: updatedTeams
      };
      
      setCurrentTournament(updatedTournament);
      setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
    }
  };

  const handleTournamentUpdate = (updatedTournament: any) => {
    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === updatedTournament.id ? updatedTournament : t));
  };

  // Quick stats
  const liveMatches = currentTournament.matches.filter(m => m.status === 'live');
  const upcomingMatches = currentTournament.matches.filter(m => m.status === 'upcoming');
  const finishedMatches = currentTournament.matches.filter(m => m.status === 'finished');
  const totalPlayers = currentTournament.teams.reduce((sum, team) => sum + team.players.length, 0);
  const totalGoals = currentTournament.teams.flatMap(t => t.players).reduce((sum, p) => sum + p.stats.goals, 0);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveView('live')}
          className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-200 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{liveMatches.length}</div>
              <div className="text-sm opacity-90">Matchs en direct</div>
            </div>
            <Clock className="h-8 w-8 opacity-80" />
          </div>
        </button>

        <button
          onClick={() => setActiveView('analytics')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-200 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{finishedMatches.length}</div>
              <div className="text-sm opacity-90">Matchs terminés</div>
            </div>
            <CheckCircle className="h-8 w-8 opacity-80" />
          </div>
        </button>

        <button
          onClick={() => setActiveView('players')}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-200 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{totalPlayers}</div>
              <div className="text-sm opacity-90">Joueurs inscrits</div>
            </div>
            <Users className="h-8 w-8 opacity-80" />
          </div>
        </button>

        <button
          onClick={() => setShowBulkOps(true)}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-200 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{currentTournament.teams.length}</div>
              <div className="text-sm opacity-90">Équipes</div>
            </div>
            <Trophy className="h-8 w-8 opacity-80" />
          </div>
        </button>
      </div>

      {/* Tournament Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
            Vue d'Ensemble du Tournoi
          </h3>
          <button
            onClick={() => setShowSettings(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{currentTournament.teams.length}</div>
            <div className="text-sm text-blue-600">Équipes</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{totalPlayers}</div>
            <div className="text-sm text-green-600">Joueurs</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">{currentTournament.matches.length}</div>
            <div className="text-sm text-purple-600">Matchs</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-700">{totalGoals}</div>
            <div className="text-sm text-orange-600">Buts</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{liveMatches.length}</div>
            <div className="text-sm text-red-600">En direct</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-700">{upcomingMatches.length}</div>
            <div className="text-sm text-gray-600">À venir</div>
          </div>
        </div>
      </div>

      {/* Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 text-blue-500 mr-2" />
            Outils Rapides
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowBulkOps(true)}
              className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Upload className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Import/Export en masse</span>
              </div>
              <span className="text-blue-600">→</span>
            </button>

            <button
              onClick={() => setActiveView('analytics')}
              className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Analyses avancées</span>
              </div>
              <span className="text-green-600">→</span>
            </button>

            <button
              onClick={() => setActiveView('players')}
              className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">Gestion des joueurs</span>
              </div>
              <span className="text-purple-600">→</span>
            </button>

            {onBack && (
              <button
                onClick={onBack}
                className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Outils de création</span>
                </div>
                <span className="text-orange-600">→</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            Activité Récente
          </h3>
          
          <div className="space-y-3">
            {currentTournament.matches
              .filter(m => m.status === 'finished')
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .slice(0, 5)
              .map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {match.homeTeam.name} vs {match.awayTeam.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {match.date.toLocaleDateString('fr-FR')} • {match.venue}
                    </div>
                  </div>
                  {match.score && (
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold text-sm">
                      {match.score.home} - {match.score.away}
                    </div>
                  )}
                </div>
              ))}
            
            {finishedMatches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 text-green-500 mr-2" />
            Prochains Matchs ({upcomingMatches.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMatches.slice(0, 6).map((match) => (
              <div key={match.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="font-medium text-gray-900 mb-2">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {match.date.toLocaleDateString('fr-FR')} à {match.date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                </div>
                <button
                  onClick={() => {
                    setSelectedMatch(match.id);
                    setActiveView('live');
                  }}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Gérer le match
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderLiveControl = () => {
    const match = selectedMatch 
      ? currentTournament.matches.find(m => m.id === selectedMatch)
      : liveMatches[0] || upcomingMatches[0];

    if (!match) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-12">
          <div className="text-center">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun match disponible
            </h3>
            <p className="text-gray-500">
              Aucun match en cours ou à venir pour le moment
            </p>
          </div>
        </div>
      );
    }

    return <MatchLiveControl match={match} onUpdateMatch={handleUpdateMatch} />;
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour aux outils de création</span>
        </button>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="h-7 w-7 text-orange-600 mr-3" />
              Tableau de Bord Administrateur
            </h1>
            <p className="text-gray-600 mt-1">
              Gestion complète du {currentTournament.name}
            </p>
          </div>
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-medium">
            Mode Administrateur
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { key: 'analytics', label: 'Analyses', icon: TrendingUp },
            { key: 'players', label: 'Joueurs', icon: Users },
            { key: 'live', label: 'Contrôle Live', icon: Clock },
            { key: 'bulk', label: 'Import/Export', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeView === tab.key
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeView === 'overview' && renderOverview()}
      {activeView === 'analytics' && <TournamentAnalytics tournament={currentTournament} />}
      {activeView === 'players' && (
        <PlayerManagement 
          onPlayerUpdate={handlePlayerUpdate}
          onPlayerDelete={handlePlayerDelete}
        />
      )}
      {activeView === 'live' && renderLiveControl()}
      {activeView === 'bulk' && showBulkOps && (
        <BulkOperations onClose={() => setShowBulkOps(false)} />
      )}

      {/* Modals */}
      {showSettings && (
        <TournamentSettings
          tournament={currentTournament}
          onUpdate={handleTournamentUpdate}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};