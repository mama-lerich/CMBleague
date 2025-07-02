import React from 'react';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import { Tournament } from '../../types';

interface HallOfFameProps {
  tournaments: Tournament[];
}

export const HallOfFame: React.FC<HallOfFameProps> = ({ tournaments }) => {
  // Get completed tournaments and sort by date (most recent first)
  const completedTournaments = tournaments
    .filter(tournament => tournament.status === 'completed' || tournament.status === 'finished')
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.startDate).getTime());

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-6 h-6 text-blue-500" />;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  if (completedTournaments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">Hall of Fame</h1>
            <p className="text-xl text-gray-300">Aucun tournoi terminé pour le moment. Revenez après la fin des tournois !</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
            Hall of Fame
          </h1>
          <p className="text-xl text-gray-300">Célébrons nos champions et légendes du tournoi</p>
        </div>

        <div className="space-y-8">
          {completedTournaments.map((tournament, index) => (
            <div
              key={tournament.id}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{tournament.name}</h2>
                  <p className="text-gray-300">
                    {new Date(tournament.startDate).toLocaleDateString('fr-FR')} - {new Date(tournament.endDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 uppercase tracking-wide">Tournoi #{index + 1}</div>
                </div>
              </div>

              {tournament.standings && tournament.standings.length > 0 ? (
                <div className="grid gap-4">
                  {tournament.standings.slice(0, 8).map((standing, standingIndex) => (
                    <div
                      key={standing.teamId}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        standingIndex < 3 
                          ? `${getPositionColor(standingIndex + 1)} text-white shadow-lg` 
                          : 'bg-white/5 text-gray-200 border border-white/10'
                      } transition-all duration-300 hover:scale-105`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getPositionIcon(standingIndex + 1)}
                          <span className="text-2xl font-bold">#{standingIndex + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{standing.teamName}</h3>
                          <div className="flex space-x-4 text-sm opacity-90">
                            <span>Joués: {standing.played}</span>
                            <span>Victoires: {standing.won}</span>
                            <span>Défaites: {standing.lost}</span>
                            {standing.drawn !== undefined && <span>Nuls: {standing.drawn}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{standing.points} pts</div>
                        <div className="text-sm opacity-90">
                          Diff: {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Aucun classement disponible pour ce tournoi</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {completedTournaments.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Bientôt disponible</h2>
            <p className="text-xl text-gray-300">Les champions du tournoi seront affichés ici une fois les tournois terminés !</p>
          </div>
        )}
      </div>
    </div>
  );
};