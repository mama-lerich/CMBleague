import React, { useState } from 'react';
import { Plus, Save, X, Calendar, Users, Trophy, Settings, AlertCircle, Check, Target, Zap, Crown } from 'lucide-react';
import { Tournament, Team, TournamentFormat } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { TOURNAMENT_FORMATS, getRecommendedGroupsForTeams } from '../../utils/tournamentFormats';
import { generateMatches } from '../../utils/matchGenerator';

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
    format: editingTournament?.format || 'world_cup' as TournamentFormat,
    venues: ['Stade Municipal', 'Terrain Central', 'Stade des Jeunes'],
    rules: editingTournament?.rules || [
      'Matchs de 90 minutes (2 x 45 min)',
      'Maximum 3 remplacements par équipe',
      'Carton rouge = suspension automatique'
    ]
  });

  const [newRule, setNewRule] = useState('');
  const [newVenue, setNewVenue] = useState('');

  const steps = [
    { id: 1, title: 'Format du Tournoi', icon: Trophy },
    { id: 2, title: 'Informations Générales', icon: Calendar },
    { id: 3, title: 'Configuration', icon: Settings },
    { id: 4, title: 'Règlement', icon: Users },
    { id: 5, title: 'Finalisation', icon: Check }
  ];

  const selectedFormat = TOURNAMENT_FORMATS[tournamentData.format];

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

  const handleAddVenue = () => {
    if (newVenue.trim() && !tournamentData.venues.includes(newVenue.trim())) {
      setTournamentData({
        ...tournamentData,
        venues: [...tournamentData.venues, newVenue.trim()]
      });
      setNewVenue('');
    }
  };

  const handleRemoveVenue = (index: number) => {
    if (tournamentData.venues.length > 1) {
      setTournamentData({
        ...tournamentData,
        venues: tournamentData.venues.filter((_, i) => i !== index)
      });
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return tournamentData.format !== '';
      case 2:
        return tournamentData.name && tournamentData.startDate && tournamentData.endDate;
      case 3:
        return tournamentData.venues.length > 0;
      case 4:
        return tournamentData.rules.length > 0;
      default:
        return true;
    }
  };

  const handleSaveTournament = () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const formatConfig = selectedFormat;
    
    // Configuration des groupes basée sur le format
    let groups: string[] = [];
    let maxTeamsPerGroup = 4;
    
    if (tournamentData.format === 'league') {
      groups = ['A'];
      maxTeamsPerGroup = 20;
    } else {
      // Pour les formats avec groupes, on utilisera une configuration par défaut
      // qui sera ajustée quand les équipes seront ajoutées
      const recommendedConfig = getRecommendedGroupsForTeams(tournamentData.format, 16);
      groups = Array.from({ length: recommendedConfig.groupsCount }, (_, i) => 
        String.fromCharCode(65 + i)
      );
      maxTeamsPerGroup = recommendedConfig.teamsPerGroup;
    }

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
      maxTeamsPerGroup,
      playersPerTeam: tournamentData.playersPerTeam,
      description: tournamentData.description,
      location: tournamentData.location,
      prize: tournamentData.prize,
      rules: tournamentData.rules,
      format: tournamentData.format,
      formatConfig,
      currentPhase: formatConfig.phases[0]?.id,
      phases: formatConfig.phases
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
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choisissez le Format de Votre Tournoi</h3>
        <p className="text-gray-600">Sélectionnez le format qui correspond le mieux à vos besoins</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.values(TOURNAMENT_FORMATS).map((format) => (
          <div
            key={format.id}
            onClick={() => setTournamentData({...tournamentData, format: format.id})}
            className={`relative cursor-pointer rounded-xl p-6 border-2 transition-all duration-300 ${
              tournamentData.format === format.id
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            {/* Format Icon */}
            <div className="text-center mb-4">
              <div className={`text-6xl mb-2 ${
                format.id === 'league' ? '🏆' :
                format.id === 'world_cup' ? '🌍' : '⭐'
              }`}>
                {format.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900">{format.name}</h4>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 text-center">
              {format.description}
            </p>

            {/* Features */}
            <div className="space-y-2 mb-4">
              <h5 className="font-semibold text-gray-900 text-sm">Caractéristiques :</h5>
              <ul className="space-y-1">
                {format.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start">
                    <span className="text-green-500 mr-1">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Team Requirements */}
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-600">
                <strong>Équipes :</strong> {format.minTeams}-{format.maxTeams}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Recommandé : {format.recommendedTeams.join(', ')}
              </div>
            </div>

            {/* Selected Indicator */}
            {tournamentData.format === format.id && (
              <div className="absolute top-3 right-3">
                <div className="bg-blue-500 text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Format Details */}
      {tournamentData.format && (
        <div className="bg-blue-50 rounded-xl p-6 mt-6">
          <h4 className="font-bold text-blue-900 mb-3 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Détails du Format Sélectionné
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold text-blue-800 mb-2">Phases du Tournoi :</h5>
              <ul className="space-y-1">
                {selectedFormat.phases.map((phase, index) => (
                  <li key={phase.id} className="text-sm text-blue-700 flex items-center">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">
                      {index + 1}
                    </span>
                    {phase.name}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-blue-800 mb-2">Avantages :</h5>
              <ul className="space-y-1">
                {selectedFormat.features.map((feature, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-start">
                    <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
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

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Venues Management */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Stades et Terrains</h4>
        
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newVenue}
            onChange={(e) => setNewVenue(e.target.value)}
            placeholder="Ajouter un nouveau stade..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddVenue()}
          />
          <button
            onClick={handleAddVenue}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Ajouter
          </button>
        </div>

        <div className="space-y-2">
          {tournamentData.venues.map((venue, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <span className="text-gray-900">{venue}</span>
              <button
                onClick={() => handleRemoveVenue(index)}
                disabled={tournamentData.venues.length === 1}
                className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {tournamentData.venues.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun stade défini. Ajoutez au moins un stade.</p>
          </div>
        )}
      </div>

      {/* Format Preview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Aperçu du Format Sélectionné</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Format : {selectedFormat.name}</h5>
            <p className="text-sm text-gray-600">{selectedFormat.description}</p>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Phases :</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              {selectedFormat.phases.map((phase, index) => (
                <li key={phase.id}>
                  {index + 1}. {phase.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
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

      {/* Format-specific rules suggestions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">Règles suggérées pour le format {selectedFormat.name} :</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          {tournamentData.format === 'league' && (
            <>
              <li>• 3 points pour une victoire, 1 point pour un nul</li>
              <li>• Classement final basé sur les points totaux</li>
              <li>• En cas d'égalité : différence de buts puis buts marqués</li>
            </>
          )}
          {tournamentData.format === 'world_cup' && (
            <>
              <li>• Phase de groupes : 2 meilleures équipes qualifiées</li>
              <li>• Phases éliminatoires : match unique</li>
              <li>• Prolongations et tirs au but si nécessaire</li>
            </>
          )}
          {tournamentData.format === 'champions_league' && (
            <>
              <li>• Phase de groupes : 2 meilleures équipes qualifiées</li>
              <li>• Phases éliminatoires : matchs aller-retour</li>
              <li>• Règle des buts à l'extérieur</li>
              <li>• Finale sur terrain neutre</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-lg p-6">
        <h4 className="font-semibold text-green-900 mb-4">Récapitulatif du Tournoi</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Informations Générales</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div><strong>Nom:</strong> {tournamentData.name}</div>
              <div><strong>Format:</strong> {selectedFormat.name}</div>
              <div><strong>Année:</strong> {tournamentData.year}</div>
              <div><strong>Période:</strong> {tournamentData.startDate} au {tournamentData.endDate}</div>
              <div><strong>Lieu:</strong> {tournamentData.location}</div>
              {tournamentData.prize && <div><strong>Prix:</strong> {tournamentData.prize}</div>}
            </div>
          </div>

          <div>
            <h5 className="font-medium text-gray-900 mb-2">Configuration</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div><strong>Joueurs par équipe:</strong> {tournamentData.playersPerTeam}</div>
              <div><strong>Stades:</strong> {tournamentData.venues.length}</div>
              <div><strong>Règles définies:</strong> {tournamentData.rules.length}</div>
              <div><strong>Phases:</strong> {selectedFormat.phases.length}</div>
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
          <li>• Ajouter les équipes participantes</li>
          <li>• Assigner les équipes aux groupes (si applicable)</li>
          <li>• Générer automatiquement le calendrier des matchs</li>
          <li>• Ajouter les joueurs aux équipes</li>
          <li>• Lancer le tournoi</li>
        </ul>
      </div>

      <div className="bg-yellow-50 rounded-lg p-4">
        <h5 className="font-medium text-yellow-900 mb-2 flex items-center">
          <Zap className="h-4 w-4 mr-2" />
          Génération Automatique des Matchs
        </h5>
        <p className="text-sm text-yellow-700">
          Une fois les équipes ajoutées, le système générera automatiquement tous les matchs selon le format {selectedFormat.name} sélectionné.
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
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
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : isCompleted 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">{step.title}</span>
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
          {currentStep === 5 && renderStep5()}
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
            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
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