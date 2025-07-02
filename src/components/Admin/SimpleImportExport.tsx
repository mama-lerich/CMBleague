import React, { useState } from 'react';
import { Upload, Download, FileText, Users, Calendar, AlertTriangle, Check, X, Database } from 'lucide-react';
import { Team, Player, Match } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface SimpleImportExportProps {
  onClose: () => void;
}

export const SimpleImportExport: React.FC<SimpleImportExportProps> = ({ onClose }) => {
  const { currentTournament, setCurrentTournament, tournaments, setTournaments } = useApp();
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'templates'>('templates');
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  if (!currentTournament) return null;

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Templates CSV simples
  const csvTemplates = {
    teams: {
      headers: ['nom', 'groupe', 'entraineur', 'stade', 'annee_fondation'],
      example: [
        ['Les Lions FC', 'A', 'Jean Dupont', 'Stade Municipal', '2020'],
        ['Étoiles United', 'B', 'Marie Durand', 'Terrain Central', '2019'],
        ['Dynamique FC', 'A', 'Paul Martin', 'Complexe Sportif', '2021']
      ]
    },
    players: {
      headers: ['nom', 'numero', 'position', 'equipe', 'age', 'nationalite'],
      example: [
        ['Jean-Baptiste Koné', '10', 'Attaquant', 'Les Lions FC', '24', 'Haiti'],
        ['Marie Celestin', '7', 'Milieu', 'Étoiles United', '22', 'Haiti'],
        ['Pierre Joseph', '1', 'Gardien', 'Dynamique FC', '26', 'Haiti']
      ]
    },
    matches: {
      headers: ['equipe_domicile', 'equipe_exterieur', 'date', 'heure', 'stade', 'groupe'],
      example: [
        ['Les Lions FC', 'Étoiles United', '2024-12-30', '15:00', 'Stade Municipal', 'A'],
        ['Dynamique FC', 'Les Lions FC', '2025-01-02', '17:00', 'Terrain Central', 'A']
      ]
    }
  };

  const generateCSV = (headers: string[], data: string[][]) => {
    return [headers, ...data].map(row => row.join(',')).join('\n');
  };

  const downloadTemplate = (type: 'teams' | 'players' | 'matches') => {
    const template = csvTemplates[type];
    const csvContent = generateCSV(template.headers, template.example);
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modele_${type}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showSuccessMessage();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>, type: 'teams' | 'players' | 'matches') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setValidationErrors(['Le fichier doit contenir au moins une ligne d\'en-tête et une ligne de données']);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const dataLines = lines.slice(1);

      try {
        switch (type) {
          case 'teams':
            importTeams(headers, dataLines);
            break;
          case 'players':
            importPlayers(headers, dataLines);
            break;
          case 'matches':
            importMatches(headers, dataLines);
            break;
        }
      } catch (error) {
        setValidationErrors([`Erreur lors de l'import: ${error}`]);
      }
    };
    reader.readAsText(file);
  };

  const importTeams = (headers: string[], dataLines: string[]) => {
    const errors: string[] = [];
    const newTeams: Team[] = [];

    dataLines.forEach((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const teamData: any = {};
      
      headers.forEach((header, i) => {
        teamData[header] = values[i] || '';
      });

      // Validation
      if (!teamData.nom) {
        errors.push(`Ligne ${index + 2}: Nom d'équipe manquant`);
        return;
      }

      const newTeam: Team = {
        id: `imported-${Date.now()}-${index}`,
        name: teamData.nom,
        group: teamData.groupe || currentTournament.groups[0] || 'A',
        coach: teamData.entraineur || '',
        founded: parseInt(teamData.annee_fondation) || new Date().getFullYear(),
        homeVenue: teamData.stade || '',
        colors: { primary: '#16A34A', secondary: '#FFFFFF' },
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

      newTeams.push(newTeam);
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    const updatedTournament = {
      ...currentTournament,
      teams: [...currentTournament.teams, ...newTeams]
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
    setValidationErrors([]);
    showSuccessMessage();
  };

  const importPlayers = (headers: string[], dataLines: string[]) => {
    const errors: string[] = [];
    const updatedTeams = [...currentTournament.teams];

    dataLines.forEach((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const playerData: any = {};
      
      headers.forEach((header, i) => {
        playerData[header] = values[i] || '';
      });

      // Validation
      if (!playerData.nom) {
        errors.push(`Ligne ${index + 2}: Nom de joueur manquant`);
        return;
      }

      if (!playerData.numero || isNaN(parseInt(playerData.numero))) {
        errors.push(`Ligne ${index + 2}: Numéro de joueur invalide`);
        return;
      }

      const team = updatedTeams.find(t => t.name === playerData.equipe);
      if (!team) {
        errors.push(`Ligne ${index + 2}: Équipe "${playerData.equipe}" non trouvée`);
        return;
      }

      // Vérifier si le numéro est déjà pris
      if (team.players.some(p => p.number === parseInt(playerData.numero))) {
        errors.push(`Ligne ${index + 2}: Numéro ${playerData.numero} déjà pris dans l'équipe ${team.name}`);
        return;
      }

      const newPlayer: Player = {
        id: `imported-${Date.now()}-${index}`,
        name: playerData.nom,
        number: parseInt(playerData.numero),
        position: playerData.position || 'Attaquant',
        teamId: team.id,
        age: playerData.age ? parseInt(playerData.age) : undefined,
        nationality: playerData.nationalite || 'Haiti',
        stats: {
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          gamesPlayed: 0,
          minutesPlayed: 0
        }
      };

      team.players.push(newPlayer);
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    const updatedTournament = {
      ...currentTournament,
      teams: updatedTeams
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
    setValidationErrors([]);
    showSuccessMessage();
  };

  const importMatches = (headers: string[], dataLines: string[]) => {
    const errors: string[] = [];
    const newMatches: Match[] = [];

    dataLines.forEach((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const matchData: any = {};
      
      headers.forEach((header, i) => {
        matchData[header] = values[i] || '';
      });

      // Validation
      const homeTeam = currentTournament.teams.find(t => t.name === matchData.equipe_domicile);
      const awayTeam = currentTournament.teams.find(t => t.name === matchData.equipe_exterieur);

      if (!homeTeam) {
        errors.push(`Ligne ${index + 2}: Équipe domicile "${matchData.equipe_domicile}" non trouvée`);
        return;
      }

      if (!awayTeam) {
        errors.push(`Ligne ${index + 2}: Équipe extérieur "${matchData.equipe_exterieur}" non trouvée`);
        return;
      }

      if (homeTeam.id === awayTeam.id) {
        errors.push(`Ligne ${index + 2}: Une équipe ne peut pas jouer contre elle-même`);
        return;
      }

      const matchDate = new Date(`${matchData.date}T${matchData.heure || '15:00'}`);
      if (isNaN(matchDate.getTime())) {
        errors.push(`Ligne ${index + 2}: Date invalide`);
        return;
      }

      const newMatch: Match = {
        id: `imported-${Date.now()}-${index}`,
        homeTeam,
        awayTeam,
        date: matchDate,
        venue: matchData.stade || 'Stade Municipal',
        status: 'upcoming',
        group: matchData.groupe || 'A',
        round: 'Phase de groupes'
      };

      newMatches.push(newMatch);
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    const updatedTournament = {
      ...currentTournament,
      matches: [...currentTournament.matches, ...newMatches]
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
    setValidationErrors([]);
    showSuccessMessage();
  };

  const exportData = (type: 'teams' | 'players' | 'matches') => {
    let headers: string[];
    let data: string[][];
    let filename: string;

    switch (type) {
      case 'teams':
        headers = ['nom', 'groupe', 'entraineur', 'stade', 'annee_fondation', 'points', 'victoires', 'matchs_joues'];
        data = currentTournament.teams.map(team => [
          team.name,
          team.group,
          team.coach || '',
          team.homeVenue || '',
          team.founded?.toString() || '',
          team.stats.points.toString(),
          team.stats.wins.toString(),
          team.stats.gamesPlayed.toString()
        ]);
        filename = 'equipes';
        break;

      case 'players':
        headers = ['nom', 'numero', 'position', 'equipe', 'age', 'nationalite', 'buts', 'passes', 'cartons_jaunes', 'cartons_rouges'];
        data = currentTournament.teams.flatMap(team =>
          team.players.map(player => [
            player.name,
            player.number.toString(),
            player.position,
            team.name,
            player.age?.toString() || '',
            player.nationality || '',
            player.stats.goals.toString(),
            player.stats.assists.toString(),
            player.stats.yellowCards.toString(),
            player.stats.redCards.toString()
          ])
        );
        filename = 'joueurs';
        break;

      case 'matches':
        headers = ['equipe_domicile', 'equipe_exterieur', 'date', 'heure', 'stade', 'groupe', 'statut', 'score_domicile', 'score_exterieur'];
        data = currentTournament.matches.map(match => [
          match.homeTeam.name,
          match.awayTeam.name,
          match.date.toISOString().split('T')[0],
          match.date.toTimeString().split(' ')[0].substring(0, 5),
          match.venue,
          match.group,
          match.status,
          match.score?.home?.toString() || '',
          match.score?.away?.toString() || ''
        ]);
        filename = 'matchs';
        break;
    }

    const csvContent = generateCSV(headers, data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${currentTournament.name.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showSuccessMessage();
  };

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <FileText className="h-6 w-6 text-purple-500 mr-2" />
          Modèles CSV à Télécharger
        </h3>
        <p className="text-gray-600 mb-6">
          Téléchargez ces modèles, remplissez-les avec vos données, puis importez-les facilement.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              type: 'teams', 
              label: 'Équipes', 
              icon: Users, 
              color: 'blue',
              description: 'Liste des équipes avec leurs informations de base',
              fields: 'nom, groupe, entraîneur, stade, année de fondation'
            },
            { 
              type: 'players', 
              label: 'Joueurs', 
              icon: Users, 
              color: 'green',
              description: 'Liste des joueurs avec leurs informations personnelles',
              fields: 'nom, numéro, position, équipe, âge, nationalité'
            },
            { 
              type: 'matches', 
              label: 'Matchs', 
              icon: Calendar, 
              color: 'orange',
              description: 'Calendrier des matchs à programmer',
              fields: 'équipe domicile, équipe extérieur, date, heure, stade, groupe'
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.type} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-center mb-4">
                  <Icon className={`h-12 w-12 text-${item.color}-500 mx-auto mb-3`} />
                  <h4 className="font-bold text-lg text-gray-900">{item.label}</h4>
                  <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Colonnes requises:</h5>
                  <p className="text-xs text-gray-600">{item.fields}</p>
                </div>

                <button
                  onClick={() => downloadTemplate(item.type as any)}
                  className={`w-full bg-${item.color}-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-${item.color}-700 transition-colors flex items-center justify-center space-x-2`}
                >
                  <Download className="h-4 w-4" />
                  <span>Télécharger le modèle</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3">📋 Instructions d'utilisation</h4>
          <ol className="text-sm text-blue-800 space-y-2">
            <li><strong>1.</strong> Téléchargez le modèle CSV correspondant à vos données</li>
            <li><strong>2.</strong> Ouvrez le fichier dans Excel, Google Sheets ou un éditeur de texte</li>
            <li><strong>3.</strong> Remplissez les données en respectant le format des exemples</li>
            <li><strong>4.</strong> Sauvegardez le fichier au format CSV</li>
            <li><strong>5.</strong> Utilisez l'onglet "Import" pour charger vos données</li>
          </ol>
        </div>
      </div>
    </div>
  );

  const renderImportTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Upload className="h-6 w-6 text-blue-500 mr-2" />
          Import de Fichiers CSV
        </h3>

        {validationErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Erreurs détectées
            </h4>
            <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { type: 'teams', label: 'Équipes', icon: Users, color: 'blue' },
            { type: 'players', label: 'Joueurs', icon: Users, color: 'green' },
            { type: 'matches', label: 'Matchs', icon: Calendar, color: 'orange' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.type} className="border border-gray-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <Icon className={`h-10 w-10 text-${item.color}-500 mx-auto mb-3`} />
                  <h4 className="font-semibold text-gray-900">{item.label}</h4>
                </div>

                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileImport(e, item.type as any)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <button
                    onClick={() => downloadTemplate(item.type as any)}
                    className={`w-full bg-${item.color}-50 hover:bg-${item.color}-100 text-${item.color}-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors`}
                  >
                    Télécharger le modèle
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-yellow-50 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Utilisez uniquement des fichiers CSV (séparés par des virgules)</li>
            <li>• Respectez exactement les noms de colonnes des modèles</li>
            <li>• Pour les joueurs, les équipes doivent déjà exister dans le tournoi</li>
            <li>• Pour les matchs, les équipes doivent déjà être créées</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderExportTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Download className="h-6 w-6 text-green-500 mr-2" />
          Export des Données
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              type: 'teams', 
              label: 'Équipes', 
              icon: Users, 
              color: 'blue',
              count: currentTournament.teams.length,
              description: 'Toutes les équipes avec statistiques'
            },
            { 
              type: 'players', 
              label: 'Joueurs', 
              icon: Users, 
              color: 'green',
              count: currentTournament.teams.reduce((sum, team) => sum + team.players.length, 0),
              description: 'Tous les joueurs avec statistiques'
            },
            { 
              type: 'matches', 
              label: 'Matchs', 
              icon: Calendar, 
              color: 'orange',
              count: currentTournament.matches.length,
              description: 'Calendrier complet et résultats'
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.type} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-center mb-4">
                  <Icon className={`h-10 w-10 text-${item.color}-500 mx-auto mb-3`} />
                  <h4 className="font-semibold text-gray-900">{item.label}</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>

                <div className="text-center mb-4">
                  <div className={`text-2xl font-bold text-${item.color}-600`}>{item.count}</div>
                  <div className="text-sm text-gray-500">éléments</div>
                </div>

                <button
                  onClick={() => exportData(item.type as any)}
                  disabled={item.count === 0}
                  className={`w-full bg-${item.color}-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-${item.color}-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                >
                  <Download className="h-4 w-4" />
                  <span>Exporter CSV</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">✅ Avantages de l'export CSV</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Compatible avec Excel, Google Sheets, et tous les tableurs</li>
            <li>• Facile à modifier et réimporter</li>
            <li>• Format universel pour partager les données</li>
            <li>• Idéal pour créer des rapports personnalisés</li>
          </ul>
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
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Opération réussie !</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Database className="h-6 w-6 text-blue-500 mr-2" />
            Import/Export CSV Simple
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
            { key: 'templates', label: 'Modèles', icon: FileText },
            { key: 'import', label: 'Import', icon: Upload },
            { key: 'export', label: 'Export', icon: Download }
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
          {activeTab === 'templates' && renderTemplatesTab()}
          {activeTab === 'import' && renderImportTab()}
          {activeTab === 'export' && renderExportTab()}
        </div>
      </div>
    </div>
  );
};