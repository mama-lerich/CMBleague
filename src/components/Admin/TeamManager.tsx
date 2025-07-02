import React, { useState } from 'react';
import { Users, Plus, Edit, X, Save, Upload, Download, Shuffle } from 'lucide-react';
import { Team, Player } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface TeamManagerProps {
  onClose: () => void;
}

export const TeamManager: React.FC<TeamManagerProps> = ({ onClose }) => {
  const { currentTournament, setCurrentTournament, tournaments, setTournaments } = useApp();
  const [activeTab, setActiveTab] = useState<'create' | 'assign' | 'manage'>('create');
  const [showSuccess, setShowSuccess] = useState(false);

  // Team creation form
  const [teamForm, setTeamForm] = useState({
    name: '',
    coach: '',
    homeVenue: '',
    founded: new Date().getFullYear(),
    colors: { primary: '#16A34A', secondary: '#FFFFFF' }
  });

  // Player creation form
  const [playerForm, setPlayerForm] = useState({
    name: '',
    number: 1,
    position: 'Attaquant',
    age: 20,
    height: 175,
    weight: 70,
    nationality: 'Haiti'
  });

  const [selectedTeamForPlayer, setSelectedTeamForPlayer] = useState('');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  if (!currentTournament) return null;

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCreateTeam = () => {
    if (!teamForm.name) {
      alert('Veuillez saisir le nom de l\'équipe');
      return;
    }

    const newTeam: Team = {
      id: Date.now().toString(),
      name: teamForm.name,
      group: 'A', // Default group, can be changed later
      coach: teamForm.coach,
      founded: teamForm.founded,
      homeVenue: teamForm.homeVenue,
      colors: teamForm.colors,
      players: [],
      stats: {
        points: 0,
        gamesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        form: []
      }
    };

    const updatedTournament = {
      ...currentTournament,
      teams: [...currentTournament.teams, newTeam]
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
    
    // Reset form
    setTeamForm({
      name: '',
      coach: '',
      homeVenue: '',
      founded: new Date().getFullYear(),
      colors: { primary: '#16A34A', secondary: '#FFFFFF' }
    });

    showSuccessMessage();
  };

  const handleCreatePlayer = () => {
    if (!playerForm.name || !selectedTeamForPlayer) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Check if number is already taken in the team
    const team = currentTournament.teams.find(t => t.id === selectedTeamForPlayer);
    if (team?.players.some(p => p.number === playerForm.number)) {
      alert('Ce numéro est déjà pris dans cette équipe');
      return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: playerForm.name,
      number: playerForm.number,
      position: playerForm.position,
      teamId: selectedTeamForPlayer,
      age: playerForm.age,
      height: playerForm.height,
      weight: playerForm.weight,
      nationality: playerForm.nationality,
      stats: {
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        gamesPlayed: 0,
        minutesPlayed: 0
      }
    };

    const updatedTeams = currentTournament.teams.map(team => 
      team.id === selectedTeamForPlayer 
        ? { ...team, players: [...team.players, newPlayer] }
        : team
    );

    const updatedTournament = {
      ...currentTournament,
      teams: updatedTeams
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));

    // Reset form
    setPlayerForm({
      name: '',
      number: playerForm.number + 1,
      position: 'Attaquant',
      age: 20,
      height: 175,
      weight: 70,
      nationality: 'Haiti'
    });

    showSuccessMessage();
  };

  const handleAssignTeamToGroup = (teamId: string, group: string) => {
    const updatedTeams = currentTournament.teams.map(team => 
      team.id === teamId ? { ...team, group } : team
    );

    const updatedTournament = {
      ...currentTournament,
      teams: updatedTeams
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
    showSuccessMessage();
  };

  const handleAutoAssignTeams = () => {
    const teams = [...currentTournament.teams];
    const groups = currentTournament.groups;
    const teamsPerGroup = Math.ceil(teams.length / groups.length);

    // Shuffle teams for random assignment
    for (let i = teams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [teams[i], teams[j]] = [teams[j], teams[i]];
    }

    // Assign teams to groups
    const updatedTeams = teams.map((team, index) => ({
      ...team,
      group: groups[Math.floor(index / teamsPerGroup)]
    }));

    const updatedTournament = {
      ...currentTournament,
      teams: updatedTeams
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
    showSuccessMessage();
  };

  const handleDeleteTeam = (teamId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
      const updatedTournament = {
        ...currentTournament,
        teams: currentTournament.teams.filter(t => t.id !== teamId),
        matches: currentTournament.matches.filter(m => 
          m.homeTeam.id !== teamId && m.awayTeam.id !== teamId
        )
      };

      setCurrentTournament(updatedTournament);
      setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
      showSuccessMessage();
    }
  };

  const handleDeletePlayer = (playerId: string, teamId: string) => {
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
      showSuccessMessage();
    }
  };

  const renderCreateTab = () => (
    <div className="space-y-8">
      {/* Create Team */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Users className="h-6 w-6 text-green-500 mr-2" />
          Créer une Nouvelle Équipe
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'équipe *
            </label>
            <input
              type="text"
              value={teamForm.name}
              onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
              placeholder="Les Lions FC"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entraîneur
            </label>
            <input
              type="text"
              value={teamForm.coach}
              onChange={(e) => setTeamForm({...teamForm, coach: e.target.value})}
              placeholder="Didier Konaté"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stade domicile
            </label>
            <input
              type="text"
              value={teamForm.homeVenue}
              onChange={(e) => setTeamForm({...teamForm, homeVenue: e.target.value})}
              placeholder="Stade Municipal"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Année de fondation
            </label>
            <input
              type="number"
              value={teamForm.founded}
              onChange={(e) => setTeamForm({...teamForm, founded: parseInt(e.target.value)})}
              min="1900"
              max={new Date().getFullYear()}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur principale
            </label>
            <input
              type="color"
              value={teamForm.colors.primary}
              onChange={(e) => setTeamForm({...teamForm, colors: {...teamForm.colors, primary: e.target.value}})}
              className="w-full h-10 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur secondaire
            </label>
            <input
              type="color"
              value={teamForm.colors.secondary}
              onChange={(e) => setTeamForm({...teamForm, colors: {...teamForm.colors, secondary: e.target.value}})}
              className="w-full h-10 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={handleCreateTeam}
          className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Créer l'Équipe</span>
        </button>
      </div>

      {/* Create Player */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Users className="h-6 w-6 text-blue-500 mr-2" />
          Ajouter un Joueur
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Équipe *
            </label>
            <select
              value={selectedTeamForPlayer}
              onChange={(e) => setSelectedTeamForPlayer(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choisir une équipe</option>
              {currentTournament.teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du joueur *
            </label>
            <input
              type="text"
              value={playerForm.name}
              onChange={(e) => setPlayerForm({...playerForm, name: e.target.value})}
              placeholder="Jean-Baptiste Koné"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro *
            </label>
            <input
              type="number"
              value={playerForm.number}
              onChange={(e) => setPlayerForm({...playerForm, number: parseInt(e.target.value)})}
              min="1"
              max="99"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <select
              value={playerForm.position}
              onChange={(e) => setPlayerForm({...playerForm, position: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Gardien">Gardien</option>
              <option value="Défenseur">Défenseur</option>
              <option value="Milieu">Milieu</option>
              <option value="Attaquant">Attaquant</option>
              <option value="Ailier">Ailier</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Âge
            </label>
            <input
              type="number"
              value={playerForm.age}
              onChange={(e) => setPlayerForm({...playerForm, age: parseInt(e.target.value)})}
              min="16"
              max="45"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nationalité
            </label>
            <input
              type="text"
              value={playerForm.nationality}
              onChange={(e) => setPlayerForm({...playerForm, nationality: e.target.value})}
              placeholder="Haiti"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleCreatePlayer}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter le Joueur</span>
        </button>
      </div>
    </div>
  );

  const renderAssignTab = () => (
    <div className="space-y-6">
      {/* Auto Assignment */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Shuffle className="h-6 w-6 text-purple-500 mr-2" />
            Attribution Automatique
          </h3>
          <button
            onClick={handleAutoAssignTeams}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Shuffle className="h-4 w-4" />
            <span>Répartir Automatiquement</span>
          </button>
        </div>
        <p className="text-gray-600">
          Répartit automatiquement toutes les équipes de manière équilibrée dans les groupes disponibles.
        </p>
      </div>

      {/* Manual Assignment */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Attribution Manuelle par Groupe
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentTournament.groups.map(group => {
            const groupTeams = currentTournament.teams.filter(t => t.group === group);
            const availableTeams = currentTournament.teams.filter(t => t.group !== group);
            
            return (
              <div key={group} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg">Groupe {group}</h4>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {groupTeams.length}/{currentTournament.maxTeamsPerGroup}
                  </span>
                </div>
                
                {/* Teams in group */}
                <div className="space-y-2 mb-4">
                  {groupTeams.map(team => (
                    <div key={team.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="font-medium">{team.name}</span>
                      <button
                        onClick={() => handleAssignTeamToGroup(team.id, '')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Add team to group */}
                {groupTeams.length < currentTournament.maxTeamsPerGroup && availableTeams.length > 0 && (
                  <select
                    onChange={(e) => e.target.value && handleAssignTeamToGroup(e.target.value, group)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    value=""
                  >
                    <option value="">Ajouter une équipe...</option>
                    {availableTeams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderManageTab = () => (
    <div className="space-y-6">
      {/* Teams List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Équipes Existantes ({currentTournament.teams.length})
        </h3>
        
        <div className="space-y-4">
          {currentTournament.teams.map(team => (
            <div key={team.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-lg">{team.name}</h4>
                  <p className="text-sm text-gray-600">
                    Groupe {team.group} • {team.players.length} joueurs
                    {team.coach && ` • Coach: ${team.coach}`}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingTeam(team)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Players */}
              {team.players.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Joueurs:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {team.players.map(player => (
                      <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <span>#{player.number} {player.name}</span>
                        <button
                          onClick={() => handleDeletePlayer(player.id, team.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 z-10">
            <Save className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Opération réussie !</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 text-green-500 mr-2" />
            Gestion des Équipes et Joueurs
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-6 border-b border-gray-200">
          {[
            { key: 'create', label: 'Créer', icon: Plus },
            { key: 'assign', label: 'Assigner', icon: Shuffle },
            { key: 'manage', label: 'Gérer', icon: Edit }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'create' && renderCreateTab()}
          {activeTab === 'assign' && renderAssignTab()}
          {activeTab === 'manage' && renderManageTab()}
        </div>
      </div>
    </div>
  );
};