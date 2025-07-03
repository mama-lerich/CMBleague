import { TournamentFormatConfig, TournamentFormat, TournamentPhase } from '../types';

export const TOURNAMENT_FORMATS: Record<TournamentFormat, TournamentFormatConfig> = {
  league: {
    id: 'league',
    name: 'Format Liga/Premier League',
    description: 'Championnat où toutes les équipes se rencontrent en matchs aller-retour. L\'équipe avec le plus de points remporte le titre.',
    icon: '🏆',
    minTeams: 6,
    maxTeams: 20,
    recommendedTeams: [8, 10, 12, 16, 20],
    features: [
      'Matchs aller-retour entre toutes les équipes',
      'Classement basé sur les points (3 pts victoire, 1 pt nul)',
      'Le champion est l\'équipe avec le plus de points',
      'Pas d\'élimination directe',
      'Saison longue et équitable'
    ],
    phases: [
      {
        id: 'league_phase',
        name: 'Phase de Championnat',
        type: 'league',
        format: 'home_away',
        homeAndAway: true
      }
    ]
  },

  world_cup: {
    id: 'world_cup',
    name: 'Format Coupe du Monde',
    description: 'Phase de groupes suivie de phases éliminatoires. Les meilleures équipes de chaque groupe se qualifient pour les phases finales.',
    icon: '🌍',
    minTeams: 8,
    maxTeams: 32,
    recommendedTeams: [8, 16, 24, 32],
    features: [
      'Phase de groupes (round-robin)',
      'Qualification des meilleures équipes',
      'Phases éliminatoires (1/8, 1/4, 1/2, finale)',
      'Matchs à élimination directe',
      'Format compact et spectaculaire'
    ],
    phases: [
      {
        id: 'group_stage',
        name: 'Phase de Groupes',
        type: 'group_stage',
        format: 'round_robin',
        groupsCount: 4,
        teamsPerGroup: 4,
        teamsAdvancing: 2
      },
      {
        id: 'round_of_16',
        name: 'Huitièmes de finale',
        type: 'knockout',
        format: 'single_elimination'
      },
      {
        id: 'quarter_finals',
        name: 'Quarts de finale',
        type: 'knockout',
        format: 'single_elimination'
      },
      {
        id: 'semi_finals',
        name: 'Demi-finales',
        type: 'knockout',
        format: 'single_elimination'
      },
      {
        id: 'final',
        name: 'Finale',
        type: 'knockout',
        format: 'single_elimination'
      }
    ]
  },

  champions_league: {
    id: 'champions_league',
    name: 'Format Ligue des Champions',
    description: 'Phase de groupes puis phases éliminatoires avec matchs aller-retour. Le format le plus prestigieux.',
    icon: '⭐',
    minTeams: 16,
    maxTeams: 32,
    recommendedTeams: [16, 24, 32],
    features: [
      'Phase de groupes (round-robin)',
      'Phases éliminatoires avec matchs aller-retour',
      'Règle des buts à l\'extérieur',
      'Finale sur terrain neutre',
      'Format prestigieux et équilibré'
    ],
    phases: [
      {
        id: 'group_stage',
        name: 'Phase de Groupes',
        type: 'group_stage',
        format: 'round_robin',
        groupsCount: 8,
        teamsPerGroup: 4,
        teamsAdvancing: 2
      },
      {
        id: 'round_of_16',
        name: 'Huitièmes de finale',
        type: 'knockout',
        format: 'two_legged',
        homeAndAway: true
      },
      {
        id: 'quarter_finals',
        name: 'Quarts de finale',
        type: 'knockout',
        format: 'two_legged',
        homeAndAway: true
      },
      {
        id: 'semi_finals',
        name: 'Demi-finales',
        type: 'knockout',
        format: 'two_legged',
        homeAndAway: true
      },
      {
        id: 'final',
        name: 'Finale',
        type: 'knockout',
        format: 'single_elimination'
      }
    ]
  }
};

export const getFormatConfig = (format: TournamentFormat): TournamentFormatConfig => {
  return TOURNAMENT_FORMATS[format];
};

export const getRecommendedGroupsForTeams = (format: TournamentFormat, teamCount: number): { groupsCount: number; teamsPerGroup: number } => {
  const config = TOURNAMENT_FORMATS[format];
  
  if (format === 'league') {
    return { groupsCount: 1, teamsPerGroup: teamCount };
  }
  
  // Pour les formats avec groupes
  if (teamCount <= 8) {
    return { groupsCount: 2, teamsPerGroup: 4 };
  } else if (teamCount <= 12) {
    return { groupsCount: 3, teamsPerGroup: 4 };
  } else if (teamCount <= 16) {
    return { groupsCount: 4, teamsPerGroup: 4 };
  } else if (teamCount <= 24) {
    return { groupsCount: 6, teamsPerGroup: 4 };
  } else {
    return { groupsCount: 8, teamsPerGroup: 4 };
  }
};