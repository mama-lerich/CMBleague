import React, { useState } from 'react';
import { Settings, Save, X, AlertCircle, Check, Trophy, Users, Calendar } from 'lucide-react';
import { Tournament } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface TournamentSettingsProps {
  tournament: Tournament;
  onUpdate: (tournament: Tournament) => void;
  onClose: () => void;
}

export const TournamentSettings: React.FC<TournamentSettingsProps> = ({
  tournament,
  onUpdate,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: tournament.name,
    description: tournament.description || '',
    location: tournament.location || '',
    prize: tournament.prize || '',
    maxTeamsPerGroup: tournament.maxTeamsPerGroup,
    playersPerTeam: tournament.playersPerTeam,
    rules: tournament.rules || []
  });

  const [newRule, setNewRule] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    const updatedTournament: Tournament = {
      ...tournament,
      name: formData.name,
      description: formData.description,
      location: formData.location,
      prize: formData.prize,
      maxTeamsPerGroup: formData.maxTeamsPerGroup,
      playersPerTeam: formData.playersPerTeam,
      rules: formData.rules
    };

    onUpdate(updatedTournament);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleAddRule = () => {
    if (newRule.trim()) {
      setFormData({
        ...formData,
        rules: [...formData.rules, newRule.trim()]
      });
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setFormData({
      ...formData,
      rules: formData.rules.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="h-6 w-6 text-blue-500 mr-2" />
            Paramètres du Tournoi
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Paramètres sauvegardés avec succès !</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
              Informations Générales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du tournoi
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Abidjan, Côte d'Ivoire"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Description du tournoi..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix/Récompense
                </label>
                <input
                  type="text"
                  value={formData.prize}
                  onChange={(e) => setFormData({...formData, prize: e.target.value})}
                  placeholder="Trophée + 500,000 FCFA"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Competition Settings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 text-green-500 mr-2" />
              Paramètres de Compétition
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipes maximum par groupe
                </label>
                <select
                  value={formData.maxTeamsPerGroup}
                  onChange={(e) => setFormData({...formData, maxTeamsPerGroup: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="4">4 équipes</option>
                  <option value="5">5 équipes</option>
                  <option value="6">6 équipes</option>
                  <option value="8">8 équipes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Joueurs par équipe
                </label>
                <select
                  value={formData.playersPerTeam}
                  onChange={(e) => setFormData({...formData, playersPerTeam: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="5">5 joueurs (Futsal)</option>
                  <option value="7">7 joueurs</option>
                  <option value="11">11 joueurs (Football)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rules Management */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-purple-500 mr-2" />
              Règlement du Tournoi
            </h3>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="Ajouter une nouvelle règle..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRule()}
                />
                <button
                  onClick={handleAddRule}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>

              <div className="space-y-2">
                {formData.rules.map((rule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-gray-900">{rule}</span>
                    <button
                      onClick={() => handleRemoveRule(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {formData.rules.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Aucune règle définie</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tournament Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Statut du Tournoi
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{tournament.teams.length}</div>
                <div className="text-sm text-gray-600">Équipes</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">{tournament.matches.length}</div>
                <div className="text-sm text-gray-600">Matchs</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{tournament.groups.length}</div>
                <div className="text-sm text-gray-600">Groupes</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className={`text-2xl font-bold ${
                  tournament.status === 'upcoming' ? 'text-blue-600' :
                  tournament.status === 'ongoing' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {tournament.status === 'upcoming' ? 'À venir' :
                   tournament.status === 'ongoing' ? 'En cours' : 'Terminé'}
                </div>
                <div className="text-sm text-gray-600">Statut</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Sauvegarder</span>
          </button>
        </div>
      </div>
    </div>
  );
};