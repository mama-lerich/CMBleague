import React, { useState } from 'react';
import { Settings, Plus, Users, Calendar, Trophy, Edit, Save, X, Check, AlertCircle, Shuffle, Target, Camera, Archive, Database, Play, Clock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Team, Player, Match, Tournament } from '../../types';
import { AdminDashboard } from './AdminDashboard';
import { TournamentCreator } from './TournamentCreator';
import { TeamManager } from './TeamManager';
import { MatchScheduler } from './MatchScheduler';
import { GroupManager } from './GroupManager';
import { PlayerManagement } from './PlayerManagement';
import { GalleryManager } from './GalleryManager';
import { ArchiveManager } from './ArchiveManager';
import { SimpleImportExport } from './SimpleImportExport';
import { MatchManager } from './MatchManager';

export const Admin: React.FC = () => {
  const { currentTournament, userRole, setCurrentTournament, tournaments, setTournaments } = useApp();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'create' | 'tournaments' | 'teams' | 'matches' | 'players' | 'groups' | 'gallery' | 'archives' | 'import-export' | 'live-matches'>('create');
  const [showTournamentCreator, setShowTournamentCreator] = useState(false);
  const [showTeamManager, setShowTeamManager] = useState(false);
  const [showMatchScheduler, setShowMatchScheduler] = useState(false);
  const [showGroupManager, setShowGroupManager] = useState(false);
  const [showGalleryManager, setShowGalleryManager] = useState(false);
  const [showArchiveManager, setShowArchiveManager] = useState(false);
  const [showImportExportManager, setShowImportExportManager] = useState(false);
  const [showMatchManager, setShowMatchManager] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeleteTournament = (tournamentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce tournoi ? Cette action est irréversible.')) {
      const updatedTournaments = tournaments.filter(t => t.id !== tournamentId);
      setTournaments(updatedTournaments);
      
      if (currentTournament?.id === tournamentId) {
        setCurrentTournament(updatedTournaments.length > 0 ? updatedTournaments[0] : null);
      }
      
      showSuccessMessage();
    }
  };

  const handleDuplicateTournament = (tournament: Tournament) => {
    const newTournament: Tournament = {
      ...tournament,
      id: Date.now().toString(),
      name: `${tournament.name} (Copie)`,
      year: new Date().getFullYear(),
      status: 'upcoming',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
      teams: [],
      matches: []
    };

    setTournaments([...tournaments, newTournament]);
    showSuccessMessage();
  };

  const handlePlayerUpdate = (updatedPlayer: Player) => {
    if (!currentTournament) return;
    
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
    if (!currentTournament) return;
    
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

  // If dashboard is selected, show the AdminDashboard component with back button
  if (activeSection === 'dashboard') {
    return <AdminDashboard onBack={() => setActiveSection('create')} />;
  }

  // If players section is selected, show PlayerManagement
  if (activeSection === 'players') {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setActiveSection('create')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg"
        >
          <X className="h-5 w-5" />
          <span>Retour aux outils de création</span>
        </button>

        <PlayerManagement 
          onPlayerUpdate={handlePlayerUpdate}
          onPlayerDelete={handlePlayerDelete}
        />
      </div>
    );
  }

  const renderCreationTools = () => (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">Opération réussie !</span>
        </div>
      )}

      {/* Main Creation Tools */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Plus className="h-7 w-7 text-green-500 mr-3" />
          Outils de Création Principaux
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => setShowTournamentCreator(true)}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-xl hover:shadow-xl transition-all duration-200 text-left group"
          >
            <Trophy className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xl mb-2">Nouveau Tournoi</div>
            <div className="text-sm opacity-90">Créer une nouvelle édition complète</div>
          </button>

          <button
            onClick={() => setShowGroupManager(true)}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-xl hover:shadow-xl transition-all duration-200 text-left group"
          >
            <Target className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xl mb-2">Gérer Groupes</div>
            <div className="text-sm opacity-90">Créer et organiser les groupes</div>
          </button>

          <button
            onClick={() => setShowTeamManager(true)}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-xl hover:shadow-xl transition-all duration-200 text-left group"
          >
            <Users className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xl mb-2">Gérer Équipes</div>
            <div className="text-sm opacity-90">Créer équipes et joueurs</div>
          </button>

          <button
            onClick={() => setShowMatchScheduler(true)}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-xl hover:shadow-xl transition-all duration-200 text-left group"
          >
            <Calendar className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xl mb-2">Planifier Matchs</div>
            <div className="text-sm opacity-90">Créer calendrier complet</div>
          </button>

          <button
            onClick={() => setActiveSection('players')}
            className="bg-gradient-to-br from-red-500 to-red-600 text-white p-8 rounded-xl hover:shadow-xl transition-all duration-200 text-left group"
          >
            <Users className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xl mb-2">Gérer Joueurs</div>
            <div className="text-sm opacity-90">Ajouter et modifier joueurs</div>
          </button>

          <button
            onClick={() => setActiveSection('dashboard')}
            className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-8 rounded-xl hover:shadow-xl transition-all duration-200 text-left group"
          >
            <Settings className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xl mb-2">Tableau de Bord</div>
            <div className="text-sm opacity-90">Analyses et contrôles avancés</div>
          </button>
        </div>
      </div>

      {/* Live Management Tools */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Play className="h-7 w-7 text-red-500 mr-3" />
          Gestion en Direct
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setShowMatchManager(true)}
            className="bg-gradient-to-br from-red-500 to-red-600 text-white p-8 rounded-xl hover:shadow-xl transition-all duration-200 text-left group"
          >
            <Play className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xl mb-2">Contrôle des Matchs</div>
            <div className="text-sm opacity-90">Gérer les matchs en direct</div>
          </button>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-8 rounded-xl">
            <Clock className="h-12 w-12 mb-4" />
            <div className="font-bold text-xl mb-2">Matchs en Direct</div>
            <div className="text-sm opacity-90">
              {currentTournament?.matches.filter(m => m.status === 'live').length || 0} match(s) en cours
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Tools */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Settings className="h-7 w-7 text-blue-500 mr-3" />
          Outils Avancés
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => setShowGalleryManager(true)}
            className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-8 rounded-xl hover:shadow-xl transition-all duration-200 text-left group"
          >
            <Camera className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xl mb-2">Gérer Galerie</div>
            <div className="text-sm opacity-90">Ajouter photos et vidéos</div>
          </button>

          <button
            onClick={() => setShowArchiveManager(true)}
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-8 rounded-xl hover:shadow-xl transition-all duration-200 text-left group"
          >
            <Archive className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xl mb-2">Gérer Archives</div>
            <div className="text-sm opacity-90">Consulter tournois passés</div>
          </button>

          <button
            onClick={() => setShowImportExportManager(true)}
            className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-8 rounded-xl hover:shadow-xl transition-all duration-200 text-left group"
          >
            <Database className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xl mb-2">Import/Export CSV</div>
            <div className="text-sm opacity-90">Import simple avec modèles</div>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
            Actions Rapides - Tournois
          </h4>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowTournamentCreator(true)}
              className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Plus className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Créer un nouveau tournoi</span>
              </div>
              <span className="text-green-600">→</span>
            </button>

            {currentTournament && (
              <button
                onClick={() => {
                  setEditingTournament(currentTournament);
                  setShowTournamentCreator(true);
                }}
                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Edit className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Modifier le tournoi actuel</span>
                </div>
                <span className="text-blue-600">→</span>
              </button>
            )}

            <button
              onClick={() => setShowImportExportManager(true)}
              className="w-full flex items-center justify-between p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-teal-600" />
                <span className="font-medium text-teal-900">Import/Export CSV simple</span>
              </div>
              <span className="text-teal-600">→</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Play className="h-6 w-6 text-red-500 mr-2" />
            Actions Rapides - Live
          </h4>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowMatchManager(true)}
              className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Play className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">Contrôler les matchs</span>
              </div>
              <span className="text-red-600">→</span>
            </button>

            <button
              onClick={() => setShowGalleryManager(true)}
              className="w-full flex items-center justify-between p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Camera className="h-5 w-5 text-pink-600" />
                <span className="font-medium text-pink-900">Ajouter photos/vidéos</span>
              </div>
              <span className="text-pink-600">→</span>
            </button>

            <button
              onClick={() => setActiveSection('players')}
              className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Gestion avancée joueurs</span>
              </div>
              <span className="text-blue-600">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Current Tournament Status */}
      {currentTournament && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Trophy className="h-6 w-6 text-blue-500 mr-2" />
            Tournoi Actuel - {currentTournament.name}
          </h4>
          
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900">{currentTournament.teams.length}</div>
                <div className="text-sm text-blue-600">Équipes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900">{currentTournament.matches.length}</div>
                <div className="text-sm text-blue-600">Matchs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900">{currentTournament.groups.length}</div>
                <div className="text-sm text-blue-600">Groupes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900">
                  {currentTournament.teams.reduce((sum, team) => sum + team.players.length, 0)}
                </div>
                <div className="text-sm text-blue-600">Joueurs</div>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setEditingTournament(currentTournament);
                  setShowTournamentCreator(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={() => setShowGroupManager(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Gérer Groupes
              </button>
              <button
                onClick={() => setShowTeamManager(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Gérer Équipes
              </button>
              <button
                onClick={() => setShowMatchScheduler(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Gérer Matchs
              </button>
              <button
                onClick={() => setShowMatchManager(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Contrôle Live
              </button>
              <button
                onClick={() => setActiveSection('players')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Gérer Joueurs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTournamentManagement = () => (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">Opération réussie !</span>
        </div>
      )}

      {/* Tournament List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Tous les Tournois ({tournaments.length})
          </h3>
          <button
            onClick={() => setShowTournamentCreator(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Tournoi</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-semibold text-gray-900">{tournament.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    tournament.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tournament.status === 'upcoming' ? 'À venir' :
                     tournament.status === 'ongoing' ? 'En cours' : 'Terminé'}
                  </span>
                  {currentTournament?.id === tournament.id && (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                      Actuel
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {tournament.year} • {tournament.teams.length} équipes • {tournament.matches.length} matchs
                  {tournament.location && ` • ${tournament.location}`}
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setCurrentTournament(tournament)}
                  className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded text-sm font-medium"
                >
                  Sélectionner
                </button>
                <button 
                  onClick={() => {
                    setEditingTournament(tournament);
                    setShowTournamentCreator(true);
                  }}
                  className="text-green-600 hover:text-green-800 px-3 py-1 rounded text-sm font-medium"
                >
                  Modifier
                </button>
                <button 
                  onClick={() => handleDuplicateTournament(tournament)}
                  className="text-purple-600 hover:text-purple-800 px-3 py-1 rounded text-sm font-medium"
                >
                  Dupliquer
                </button>
                <button 
                  onClick={() => handleDeleteTournament(tournament.id)}
                  className="text-red-600 hover:text-red-800 px-3 py-1 rounded text-sm font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          
          {tournaments.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 mb-2">
                Aucun tournoi créé
              </h4>
              <p className="text-gray-500 mb-4">
                Créez votre premier tournoi pour commencer
              </p>
              <button
                onClick={() => setShowTournamentCreator(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Créer un Tournoi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="h-7 w-7 text-orange-600 mr-3" />
              Administration Complète
            </h1>
            <p className="text-gray-600 mt-1">
              Gestion complète des tournois, équipes, joueurs, galerie et archives
            </p>
          </div>
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-medium">
            Mode Administrateur
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1">
          {[
            { key: 'create', label: 'Créer', icon: Plus },
            { key: 'dashboard', label: 'Tableau de Bord', icon: Settings },
            { key: 'tournaments', label: 'Tournois', icon: Trophy },
            { key: 'players', label: 'Joueurs', icon: Target },
            { key: 'gallery', label: 'Galerie', icon: Camera },
            { key: 'archives', label: 'Archives', icon: Archive },
            { key: 'import-export', label: 'Import/Export', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === 'gallery') {
                    setShowGalleryManager(true);
                  } else if (tab.key === 'archives') {
                    setShowArchiveManager(true);
                  } else if (tab.key === 'import-export') {
                    setShowImportExportManager(true);
                  } else {
                    setActiveSection(tab.key as any);
                  }
                }}
                className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === tab.key
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeSection === 'create' && renderCreationTools()}
      {activeSection === 'tournaments' && renderTournamentManagement()}

      {/* Modals */}
      {showTournamentCreator && (
        <TournamentCreator
          onClose={() => {
            setShowTournamentCreator(false);
            setEditingTournament(null);
          }}
          editingTournament={editingTournament}
        />
      )}

      {showTeamManager && (
        <TeamManager onClose={() => setShowTeamManager(false)} />
      )}

      {showMatchScheduler && (
        <MatchScheduler onClose={() => setShowMatchScheduler(false)} />
      )}

      {showGroupManager && (
        <GroupManager onClose={() => setShowGroupManager(false)} />
      )}

      {showGalleryManager && (
        <GalleryManager onClose={() => setShowGalleryManager(false)} />
      )}

      {showArchiveManager && (
        <ArchiveManager onClose={() => setShowArchiveManager(false)} />
      )}

      {showImportExportManager && (
        <SimpleImportExport onClose={() => setShowImportExportManager(false)} />
      )}

      {showMatchManager && (
        <MatchManager onClose={() => setShowMatchManager(false)} />
      )}
    </div>
  );
};