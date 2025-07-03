import React, { useState, useMemo } from 'react';
import { 
  Trophy, Medal, Award, Star, Target, Shield, Users, Zap, 
  Clock, Heart, Crown, TrendingUp, Flame, Timer, Save,
  RotateCcw, Filter, Search, Calendar, ChevronRight
} from 'lucide-react';
import { Tournament, HallOfFameRecord, HallOfFameCategory } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface HallOfFameProps {
  tournaments: Tournament[];
}

export const HallOfFame: React.FC<HallOfFameProps> = ({ tournaments }) => {
  const { userRole } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<HallOfFameCategory | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Configuration des catégories avec icônes et couleurs
  const categories = [
    { 
      key: 'best_team_ever' as HallOfFameCategory, 
      label: 'Meilleure Équipe', 
      icon: Crown, 
      color: 'from-yellow-400 to-yellow-600',
      description: 'L\'équipe la plus dominante de tous les temps'
    },
    { 
      key: 'top_scorer' as HallOfFameCategory, 
      label: 'Meilleur Buteur', 
      icon: Target, 
      color: 'from-green-400 to-green-600',
      description: 'Le roi des buts'
    },
    { 
      key: 'top_assistant' as HallOfFameCategory, 
      label: 'Meilleur Passeur', 
      icon: TrendingUp, 
      color: 'from-blue-400 to-blue-600',
      description: 'Le maître des passes décisives'
    },
    { 
      key: 'best_goalkeeper' as HallOfFameCategory, 
      label: 'Meilleur Gardien', 
      icon: Shield, 
      color: 'from-purple-400 to-purple-600',
      description: 'Le mur infranchissable'
    },
    { 
      key: 'best_young_player' as HallOfFameCategory, 
      label: 'Révélation', 
      icon: Star, 
      color: 'from-orange-400 to-orange-600',
      description: 'La pépite qui a brillé'
    },
    { 
      key: 'best_defender' as HallOfFameCategory, 
      label: 'Meilleur Défenseur', 
      icon: Shield, 
      color: 'from-red-400 to-red-600',
      description: 'Le roc défensif'
    },
    { 
      key: 'best_coach' as HallOfFameCategory, 
      label: 'Meilleur Entraîneur', 
      icon: Users, 
      color: 'from-indigo-400 to-indigo-600',
      description: 'Le tacticien de génie'
    },
    { 
      key: 'fair_play_team' as HallOfFameCategory, 
      label: 'Fair-Play', 
      icon: Heart, 
      color: 'from-pink-400 to-pink-600',
      description: 'L\'esprit sportif exemplaire'
    },
    { 
      key: 'goal_of_year' as HallOfFameCategory, 
      label: 'But de l\'Année', 
      icon: Zap, 
      color: 'from-yellow-400 to-orange-600',
      description: 'Le but le plus spectaculaire'
    },
    { 
      key: 'legendary_match' as HallOfFameCategory, 
      label: 'Match Légendaire', 
      icon: Flame, 
      color: 'from-red-400 to-pink-600',
      description: 'Le match inoubliable'
    },
    { 
      key: 'most_titled_club' as HallOfFameCategory, 
      label: 'Club le Plus Titré', 
      icon: Trophy, 
      color: 'from-yellow-400 to-yellow-600',
      description: 'La dynastie du football'
    },
    { 
      key: 'most_consistent_player' as HallOfFameCategory, 
      label: 'Joueur le Plus Régulier', 
      icon: TrendingUp, 
      color: 'from-green-400 to-blue-600',
      description: 'La constance incarnée'
    },
    { 
      key: 'coach_revelation' as HallOfFameCategory, 
      label: 'Coach Révélation', 
      icon: Star, 
      color: 'from-purple-400 to-pink-600',
      description: 'L\'entraîneur qui a surpris'
    },
    { 
      key: 'exceptional_performance' as HallOfFameCategory, 
      label: 'Performance Exceptionnelle', 
      icon: Medal, 
      color: 'from-orange-400 to-red-600',
      description: 'L\'exploit individuel'
    },
    { 
      key: 'best_stadium_atmosphere' as HallOfFameCategory, 
      label: 'Meilleure Ambiance', 
      icon: Users, 
      color: 'from-blue-400 to-purple-600',
      description: 'L\'ambiance électrisante'
    },
    { 
      key: 'longest_winning_streak' as HallOfFameCategory, 
      label: 'Plus Longue Série', 
      icon: Flame, 
      color: 'from-red-400 to-orange-600',
      description: 'L\'invincibilité'
    },
    { 
      key: 'fastest_goal' as HallOfFameCategory, 
      label: 'But le Plus Rapide', 
      icon: Timer, 
      color: 'from-yellow-400 to-red-600',
      description: 'L\'éclair de génie'
    },
    { 
      key: 'most_saves_match' as HallOfFameCategory, 
      label: 'Plus d\'Arrêts', 
      icon: Save, 
      color: 'from-purple-400 to-blue-600',
      description: 'La performance défensive'
    },
    { 
      key: 'comeback_of_year' as HallOfFameCategory, 
      label: 'Remontada de l\'Année', 
      icon: RotateCcw, 
      color: 'from-green-400 to-teal-600',
      description: 'Le retour impossible'
    }
  ];

  // Génération des données du Hall of Fame basées sur les tournois
  const hallOfFameRecords = useMemo(() => {
    const records: HallOfFameRecord[] = [];
    
    tournaments.forEach(tournament => {
      if (tournament.status === 'finished' || tournament.status === 'completed') {
        const allPlayers = tournament.teams.flatMap(team => 
          team.players.map(player => ({ ...player, teamName: team.name }))
        );
        
        // Meilleur buteur
        const topScorer = allPlayers.sort((a, b) => b.stats.goals - a.stats.goals)[0];
        if (topScorer && topScorer.stats.goals > 0) {
          records.push({
            id: `${tournament.id}-top-scorer`,
            category: 'top_scorer',
            title: 'Meilleur Buteur',
            description: `Avec ${topScorer.stats.goals} buts marqués`,
            year: tournament.year,
            tournamentId: tournament.id,
            tournamentName: tournament.name,
            recipient: {
              type: 'player',
              id: topScorer.id,
              name: topScorer.name,
              teamName: topScorer.teamName,
              photo: topScorer.photo
            },
            stats: {
              value: topScorer.stats.goals,
              unit: 'buts',
              context: `en ${topScorer.stats.gamesPlayed} matchs`
            }
          });
        }

        // Meilleur passeur
        const topAssistant = allPlayers.sort((a, b) => b.stats.assists - a.stats.assists)[0];
        if (topAssistant && topAssistant.stats.assists > 0) {
          records.push({
            id: `${tournament.id}-top-assistant`,
            category: 'top_assistant',
            title: 'Meilleur Passeur',
            description: `Avec ${topAssistant.stats.assists} passes décisives`,
            year: tournament.year,
            tournamentId: tournament.id,
            tournamentName: tournament.name,
            recipient: {
              type: 'player',
              id: topAssistant.id,
              name: topAssistant.name,
              teamName: topAssistant.teamName,
              photo: topAssistant.photo
            },
            stats: {
              value: topAssistant.stats.assists,
              unit: 'passes',
              context: `en ${topAssistant.stats.gamesPlayed} matchs`
            }
          });
        }

        // Meilleure équipe (champion)
        const champion = tournament.teams.sort((a, b) => b.stats.points - a.stats.points)[0];
        if (champion) {
          records.push({
            id: `${tournament.id}-champion`,
            category: 'best_team_ever',
            title: 'Champion',
            description: `Vainqueur avec ${champion.stats.points} points`,
            year: tournament.year,
            tournamentId: tournament.id,
            tournamentName: tournament.name,
            recipient: {
              type: 'team',
              id: champion.id,
              name: champion.name,
              details: {
                coach: champion.coach,
                wins: champion.stats.wins,
                goals: champion.stats.goalsFor
              }
            },
            stats: {
              value: champion.stats.points,
              unit: 'points',
              context: `${champion.stats.wins} victoires`
            }
          });
        }

        // Équipe Fair-Play (moins de cartons)
        const fairPlayTeam = tournament.teams.sort((a, b) => {
          const aCards = a.players.reduce((sum, p) => sum + p.stats.yellowCards + p.stats.redCards, 0);
          const bCards = b.players.reduce((sum, p) => sum + p.stats.yellowCards + p.stats.redCards, 0);
          return aCards - bCards;
        })[0];
        
        if (fairPlayTeam) {
          const totalCards = fairPlayTeam.players.reduce((sum, p) => sum + p.stats.yellowCards + p.stats.redCards, 0);
          records.push({
            id: `${tournament.id}-fair-play`,
            category: 'fair_play_team',
            title: 'Prix Fair-Play',
            description: `Seulement ${totalCards} cartons reçus`,
            year: tournament.year,
            tournamentId: tournament.id,
            tournamentName: tournament.name,
            recipient: {
              type: 'team',
              id: fairPlayTeam.id,
              name: fairPlayTeam.name,
              details: {
                yellowCards: fairPlayTeam.players.reduce((sum, p) => sum + p.stats.yellowCards, 0),
                redCards: fairPlayTeam.players.reduce((sum, p) => sum + p.stats.redCards, 0)
              }
            },
            stats: {
              value: totalCards,
              unit: 'cartons',
              context: 'discipline exemplaire'
            }
          });
        }

        // Meilleur gardien (plus d'arrêts)
        const goalkeepers = allPlayers.filter(p => p.position === 'Gardien' && p.stats.saves);
        const bestGoalkeeper = goalkeepers.sort((a, b) => (b.stats.saves || 0) - (a.stats.saves || 0))[0];
        if (bestGoalkeeper && bestGoalkeeper.stats.saves) {
          records.push({
            id: `${tournament.id}-best-goalkeeper`,
            category: 'best_goalkeeper',
            title: 'Meilleur Gardien',
            description: `${bestGoalkeeper.stats.saves} arrêts réalisés`,
            year: tournament.year,
            tournamentId: tournament.id,
            tournamentName: tournament.name,
            recipient: {
              type: 'player',
              id: bestGoalkeeper.id,
              name: bestGoalkeeper.name,
              teamName: bestGoalkeeper.teamName,
              photo: bestGoalkeeper.photo
            },
            stats: {
              value: bestGoalkeeper.stats.saves,
              unit: 'arrêts',
              context: `en ${bestGoalkeeper.stats.gamesPlayed} matchs`
            }
          });
        }

        // Révélation (jeune joueur avec bonnes stats)
        const youngPlayers = allPlayers.filter(p => p.age && p.age <= 22);
        const revelation = youngPlayers.sort((a, b) => 
          (b.stats.goals + b.stats.assists) - (a.stats.goals + a.stats.assists)
        )[0];
        if (revelation && (revelation.stats.goals + revelation.stats.assists) > 2) {
          records.push({
            id: `${tournament.id}-revelation`,
            category: 'best_young_player',
            title: 'Révélation de l\'Année',
            description: `${revelation.age} ans, ${revelation.stats.goals + revelation.stats.assists} contributions`,
            year: tournament.year,
            tournamentId: tournament.id,
            tournamentName: tournament.name,
            recipient: {
              type: 'player',
              id: revelation.id,
              name: revelation.name,
              teamName: revelation.teamName,
              photo: revelation.photo,
              details: { age: revelation.age }
            },
            stats: {
              value: revelation.stats.goals + revelation.stats.assists,
              unit: 'contributions',
              context: `à seulement ${revelation.age} ans`
            }
          });
        }
      }
    });

    return records;
  }, [tournaments]);

  // Filtrage des records
  const filteredRecords = hallOfFameRecords.filter(record => {
    const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory;
    const matchesYear = selectedYear === 'all' || record.year === selectedYear;
    const matchesSearch = searchTerm === '' || 
      record.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.tournamentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesYear && matchesSearch;
  });

  // Années disponibles
  const availableYears = [...new Set(hallOfFameRecords.map(r => r.year))].sort((a, b) => b - a);

  if (hallOfFameRecords.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">Hall of Fame</h1>
            <p className="text-xl text-gray-300">
              Les légendes apparaîtront ici après la fin des tournois !
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
            Hall of Fame
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Célébrons nos légendes et moments inoubliables
          </p>
          
          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {/* Year Filter */}
              <div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="all">Toutes les années</option>
                  {availableYears.map(year => (
                    <option key={year} value={year} className="text-gray-900">{year}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as HallOfFameCategory | 'all')}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map(cat => (
                    <option key={cat.key} value={cat.key} className="text-gray-900">{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Category Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === 'all'
                    ? 'bg-yellow-500 text-black shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Tout
              </button>
              {categories.slice(0, 6).map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedCategory === cat.key
                        ? 'bg-yellow-500 text-black shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Records Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecords.map((record) => {
            const category = categories.find(c => c.key === record.category);
            const Icon = category?.icon || Trophy;
            
            return (
              <div
                key={record.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${category?.color || 'from-gray-400 to-gray-600'}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-300">{record.year}</div>
                    <div className="text-xs text-gray-400">{record.tournamentName}</div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2">{record.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{record.description}</p>

                {/* Recipient */}
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      {record.recipient.photo ? (
                        <img
                          src={record.recipient.photo}
                          alt={record.recipient.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {record.recipient.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{record.recipient.name}</h4>
                      {record.recipient.teamName && (
                        <p className="text-sm text-gray-300">{record.recipient.teamName}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {record.stats && (
                  <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {record.stats.value}
                        </div>
                        <div className="text-sm text-gray-300">{record.stats.unit}</div>
                      </div>
                      {record.stats.context && (
                        <div className="text-xs text-gray-400 text-right">
                          {record.stats.context}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Achievement Badge */}
                {record.achievement && (
                  <div className="mt-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                      <Medal className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-300 text-sm font-medium">
                        {record.achievement}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredRecords.length === 0 && (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Aucun record trouvé
            </h3>
            <p className="text-gray-400">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        )}

        {/* Statistics Summary */}
        {filteredRecords.length > 0 && (
          <div className="mt-16 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Statistiques du Hall of Fame
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {hallOfFameRecords.length}
                </div>
                <div className="text-gray-300">Records totaux</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {availableYears.length}
                </div>
                <div className="text-gray-300">Années couvertes</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {categories.length}
                </div>
                <div className="text-gray-300">Catégories</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {[...new Set(hallOfFameRecords.map(r => r.recipient.name))].length}
                </div>
                <div className="text-gray-300">Légendes uniques</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};