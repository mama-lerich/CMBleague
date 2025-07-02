import React, { useState } from 'react';
import { Users, Plus, Edit, X, Search, Filter, Download, Upload, Target, Award } from 'lucide-react';
import { Player, Team } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface PlayerManagementProps {
  onPlayerUpdate: (player: Player) => void;
  onPlayerDelete: (playerId: string, teamId: string) => void;
}

export const PlayerManagement: React.FC<PlayerManagementProps> = ({
  onPlayerUpdate,
  onPlayerDelete
}) => {
  const { currentTournament, setCurrentTournament, tournaments, setTournaments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  // New player form
  const [newPlayerForm, setNewPlayerForm] = useState({
    name: '',
    number: 1,
    position: 'Attaquant',
    teamId: '',
    age: 20,
    height: 175,
    weight: 70,
    nationality: 'Haiti'
  });

  if (!currentTournament) return null;

  const allPlayers = currentTournament.teams.flatMap(team => 
    team.players.map(player => ({ ...player, teamName: team.name }))
  );

  const filteredPlayers = allPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.number.toString().includes(searchTerm);
    const matchesTeam = selectedTeam === 'all' || player.teamId === selectedTeam;
    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
    
    return matchesSearch && matchesTeam && matchesPosition;
  });

  const positions = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant', 'Ailier'];

  const handleAddPlayer = () => {
    if (!newPlayerForm.name || !newPlayerForm.teamId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Check if number is already taken in the team
    const team = currentTournament.teams.find(t => t.id === newPlayerForm.teamId);
    if (team?.players.some(p => p.number === newPlayerForm.number)) {
      alert('Ce numéro est déjà pris dans cette équipe');
      return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newPlayerForm.name,
      number: newPlayerForm.number,
      position: newPlayerForm.position,
      teamId: newPlayerForm.teamId,
      age: newPlayerForm.age,
      height: newPlayerForm.height,
      weight: newPlayerForm.weight,
      nationality: newPlayerForm.nationality,
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
      team.id === newPlayerForm.teamId 
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
    setNewPlayerForm({
      name: '',
      number: newPlayerForm.number + 1,
      position: 'Attaquant',
      teamId: newPlayerForm.teamId,
      age: 20,
      height: 175,
      weight: 70,
      nationality: 'Haiti'
    });

    setShowAddPlayer(false);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
  };

  const handleSavePlayer = () => {
    if (editingPlayer) {
      onPlayerUpdate(editingPlayer);
      setEditingPlayer(null);
    }
  };

  const handleExportPlayers = () => {
    const csvContent = [
      ['Nom', 'Numéro', 'Position', 'Équipe', 'Âge', 'Taille', 'Poids', 'Nationalité', 'Buts', 'Passes'],
      ...filteredPlayers.map(player => [
        player.name,
        player.number,
        player.position,
        player.teamName,
        player.age || '',
        player.height || '',
        player.weight || '',
        player.nationality || '',
        player.stats.goals,
        player.stats.assists
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `joueurs_${currentTournament.name.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Users className="h-6 w-6 text-purple-500 mr-2" />
              Gestion Avancée des Joueurs
            </h2>
            <p className="text-gray-600 mt-1">
              {filteredPlayers.length} joueur{filteredPlayers.length !== 1 ? 's' : ''} trouvé{filteredPlayers.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddPlayer(true)}
              className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter</span>
            </button>
            <button
              onClick={handleExportPlayers}
              className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </button>
            <button
              onClick={() => setShowBulkImport(true)}
              className="flex items-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un joueur..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Toutes les équipes</option>
            {currentTournament.teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>

          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tous les postes</option>
            {positions.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedTeam('all');
              setSelectedPosition('all');
            }}
            className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joueur</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Équipe</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Position</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Âge</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Buts</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Passes</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Cartons</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-purple-700">#{player.number}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{player.name}</div>
                        <div className="text-sm text-gray-600">{player.nationality}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{player.teamName}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      player.position === 'Gardien' ? 'bg-yellow-100 text-yellow-800' :
                      player.position === 'Défenseur' ? 'bg-blue-100 text-blue-800' :
                      player.position === 'Milieu' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {player.position}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-900">
                    {player.age || '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-green-600">{player.stats.goals}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-blue-600">{player.stats.assists}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-4 bg-yellow-400 rounded"></div>
                        <span className="text-sm">{player.stats.yellowCards}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-4 bg-red-500 rounded"></div>
                        <span className="text-sm">{player.stats.redCards}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEditPlayer(player)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onPlayerDelete(player.id, player.teamId)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun joueur trouvé</p>
          </div>
        )}
      </div>

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Ajouter un Nouveau Joueur
              </h3>
              <button
                onClick={() => setShowAddPlayer(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Équipe *
                  </label>
                  <select
                    value={newPlayerForm.teamId}
                    onChange={(e) => setNewPlayerForm({...newPlayerForm, teamId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Choisir une équipe</option>
                    {currentTournament.teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={newPlayerForm.name}
                    onChange={(e) => setNewPlayerForm({...newPlayerForm, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro *
                  </label>
                  <input
                    type="number"
                    value={newPlayerForm.number}
                    onChange={(e) => setNewPlayerForm({...newPlayerForm, number: parseInt(e.target.value)})}
                    min="1"
                    max="99"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <select
                    value={newPlayerForm.position}
                    onChange={(e) => setNewPlayerForm({...newPlayerForm, position: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {positions.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Âge
                  </label>
                  <input
                    type="number"
                    value={newPlayerForm.age}
                    onChange={(e) => setNewPlayerForm({...newPlayerForm, age: parseInt(e.target.value)})}
                    min="16"
                    max="45"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationalité
                  </label>
                  <input
                    type="text"
                    value={newPlayerForm.nationality}
                    onChange={(e) => setNewPlayerForm({...newPlayerForm, nationality: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddPlayer(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddPlayer}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Ajouter le Joueur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Modifier le Joueur
              </h3>
              <button
                onClick={() => setEditingPlayer(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={editingPlayer.name}
                    onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro
                  </label>
                  <input
                    type="number"
                    value={editingPlayer.number}
                    onChange={(e) => setEditingPlayer({...editingPlayer, number: parseInt(e.target.value)})}
                    min="1"
                    max="99"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <select
                    value={editingPlayer.position}
                    onChange={(e) => setEditingPlayer({...editingPlayer, position: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {positions.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Âge
                  </label>
                  <input
                    type="number"
                    value={editingPlayer.age || ''}
                    onChange={(e) => setEditingPlayer({...editingPlayer, age: parseInt(e.target.value) || undefined})}
                    min="16"
                    max="45"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Statistics */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Statistiques</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buts
                    </label>
                    <input
                      type="number"
                      value={editingPlayer.stats.goals}
                      onChange={(e) => setEditingPlayer({
                        ...editingPlayer,
                        stats: {...editingPlayer.stats, goals: parseInt(e.target.value) || 0}
                      })}
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passes
                    </label>
                    <input
                      type="number"
                      value={editingPlayer.stats.assists}
                      onChange={(e) => setEditingPlayer({
                        ...editingPlayer,
                        stats: {...editingPlayer.stats, assists: parseInt(e.target.value) || 0}
                      })}
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cartons jaunes
                    </label>
                    <input
                      type="number"
                      value={editingPlayer.stats.yellowCards}
                      onChange={(e) => setEditingPlayer({
                        ...editingPlayer,
                        stats: {...editingPlayer.stats, yellowCards: parseInt(e.target.value) || 0}
                      })}
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cartons rouges
                    </label>
                    <input
                      type="number"
                      value={editingPlayer.stats.redCards}
                      onChange={(e) => setEditingPlayer({
                        ...editingPlayer,
                        stats: {...editingPlayer.stats, redCards: parseInt(e.target.value) || 0}
                      })}
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setEditingPlayer(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSavePlayer}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};