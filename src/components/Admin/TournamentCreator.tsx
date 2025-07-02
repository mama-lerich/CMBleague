import React, { useState } from 'react';
import { Plus, Save, X, Calendar, Users, Trophy, Settings, AlertCircle, Check } from 'lucide-react';
import { Tournament, Team } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface TournamentCreatorProps {
  onClose: () => void;
  editingTournament?: Tournament | null;
}

export const TournamentCreator: React.FC<TournamentCreatorProps> = ({ 
  onClose, 
  editingTournament 
}) => {
  const { tournaments, setTournaments, setCurrentTournament } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const [tournamentData, setTournamentData] = useState({
    name: editingTournament?.name || '',
    year: editingTournament?.year || new Date().getFullYear(),
    startDate: editingTournament?.startDate.toISOString().split('T')[0] || '',
    endDate: editingTournament?.endDate.toISOString().split('T')[0] || '',
    description: editingTournament?.description || '',
    location: editingTournament?.location || 'Petion-Ville, Haiti',
    prize: editingTournament?.prize || '',
    playersPerTeam: editingTournament?.playersPerTeam || 11,
    maxTeamsPerGroup: editingTournament?.maxTeamsPerGroup || 6,
    groupCount: editingTournament?.groups.length || 2,
    rules: editingTournament?.rules || [
      'Matchs de 90 minutes (2 x 45 min)',
      'Maximum 3 remplacements par équipe',
      'Carton rouge = suspension automatique'
    ]
  });

  const [newRule, setNewRule] = useState('');

  const steps = [
    { id: 1, title: 'Informations Générales', icon: Trophy },
    { id: 2, title: 'Configuration', icon: Settings },
    { id: 3, title: 'Règlement', icon: Calendar },
    { id: 4, title: 'Finalisation', icon: Check }
  ];

  const handleAddRule = () => {
    if (newRule.trim()) {
      setTournamentData({
        ...tournamentData,
        rules: [...tournamentData.rules, newRule.trim()]
      });
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setTournamentData({
      ...tournamentData,
      rules: tournamentData.rules.filter((_, i) => i !== index)
    });
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return tournamentData.name && tournamentData.startDate && tournamentData.endDate;
      case 2:
        return tournamentData.groupCount > 0 && tournamentData.maxTeamsPerGroup > 0;
      case 3:
        return tournamentData.rules.length > 0;
      default:
        return true;
    }
  };

  const handleSaveTournament = () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const groups = Array.from({ length: tournamentData.groupCount }, (_, i) => 
      String.fromCharCode(65 + i)
    );

    const newTournament: Tournament = {
      id: editingTournament?.id || Date.now().toString(),
      name: tournamentData.name,
      year: tournamentData.year,
      status: editingTournament?.status || 'upcoming',
      startDate: new Date(tournamentData.startDate),
      endDate: new Date(tournamentData.endDate),
      teams: editingTournament?.teams || [],
      matches: editingTournament?.matches || [],
      groups,
      maxTeamsPerGroup: tournamentData.maxTeamsPerGroup,
      playersPerTeam: tournamentData.playersPerTeam,
      description: tournamentData.description,
      location: tournamentData.location,
      prize: tournamentData.prize,
      rules: tournamentData.rules
    };

    if (editingTournament) {
      // Update existing tournament
      setTournaments(tournaments.map(t => t.id === editingTournament.id ? newTournament : t));
      setCurrentTournament(newTournament);
    } else {
      // Create new tournament
      setTournaments([...tournaments, newTournament]);
      setCurrentTournament(newTournament);
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du tournoi *
          </label>
          <input
            type="text"
            value={tournamentData.name}
            onChange={(e) => setTournamentData({...tournamentData, name: e.target.value})}
            placeholder="Coupe Mario Brutus 2025"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Année *
          </label>
          <input
            type="number"
            value={tournamentData.year}
            onChange={(e) => setTournamentData({...tournamentData, year: parseInt(e.target.value)})}
            min="2020"
            max="2030"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de début *
          </label>
          <input
            type="date"
            value={tournamentData.startDate}
            onChange={(e) => setTournamentData({...tournamentData, startDate: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de fin *
          </label>
          <input
            type="date"
            value={tournamentData.endDate}
            onChange={(e) => setTournamentData({...tournamentData, endDate: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lieu
          </label>
          <input
            type="text"
            value={tournamentData.location}
            onChange={(e) => setTournamentData({...tournamentData, location: e.target.value})}
            placeholder="Petion-Ville, Haiti"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix/Récompense
          </label>
          <input
            type="text"
            value={tournamentData.prize}
            onChange={(e) => setTournamentData({...tournamentData, prize: e.target.value})}
            placeholder="Trophée + 500,000 HTG"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={tournamentData.description}
          onChange={(e) => setTournamentData({...tournamentData, description: e.target.value})}
          placeholder="Description du tournoi..."
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de groupes
          </label>
          <select
            value={tournamentData.groupCount}
            onChange={(e) => setTournamentData({...tournamentData, groupCount: parseInt(e.target.value)})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2">2 groupes (A, B)</option>
            <option value="3">3 groupes (A, B, C)</option>
            <option value="4">4 groupes (A, B, C, D)</option>
            <option value="6">6 groupes (A, B, C, D, E, F)</option>
            <option value="8">8 groupes (A, B, C, D, E, F, G, H)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Équipes max par groupe
          </label>
          <select
            value={tournamentData.maxTeamsPerGroup}
            onChange={(e) => setTournamentData({...tournamentData, maxTeamsPerGroup: parseInt(e.target.value)})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="3">3 équipes</option>
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
            value={tournamentData.playersPerTeam}
            onChange={(e) => setTournamentData({...tournamentData, playersPerTeam: parseInt(e.target.value)})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="5">5 joueurs (Futsal)</option>
            <option value="7">7 joueurs</option>
            <option value="11">11 joueurs (Football)</option>
            <option value="15">15 joueurs (avec remplaçants)</option>
          </select>
        </div>
      </div>

      {/* Preview des groupes */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Aperçu des Groupes</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: tournamentData.groupCount }, (_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 text-center border-2 border-blue-200">
              <div className="text-lg font-bold text-blue-600">
                Groupe {String.fromCharCode(65 + i)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Max {tournamentData.maxTeamsPerGroup} équipes
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calcul automatique */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Calculs Automatiques</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-600">Équipes max:</span>
            <div className="font-bold">{tournamentData.groupCount * tournamentData.maxTeamsPerGroup}</div>
          </div>
          <div>
            <span className="text-blue-600">Joueurs max:</span>
            <div className="font-bold">{tournamentData.groupCount * tournamentData.maxTeamsPerGroup * tournamentData.playersPerTeam}</div>
          </div>
          <div>
            <span className="text-blue-600">Matchs de poule:</span>
            <div className="font-bold">{tournamentData.groupCount * (tournamentData.maxTeamsPerGroup * (tournamentData.maxTeamsPerGroup - 1) / 2)}</div>
          </div>
          <div>
            <span className="text-blue-600">Durée estimée:</span>
            <div className="font-bold">
              {Math.ceil((tournamentData.endDate ? new Date(tournamentData.endDate).getTime() - new Date(tournamentData.startDate).getTime() : 0) / (1000 * 60 * 60 * 24))} jours
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Règlement du Tournoi</h4>
        
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            placeholder="Ajouter une nouvelle règle..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddRule()}
          />
          <button
            onClick={handleAddRule}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Ajouter
          </button>
        </div>

        <div className="space-y-2">
          {tournamentData.rules.map((rule, index) => (
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
        </div>

        {tournamentData.rules.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Aucune règle définie. Ajoutez au moins une règle.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-lg p-6">
        <h4 className="font-semibold text-green-900 mb-4">Récapitulatif du Tournoi</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Informations Générales</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div><strong>Nom:</strong> {tournamentData.name}</div>
              <div><strong>Année:</strong> {tournamentData.year}</div>
              <div><strong>Période:</strong> {tournamentData.startDate} au {tournamentData.endDate}</div>
              <div><strong>Lieu:</strong> {tournamentData.location}</div>
              {tournamentData.prize && <div><strong>Prix:</strong> {tournamentData.prize}</div>}
            </div>
          </div>

          <div>
            <h5 className="font-medium text-gray-900 mb-2">Configuration</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div><strong>Groupes:</strong> {tournamentData.groupCount}</div>
              <div><strong>Équipes max par groupe:</strong> {tournamentData.maxTeamsPerGroup}</div>
              <div><strong>Joueurs par équipe:</strong> {tournamentData.playersPerTeam}</div>
              <div><strong>Règles définies:</strong> {tournamentData.rules.length}</div>
            </div>
          </div>
        </div>

        {tournamentData.description && (
          <div className="mt-4">
            <h5 className="font-medium text-gray-900 mb-2">Description</h5>
            <p className="text-sm text-gray-600">{tournamentData.description}</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">Prochaines Étapes</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Créer et assigner les équipes aux groupes</li>
          <li>• Ajouter les joueurs aux équipes</li>
          <li>• Planifier les matchs de phase de poule</li>
          <li>• Configurer les phases éliminatoires</li>
          <li>• Lancer le tournoi</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 z-10">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">
              {editingTournament ? 'Tournoi modifié' : 'Tournoi créé'} avec succès !
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
            {editingTournament ? 'Modifier le Tournoi' : 'Créer un Nouveau Tournoi'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Steps Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isValid = validateStep(step.id);

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : isCompleted 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{step.title}</span>
                    {isCompleted && <Check className="h-4 w-4" />}
                    {isActive && !isValid && <AlertCircle className="h-4 w-4 text-red-300" />}
                  </button>
                  {index < steps.length - 1 && (
                    <div className="w-8 h-px bg-gray-300 mx-2"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          <div className="flex space-x-3">
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                disabled={!validateStep(currentStep)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSaveTournament}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{editingTournament ? 'Modifier' : 'Créer'} le Tournoi</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};