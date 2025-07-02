import React, { useState } from 'react';
import { Archive, Trophy, Calendar, Users, Medal, ChevronRight } from 'lucide-react';
import { Tournament } from '../../types';

interface ArchivesProps {
  tournaments: Tournament[];
}

export const Archives: React.FC<ArchivesProps> = ({ tournaments }) => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Archive className="h-7 w-7 text-purple-600 mr-3" />
              Archives des Tournois
            </h1>
            <p className="text-gray-600 mt-1">
              Historique complet de la Coupe Mario Brutus
            </p>
          </div>

          {/* Year Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Toutes les années</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{finishedTournaments.length}</div>
          <div className="text-sm text-gray-600">Éditions</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {finishedTournaments.reduce((sum, t) => sum + t.teams.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Équipes totales</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {finishedTournaments.reduce((sum, t) => sum + t.matches.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Matchs joués</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <Medal className="h-8 w-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {years.length > 0 ? `${Math.min(...years)}-${Math.max(...years)}` : 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Période</div>
        </div>
      </div>

      {/* Tournaments List */}
      <div className="space-y-4">
        {filteredTournaments.length > 0 ? (
          filteredTournaments.map((tournament) => {
            const winner = getWinner(tournament);
            const topScorer = getTopScorer(tournament);
            
            return (
              <div key={tournament.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Tournament Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        <h3 className="text-xl font-bold text-gray-900">{tournament.name}</h3>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                          {tournament.year}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Équipes:</span> {tournament.teams.length}
                        </div>
                        <div>
                          <span className="font-medium">Matchs:</span> {tournament.matches.length}
                        </div>
                        <div>
                          <span className="font-medium">Groupes:</span> {tournament.groups.length}
                        </div>
                        <div>
                          <span className="font-medium">Durée:</span> {' '}
                          {Math.ceil((tournament.endDate.getTime() - tournament.startDate.getTime()) / (1000 * 60 * 60 * 24))} jours
                        </div>
                      </div>
                    </div>

                    {/* Winners Info */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      {winner && (
                        <div className="bg-yellow-50 rounded-lg p-4 text-center">
                          <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                          <div className="font-semibold text-gray-900 text-sm">Vainqueur</div>
                          <div className="text-yellow-700 font-bold">{winner.name}</div>
                        </div>
                      )}
                      
                      {topScorer && (
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <Medal className="h-5 w-5 text-green-500 mx-auto mb-1" />
                          <div className="font-semibold text-gray-900 text-sm">Meilleur buteur</div>
                          <div className="text-green-700 font-bold">{topScorer.name}</div>
                          <div className="text-xs text-green-600">{topScorer.stats.goals} buts</div>
                        </div>
                      )}
                    </div>

                    {/* View Details */}
                    <button className="flex items-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-lg transition-colors duration-200">
                      <span className="font-medium">Voir détails</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="text-center">
              <Archive className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucun tournoi archivé
              </h3>
              <p className="text-gray-500">
                {selectedYear !== 'all' 
                  ? `Aucun tournoi trouvé pour l'année ${selectedYear}`
                  : 'Les tournois terminés apparaîtront ici'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};