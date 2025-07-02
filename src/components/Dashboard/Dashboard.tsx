import React from 'react';
import { Trophy, Users, Calendar, Target } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { StatsCard } from './StatsCard';
import { UpcomingMatches } from './UpcomingMatches';
import { RecentResults } from './RecentResults';
import { TopScorers } from './TopScorers';

export const Dashboard: React.FC = () => {
  const { currentTournament } = useApp();

  if (!currentTournament) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Aucun tournoi sélectionné
          </h2>
          <p className="text-gray-500">
            Sélectionnez un tournoi pour voir le tableau de bord
          </p>
        </div>
      </div>
    );
  }

  const allPlayers = currentTournament.teams.flatMap(team => team.players);
  const totalGoals = allPlayers.reduce((sum, player) => sum + player.stats.goals, 0);
  const upcomingMatches = currentTournament.matches.filter(m => m.status === 'upcoming');
  const finishedMatches = currentTournament.matches.filter(m => m.status === 'finished');

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{currentTournament.name}</h1>
            <p className="text-green-100 text-lg">
              {currentTournament.teams.length} équipes • {currentTournament.groups.length} groupes
            </p>
            <div className="mt-4 flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>
                  {currentTournament.startDate.toLocaleDateString('fr-FR')} - 
                  {currentTournament.endDate.toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="font-semibold capitalize">{currentTournament.status}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <Trophy className="h-20 w-20 text-white opacity-60" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Équipes"
          value={currentTournament.teams.length}
          subtitle="Équipes inscrites"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Matchs Joués"
          value={finishedMatches.length}
          subtitle={`Sur ${currentTournament.matches.length} au total`}
          icon={Calendar}
          color="green"
        />
        <StatsCard
          title="Buts Marqués"
          value={totalGoals}
          subtitle="Tous matchs confondus"
          icon={Target}
          color="orange"
        />
        <StatsCard
          title="Prochains Matchs"
          value={upcomingMatches.length}
          subtitle="À venir cette semaine"
          icon={Trophy}
          color="purple"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <UpcomingMatches matches={currentTournament.matches} />
        </div>
        
        <div className="space-y-8">
          <RecentResults matches={currentTournament.matches} />
          <TopScorers players={allPlayers} />
        </div>
      </div>
    </div>
  );
};