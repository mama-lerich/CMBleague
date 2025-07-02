import React, { useState } from 'react';
import { Users, Plus, Edit, X, Save, Shuffle, AlertCircle, Check } from 'lucide-react';
import { Team } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface GroupManagerProps {
  onClose: () => void;
}

export const GroupManager: React.FC<GroupManagerProps> = ({ onClose }) => {
  const { currentTournament, setCurrentTournament, tournaments, setTournaments } = useApp();
  const [activeTab, setActiveTab] = useState<'create' | 'assign' | 'manage'>('create');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Group creation
  const [newGroupName, setNewGroupName] = useState('');
  const [groupCount, setGroupCount] = useState(4);
  
  // Group assignment
  const [draggedTeam, setDraggedTeam] = useState<Team | null>(null);

  if (!currentTournament) return null;

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCreateGroups = () => {
    const newGroups = Array.from({ length: groupCount }, (_, i) => 
      String.fromCharCode(65 + i) // A, B, C, D...
    );

    const updatedTournament = {
      ...currentTournament,
      groups: newGroups
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
    showSuccessMessage();
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      alert('Veuillez saisir un nom de groupe');
      return;
    }

    if (currentTournament.groups.includes(newGroupName.toUpperCase())) {
      alert('Ce groupe existe déjà');
      return;
    }

    const updatedTournament = {
      ...currentTournament,
      groups: [...currentTournament.groups, newGroupName.toUpperCase()]
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
    setNewGroupName('');
    showSuccessMessage();
  };

  const handleDeleteGroup = (groupName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le groupe ${groupName} ?`)) {
      // Move teams from deleted group to first available group
      const remainingGroups = currentTournament.groups.filter(g => g !== groupName);
      const updatedTeams = currentTournament.teams.map(team => 
        team.group === groupName 
          ? { ...team, group: remainingGroups[0] || 'A' }
          : team
      );

      const updatedTournament = {
        ...currentTournament,
        groups: remainingGroups,
        teams: updatedTeams
      };

      setCurrentTournament(updatedTournament);
      setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
      showSuccessMessage();
    }
  };

  const handleAssignTeamToGroup = (teamId: string, groupName: string) => {
    const updatedTeams = currentTournament.teams.map(team => 
      team.id === teamId ? { ...team, group: groupName } : team
    );

    const updatedTournament = {
      ...currentTournament,
      teams: updatedTeams
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
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

  const renderCreateTab = () => (
    <div className="space-y-6">
      {/* Quick Group Creation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Plus className="h-6 w-6 text-green-500 mr-2" />
          Création Rapide de Groupes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de groupes
            </label>
            <select
              value={groupCount}
              onChange={(e) => setGroupCount(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="2">2 groupes (A, B)</option>
              <option value="3">3 groupes (A, B, C)</option>
              <option value="4">4 groupes (A, B, C, D)</option>
              <option value="6">6 groupes (A, B, C, D, E, F)</option>
              <option value="8">8 groupes (A, B, C, D, E, F, G, H)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleCreateGroups}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Créer les Groupes
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">Aperçu des groupes à créer:</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: groupCount }, (_, i) => (
              <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                Groupe {String.fromCharCode(65 + i)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Group Addition */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Edit className="h-6 w-6 text-blue-500 mr-2" />
          Ajouter un Groupe Personnalisé
        </h3>
        
        <div className="flex space-x-4">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value.toUpperCase())}
            placeholder="Nom du groupe (ex: E, F, G...)"
            maxLength={1}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddGroup}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Ajouter
          </button>
        </div>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                <div className="space-y-2 mb-4 min-h-[120px]">
                  {groupTeams.map(team => (
                    <div 
                      key={team.id} 
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-move"
                      draggable
                      onDragStart={() => setDraggedTeam(team)}
                    >
                      <span className="font-medium">{team.name}</span>
                      <button
                        onClick={() => handleAssignTeamToGroup(team.id, '')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {groupTeams.length === 0 && (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                      Aucune équipe assignée
                    </div>
                  )}
                </div>
                
                {/* Drop zone */}
                <div
                  className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center text-blue-600 hover:bg-blue-50 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedTeam && groupTeams.length < currentTournament.maxTeamsPerGroup) {
                      handleAssignTeamToGroup(draggedTeam.id, group);
                      setDraggedTeam(null);
                    }
                  }}
                >
                  Glissez une équipe ici
                </div>
                
                {/* Add team dropdown */}
                {groupTeams.length < currentTournament.maxTeamsPerGroup && availableTeams.length > 0 && (
                  <select
                    onChange={(e) => e.target.value && handleAssignTeamToGroup(e.target.value, group)}
                    className="w-full mt-2 border border-gray-300 rounded px-3 py-2 text-sm"
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

      {/* Unassigned Teams */}
      {currentTournament.teams.filter(t => !t.group || t.group === '').length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-6 w-6 text-orange-500 mr-2" />
            Équipes Non Assignées
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentTournament.teams
              .filter(t => !t.group || t.group === '')
              .map(team => (
                <div 
                  key={team.id}
                  className="p-3 bg-orange-50 rounded-lg cursor-move border border-orange-200"
                  draggable
                  onDragStart={() => setDraggedTeam(team)}
                >
                  <span className="font-medium text-orange-900">{team.name}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderManageTab = () => (
    <div className="space-y-6">
      {/* Current Groups */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Groupes Existants ({currentTournament.groups.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTournament.groups.map(group => {
            const groupTeams = currentTournament.teams.filter(t => t.group === group);
            
            return (
              <div key={group} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-lg">Groupe {group}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {groupTeams.length} équipes
                    </span>
                    <button
                      onClick={() => handleDeleteGroup(group)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {groupTeams.map(team => (
                    <div key={team.id} className="p-2 bg-gray-50 rounded text-sm">
                      {team.name}
                    </div>
                  ))}
                  
                  {groupTeams.length === 0 && (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      Aucune équipe assignée
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {currentTournament.groups.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun groupe créé
            </h4>
            <p className="text-gray-500">
              Créez des groupes pour organiser vos équipes
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 z-10">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Opération réussie !</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 text-green-500 mr-2" />
            Gestion des Groupes
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