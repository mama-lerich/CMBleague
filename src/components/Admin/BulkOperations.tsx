import React, { useState } from 'react';
import { Upload, Download, FileText, Users, Calendar, AlertTriangle, Check, X } from 'lucide-react';
import { Team, Player, Match } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface BulkOperationsProps {
  onClose: () => void;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({ onClose }) => {
  const { currentTournament, setCurrentTournament, tournaments, setTournaments } = useApp();
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'templates'>('import');
  const [importType, setImportType] = useState<'teams' | 'players' | 'matches'>('teams');
  const [showSuccess, setShowSuccess] = useState(false);
  const [importData, setImportData] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  if (!currentTournament) return null;

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const validateTeamsData = (data: any[]): string[] => {
    const errors: string[] = [];
    const names = new Set();

    data.forEach((team, index) => {
      if (!team.name) errors.push(`Ligne ${index + 1}: Nom d'équipe manquant`);
      if (names.has(team.name)) errors.push(`Ligne ${index + 1}: Nom d'équipe en double`);
      if (!currentTournament.groups.includes(team.group)) {
        errors.push(`Ligne ${index + 1}: Groupe "${team.group}" invalide`);
      }
      names.add(team.name);
    });

    return errors;
  };

  const validatePlayersData = (data: any[]): string[] => {
    const errors: string[] = [];
    const teamNumbers = new Map<string, Set<number>>();

    data.forEach((player, index) => {
      if (!player.name) errors.push(`Ligne ${index + 1}: Nom de joueur manquant`);
      if (!player.teamId) errors.push(`Ligne ${index + 1}: ID d'équipe manquant`);
      if (!player.number || player.number < 1 || player.number > 99) {
        errors.push(`Ligne ${index + 1}: Numéro de joueur invalide`);
      }

      // Check for duplicate numbers within team
      if (!teamNumbers.has(player.teamId)) {
        teamNumbers.set(player.teamId, new Set());
      }
      const teamNums = teamNumbers.get(player.teamId)!;
      if (teamNums.has(player.number)) {
        errors.push(`Ligne ${index + 1}: Numéro ${player.number} déjà utilisé dans cette équipe`);
      }
      teamNums.add(player.number);

      // Check if team exists
      if (!currentTournament.teams.find(t => t.id === player.teamId)) {
        errors.push(`Ligne ${index + 1}: Équipe "${player.teamId}" non trouvée`);
      }
    });

    return errors;
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      let errors: string[] = [];

      if (!Array.isArray(data)) {
        setValidationErrors(['Les données doivent être un tableau JSON']);
        return;
      }

      switch (importType) {
        case 'teams':
          errors = validateTeamsData(data);
          if (errors.length === 0) {
            const newTeams: Team[] = data.map((teamData, index) => ({
              id: `imported-${Date.now()}-${index}`,
              name: teamData.name,
              group: teamData.group || 'A',
              coach: teamData.coach || '',
              founded: teamData.founded || new Date().getFullYear(),
              homeVenue: teamData.homeVenue || '',
              colors: teamData.colors || { primary: '#16A34A', secondary: '#FFFFFF' },
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
            }));

            const updatedTournament = {
              ...currentTournament,
              teams: [...currentTournament.teams, ...newTeams]
            };

            setCurrentTournament(updatedTournament);
            setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
            showSuccessMessage();
            setImportData('');
          }
          break;

        case 'players':
          errors = validatePlayersData(data);
          if (errors.length === 0) {
            const newPlayers: Player[] = data.map((playerData, index) => ({
              id: `imported-${Date.now()}-${index}`,
              name: playerData.name,
              number: playerData.number,
              position: playerData.position || 'Attaquant',
              teamId: playerData.teamId,
              age: playerData.age,
              height: playerData.height,
              weight: playerData.weight,
              nationality: playerData.nationality || 'Côte d\'Ivoire',
              stats: {
                goals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0,
                gamesPlayed: 0,
                minutesPlayed: 0
              }
            }));

            const updatedTeams = currentTournament.teams.map(team => {
              const teamPlayers = newPlayers.filter(p => p.teamId === team.id);
              return {
                ...team,
                players: [...team.players, ...teamPlayers]
              };
            });

            const updatedTournament = {
              ...currentTournament,
              teams: updatedTeams
            };

            setCurrentTournament(updatedTournament);
            setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
            showSuccessMessage();
            setImportData('');
          }
          break;
      }

      setValidationErrors(errors);
    } catch (error) {
      setValidationErrors(['Format JSON invalide']);
    }
  };

  const handleExport = (type: 'teams' | 'players' | 'matches' | 'full') => {
    let data: any;
    let filename: string;

    switch (type) {
      case 'teams':
        data = currentTournament.teams.map(team => ({
          id: team.id,
          name: team.name,
          group: team.group,
          coach: team.coach,
          founded: team.founded,
          homeVenue: team.homeVenue,
          colors: team.colors,
          playersCount: team.players.length,
          stats: team.stats
        }));
        filename = `teams_${currentTournament.name.replace(/\s+/g, '_')}.json`;
        break;

      case 'players':
        data = currentTournament.teams.flatMap(team => 
          team.players.map(player => ({
            ...player,
            teamName: team.name
          }))
        );
        filename = `players_${currentTournament.name.replace(/\s+/g, '_')}.json`;
        break;

      case 'matches':
        data = currentTournament.matches.map(match => ({
          id: match.id,
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          date: match.date.toISOString(),
          venue: match.venue,
          status: match.status,
          score: match.score,
          group: match.group,
          round: match.round
        }));
        filename = `matches_${currentTournament.name.replace(/\s+/g, '_')}.json`;
        break;

      case 'full':
        data = {
          tournament: {
            id: currentTournament.id,
            name: currentTournament.name,
            year: currentTournament.year,
            status: currentTournament.status,
            startDate: currentTournament.startDate.toISOString(),
            endDate: currentTournament.endDate.toISOString(),
            description: currentTournament.description,
            location: currentTournament.location,
            prize: currentTournament.prize
          },
          teams: currentTournament.teams,
          matches: currentTournament.matches,
          statistics: {
            totalPlayers: currentTournament.teams.reduce((sum, team) => sum + team.players.length, 0),
            totalGoals: currentTournament.teams.flatMap(t => t.players).reduce((sum, p) => sum + p.stats.goals, 0),
            finishedMatches: currentTournament.matches.filter(m => m.status === 'finished').length
          }
        };
        filename = `tournament_complete_${currentTournament.name.replace(/\s+/g, '_')}.json`;
        break;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTemplate = (type: 'teams' | 'players' | 'matches') => {
    switch (type) {
      case 'teams':
        return JSON.stringify([
          {
            name: "Exemple FC",
            group: "A",
            coach: "Jean Dupont",
            founded: 2020,
            homeVenue: "Stade Municipal",
            colors: {
              primary: "#16A34A",
              secondary: "#FFFFFF"
            }
          }
        ], null, 2);

      case 'players':
        return JSON.stringify([
          {
            name: "Jean-Baptiste Koné",
            number: 10,
            position: "Attaquant",
            teamId: "team-id-here",
            age: 24,
            height: 178,
            weight: 72,
            nationality: "Côte d'Ivoire"
          }
        ], null, 2);

      case 'matches':
        return JSON.stringify([
          {
            homeTeamId: "team-1-id",
            awayTeamId: "team-2-id",
            date: "2024-12-30T15:00:00.000Z",
            venue: "Stade Municipal",
            group: "A",
            round: "Phase de groupes"
          }
        ], null, 2);

      default:
        return '';
    }
  };

  const renderImportTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Upload className="h-6 w-6 text-blue-500 mr-2" />
          Import en Masse
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de données à importer
          </label>
          <select
            value={importType}
            onChange={(e) => setImportType(e.target.value as any)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="teams">Équipes</option>
            <option value="players">Joueurs</option>
            <option value="matches">Matchs</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Données JSON
          </label>
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder={`Collez vos données JSON ici...\n\nExemple:\n${getTemplate(importType)}`}
            rows={12}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        {validationErrors.length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Erreurs de validation
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={handleImport}
            disabled={!importData.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Importer</span>
          </button>
          <button
            onClick={() => setImportData(getTemplate(importType))}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Utiliser le modèle
          </button>
        </div>
      </div>
    </div>
  );

  const renderExportTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Download className="h-6 w-6 text-green-500 mr-2" />
          Export de Données
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              Équipes
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Exporter toutes les équipes avec leurs informations et statistiques
            </p>
            <button
              onClick={() => handleExport('teams')}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg transition-colors"
            >
              Exporter les Équipes
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Users className="h-5 w-5 text-green-500 mr-2" />
              Joueurs
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Exporter tous les joueurs avec leurs statistiques détaillées
            </p>
            <button
              onClick={() => handleExport('players')}
              className="w-full bg-green-50 hover:bg-green-100 text-green-700 py-2 px-4 rounded-lg transition-colors"
            >
              Exporter les Joueurs
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Calendar className="h-5 w-5 text-purple-500 mr-2" />
              Matchs
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Exporter le calendrier complet des matchs et résultats
            </p>
            <button
              onClick={() => handleExport('matches')}
              className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 px-4 rounded-lg transition-colors"
            >
              Exporter les Matchs
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <FileText className="h-5 w-5 text-orange-500 mr-2" />
              Tournoi Complet
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Exporter toutes les données du tournoi en un seul fichier
            </p>
            <button
              onClick={() => handleExport('full')}
              className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 py-2 px-4 rounded-lg transition-colors"
            >
              Export Complet
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <FileText className="h-6 w-6 text-purple-500 mr-2" />
          Modèles de Données
        </h3>

        <div className="space-y-6">
          {['teams', 'players', 'matches'].map((type) => (
            <div key={type} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                Modèle {type === 'teams' ? 'Équipes' : type === 'players' ? 'Joueurs' : 'Matchs'}
              </h4>
              <pre className="bg-gray-50 rounded p-4 text-sm overflow-x-auto">
                <code>{getTemplate(type as any)}</code>
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getTemplate(type as any));
                  showSuccessMessage();
                }}
                className="mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                Copier le modèle
              </button>
            </div>
          ))}
        </div>
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
            <span className="text-green-800 font-medium">Opération réussie !</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="h-6 w-6 text-blue-500 mr-2" />
            Opérations en Masse
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
            { key: 'import', label: 'Import', icon: Upload },
            { key: 'export', label: 'Export', icon: Download },
            { key: 'templates', label: 'Modèles', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-lg'
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
          {activeTab === 'import' && renderImportTab()}
          {activeTab === 'export' && renderExportTab()}
          {activeTab === 'templates' && renderTemplatesTab()}
        </div>
      </div>
    </div>
  );
};