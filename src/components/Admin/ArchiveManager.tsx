import React, { useState } from 'react';
import { Archive, Eye, Download, Share2, Calendar, Trophy, Users, Target, X, ChevronRight, Filter } from 'lucide-react';
import { Tournament } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface ArchiveManagerProps {
  onClose: () => void;
}

export const ArchiveManager: React.FC<ArchiveManagerProps> = ({ onClose }) => {
  const { tournaments } = useApp();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const finishedTournaments = tournaments.filter(t => t.status === 'finished');
  const years = [...new Set(finishedTournaments.map(t => t.year))].sort((a, b) => b - a);
  
  const filteredTournaments = selectedYear === 'all' 
    ? finishedTournaments 
    : finishedTournaments.filter(t => t.year === selectedYear);

  const getWinner = (tournament: Tournament) => {
    if (tournament.teams.length === 0) return null;
    return tournament.teams.sort((a, b) => b.stats.points - a.stats.points)[0];
  };

  const getTopScorer = (tournament: Tournament) => {
    const allPlayers = tournament.teams.flatMap(team => team.players);
    if (allPlayers.length === 0) return null;
    return allPlayers.sort((a, b) => b.stats.goals - a.stats.goals)[0];
  };

  const getTournamentStats = (tournament: Tournament) => {
    const totalGoals = tournament.teams.flatMap(t => t.players).reduce((sum, p) => sum + p.stats.goals, 0);
    const totalPlayers = tournament.teams.reduce((sum, t) => sum + t.players.length, 0);
    const finishedMatches = tournament.matches.filter(m => m.status === 'finished').length;
    
    return {
      totalGoals,
      totalPlayers,
      finishedMatches,
      averageGoalsPerMatch: finishedMatches > 0 ? (totalGoals / finishedMatches).toFixed(1) : '0'
    };
  };

  const handleExportTournament = (tournament: Tournament) => {
    const data = {
      tournament: {
        name: tournament.name,
        year: tournament.year,
        location: tournament.location,
        startDate: tournament.startDate.toISOString(),
        endDate: tournament.endDate.toISOString(),
        description: tournament.description
      },
      teams: tournament.teams.map(team => ({
        name: team.name,
        group: team.group,
        coach: team.coach,
        stats: team.stats,
        players: team.players.map(player => ({
          name: player.name,
          number: player.number,
          position: player.position,
          stats: player.stats
        }))
      })),
      matches: tournament.matches.map(match => ({
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        date: match.date.toISOString(),
        venue: match.venue,
        score: match.score,
        status: match.status
      })),
      statistics: getTournamentStats(tournament),
      winner: getWinner(tournament)?.name,
      topScorer: getTopScorer(tournament)
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archive_${tournament.name.replace(/\s+/g, '_')}_${tournament.year}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderTournamentDetails = () => {
    if (!selectedTournament) return null;

    const winner = getWinner(selectedTournament);
    const topScorer = getTopScorer(selectedTournament);
    const stats = getTournamentStats(selectedTournament);

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedTournament(null)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronRight className="h-5 w-5 rotate-180" />
          <span>Retour aux archives</span>
        </button>

        {/* Tournament Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedTournament.name}</h2>
              <p className="text-gray-600 mt-1">{selectedTournament.description}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExportTournament(selectedTournament)}
                className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Exporter</span>
              </button>
              <button className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Partager</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{selectedTournament.teams.length}</div>
              <div className="text-sm text-blue-600">Équipes</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{stats.totalPlayers}</div>
              <div className="text-sm text-green-600">Joueurs</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">{stats.totalGoals}</div>
              <div className="text-sm text-orange-600">Buts</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{stats.finishedMatches}</div>
              <div className="text-sm text-purple-600">Matchs</div>
            </div>
          </div>
        </div>

        {/* Winners and Records */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {winner && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                Équipe Championne
              </h3>
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-bold text-xl text-yellow-900">{winner.name}</h4>
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-yellow-700">{winner.stats.points}</div>
                    <div className="text-yellow-600">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-yellow-700">{winner.stats.wins}</div>
                    <div className="text-yellow-600">Victoires</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-yellow-700">{winner.stats.goalDifference}</div>
                    <div className="text-yellow-600">Diff. buts</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {topScorer && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 text-green-500 mr-2" />
                Meilleur Buteur
              </h3>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-bold text-xl text-green-900">{topScorer.name}</h4>
                <p className="text-green-700 mb-3">#{topScorer.number} • {topScorer.position}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-green-700">{topScorer.stats.goals}</div>
                    <div className="text-green-600">Buts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-700">{topScorer.stats.assists}</div>
                    <div className="text-green-600">Passes</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Teams Ranking */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Classement Final
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Pos</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Équipe</th>
                  <th className="text-center py-2 px-4 text-sm font-semibold text-gray-600">MJ</th>
                  <th className="text-center py-2 px-4 text-sm font-semibold text-gray-600">V</th>
                  <th className="text-center py-2 px-4 text-sm font-semibold text-gray-600">N</th>
                  <th className="text-center py-2 px-4 text-sm font-semibold text-gray-600">D</th>
                  <th className="text-center py-2 px-4 text-sm font-semibold text-gray-600">Pts</th>
                </tr>
              </thead>
              <tbody>
                {selectedTournament.teams
                  .sort((a, b) => b.stats.points - a.stats.points)
                  .map((team, index) => (
                    <tr key={team.id} className={`border-b border-gray-100 ${index < 3 ? 'bg-yellow-50' : ''}`}>
                      <td className="py-2 px-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-2 px-4 font-medium">{team.name}</td>
                      <td className="text-center py-2 px-4">{team.stats.gamesPlayed}</td>
                      <td className="text-center py-2 px-4 text-green-600">{team.stats.wins}</td>
                      <td className="text-center py-2 px-4 text-gray-600">{team.stats.draws}</td>
                      <td className="text-center py-2 px-4 text-red-600">{team.stats.losses}</td>
                      <td className="text-center py-2 px-4">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold text-sm">
                          {team.stats.points}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Match Results */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Résultats des Matchs
          </h3>
          <div className="space-y-3">
            {selectedTournament.matches
              .filter(m => m.status === 'finished')
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {match.homeTeam.name} vs {match.awayTeam.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {match.date.toLocaleDateString('fr-FR')} • {match.venue}
                    </div>
                  </div>
                  {match.score && (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
                      {match.score.home} - {match.score.away}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTournamentGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTournaments.map((tournament) => {
        const winner = getWinner(tournament);
        const topScorer = getTopScorer(tournament);
        const stats = getTournamentStats(tournament);
        
        return (
          <div key={tournament.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{tournament.name}</h3>
                  <p className="text-sm text-gray-600">{tournament.year}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-700">{tournament.teams.length}</div>
                  <div className="text-xs text-blue-600">Équipes</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-700">{stats.totalGoals}</div>
                  <div className="text-xs text-green-600">Buts</div>
                </div>
              </div>

              {winner && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-yellow-600">Champion</div>
                  <div className="font-bold text-yellow-900">{winner.name}</div>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedTournament(tournament)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Détails</span>
                </button>
                <button
                  onClick={() => handleExportTournament(tournament)}
                  className="bg-green-50 hover:bg-green-100 text-green-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (selectedTournament) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-gray-50 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {renderTournamentDetails()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Archive className="h-6 w-6 text-purple-500 mr-2" />
            Gestion des Archives
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">Toutes les années</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-600">
                {filteredTournaments.length} tournoi{filteredTournaments.length !== 1 ? 's' : ''} archivé{filteredTournaments.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Filter className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Users className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {filteredTournaments.length > 0 ? (
            renderTournamentGrid()
          ) : (
            <div className="text-center py-12">
              <Archive className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucune archive trouvée
              </h3>
              <p className="text-gray-500">
                {selectedYear !== 'all' 
                  ? `Aucun tournoi archivé pour l'année ${selectedYear}`
                  : 'Aucun tournoi terminé à afficher'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};