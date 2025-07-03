import { Tournament, Team, Player, Match, MatchEvent, Sponsor } from '../types';

// Mock Players with enhanced data
const players: Player[] = [
  {
    id: '1',
    name: 'Jean-Baptiste Koné',
    number: 10,
    position: 'Attaquant',
    teamId: '1',
    age: 24,
    height: 178,
    weight: 72,
    nationality: 'Haiti',
    stats: { 
      goals: 8, 
      assists: 4, 
      yellowCards: 2, 
      redCards: 0, 
      gamesPlayed: 6,
      minutesPlayed: 540
    },
    awards: ['Meilleur buteur 2024', 'Joueur du match - Finale']
  },
  {
    id: '2',
    name: 'Mohamed Traoré',
    number: 9,
    position: 'Attaquant',
    teamId: '1',
    age: 22,
    height: 175,
    weight: 70,
    nationality: 'Mali',
    stats: { 
      goals: 6, 
      assists: 2, 
      yellowCards: 1, 
      redCards: 0, 
      gamesPlayed: 6,
      minutesPlayed: 480
    }
  },
  {
    id: '3',
    name: 'Amadou Diallo',
    number: 7,
    position: 'Milieu',
    teamId: '2',
    age: 26,
    height: 180,
    weight: 75,
    nationality: 'Sénégal',
    stats: { 
      goals: 4, 
      assists: 6, 
      yellowCards: 3, 
      redCards: 1, 
      gamesPlayed: 5,
      minutesPlayed: 450
    }
  },
  {
    id: '4',
    name: 'Ibrahim Sané',
    number: 11,
    position: 'Ailier',
    teamId: '2',
    age: 23,
    height: 172,
    weight: 68,
    nationality: 'Sénégal',
    stats: { 
      goals: 5, 
      assists: 3, 
      yellowCards: 1, 
      redCards: 0, 
      gamesPlayed: 5,
      minutesPlayed: 420
    }
  },
  {
    id: '5',
    name: 'Ousmane Keita',
    number: 1,
    position: 'Gardien',
    teamId: '1',
    age: 28,
    height: 185,
    weight: 80,
    nationality: 'Guinée',
    stats: { 
      goals: 0, 
      assists: 0, 
      yellowCards: 1, 
      redCards: 0, 
      gamesPlayed: 6,
      minutesPlayed: 540,
      saves: 23
    }
  }
];

// Mock Teams with enhanced data
const teams: Team[] = [
  {
    id: '1',
    name: 'Les Lions FC',
    group: 'A',
    coach: 'Didier Konaté',
    founded: 2018,
    homeVenue: 'Stade Municipal',
    colors: { primary: '#16A34A', secondary: '#FFFFFF' },
    players: players.filter(p => p.teamId === '1'),
    stats: {
      points: 15,
      gamesPlayed: 6,
      wins: 5,
      draws: 0,
      losses: 1,
      goalsFor: 18,
      goalsAgainst: 8,
      goalDifference: 10,
      form: ['W', 'W', 'W', 'L', 'W']
    }
  },
  {
    id: '2',
    name: 'Étoiles United',
    group: 'A',
    coach: 'Mamadou Coulibaly',
    founded: 2019,
    homeVenue: 'Terrain Central',
    colors: { primary: '#2563EB', secondary: '#FFFFFF' },
    players: players.filter(p => p.teamId === '2'),
    stats: {
      points: 12,
      gamesPlayed: 5,
      wins: 4,
      draws: 0,
      losses: 1,
      goalsFor: 14,
      goalsAgainst: 6,
      goalDifference: 8,
      form: ['W', 'W', 'L', 'W', 'W']
    }
  },
  {
    id: '3',
    name: 'Dynamique Petion-Ville',
    group: 'B',
    coach: 'Youssouf Fofana',
    founded: 2020,
    homeVenue: 'Stade des Jeunes',
    colors: { primary: '#DC2626', secondary: '#FFFFFF' },
    players: [],
    stats: {
      points: 9,
      gamesPlayed: 5,
      wins: 3,
      draws: 0,
      losses: 2,
      goalsFor: 12,
      goalsAgainst: 10,
      goalDifference: 2,
      form: ['W', 'L', 'W', 'W', 'L']
    }
  },
  {
    id: '4',
    name: 'Sporting Daloa',
    group: 'B',
    coach: 'Seydou Doumbia',
    founded: 2017,
    homeVenue: 'Complexe Sportif',
    colors: { primary: '#7C3AED', secondary: '#FFFFFF' },
    players: [],
    stats: {
      points: 6,
      gamesPlayed: 5,
      wins: 2,
      draws: 0,
      losses: 3,
      goalsFor: 8,
      goalsAgainst: 12,
      goalDifference: -4,
      form: ['L', 'W', 'L', 'W', 'L']
    }
  }
];

// Mock Match Events
const matchEvents: MatchEvent[] = [
  {
    id: '1',
    type: 'goal',
    minute: 23,
    playerId: '1',
    playerName: 'Jean-Baptiste Koné',
    teamId: '1',
    description: 'But sur penalty'
  },
  {
    id: '2',
    type: 'yellow_card',
    minute: 45,
    playerId: '3',
    playerName: 'Amadou Diallo',
    teamId: '2',
    description: 'Faute sur Jean-Baptiste Koné'
  },
  {
    id: '3',
    type: 'goal',
    minute: 67,
    playerId: '2',
    playerName: 'Mohamed Traoré',
    teamId: '1',
    description: 'Reprise de volée'
  }
];

// Mock Matches with enhanced data
const matches: Match[] = [
  {
    id: '1',
    homeTeam: teams[0],
    awayTeam: teams[1],
    date: new Date('2024-12-30T15:00:00'),
    venue: 'Stade Municipal',
    status: 'upcoming',
    group: 'A',
    round: 'Demi-finale',
    referee: 'Koffi Adjoumani',
    attendance: 1200,
    weather: 'Ensoleillé, 28°C'
  },
  {
    id: '2',
    homeTeam: teams[2],
    awayTeam: teams[3],
    date: new Date('2024-12-28T18:00:00'),
    venue: 'Terrain Central',
    status: 'finished',
    score: { 
      home: 2, 
      away: 1,
      halfTime: { home: 1, away: 0 }
    },
    group: 'B',
    round: 'Phase de poules',
    referee: 'Moussa Sangaré',
    attendance: 800,
    weather: 'Nuageux, 26°C',
    events: matchEvents
  },
  {
    id: '3',
    homeTeam: teams[0],
    awayTeam: teams[2],
    date: new Date('2024-12-25T16:00:00'),
    venue: 'Stade des Jeunes',
    status: 'finished',
    score: { 
      home: 3, 
      away: 0,
      halfTime: { home: 2, away: 0 }
    },
    group: 'Finale',
    round: 'Finale',
    referee: 'Ibrahim Touré',
    attendance: 2000,
    weather: 'Parfait, 25°C'
  },
  {
    id: '4',
    homeTeam: teams[1],
    awayTeam: teams[3],
    date: new Date(),
    venue: 'Complexe Sportif',
    status: 'live',
    score: { 
      home: 1, 
      away: 1,
      halfTime: { home: 0, away: 1 }
    },
    group: 'A',
    round: 'Phase de poules',
    referee: 'Bakary Koné',
    attendance: 950,
    weather: 'Beau temps, 27°C',
    events: matchEvents,
    liveMinute: 78
  }
];

// Mock Tournament with enhanced data (without sponsors - they are now global)
export const mockTournament: Tournament = {
  id: '1',
  name: 'Coupe Mario Brutus 2024',
  year: 2024,
  status: 'ongoing',
  startDate: new Date('2024-12-20'),
  endDate: new Date('2025-01-05'),
  teams,
  matches,
  groups: ['A', 'B'],
  maxTeamsPerGroup: 6,
  playersPerTeam: 11,
  description: 'La plus grande compétition de football amateur de la région',
  location: 'Petion-Ville, Haiti',
  prize: 'Trophée Mario Brutus + 500,000 HTG',
  rules: [
    'Matchs de 90 minutes (2 x 45 min)',
    'Maximum 3 remplacements par équipe',
    'Carton rouge = suspension automatique',
    'Prolongations en cas d\'égalité (phases finales)',
    'Tirs au but si nécessaire'
  ],
  standings: [
    {
      teamId: '1',
      teamName: 'Les Lions FC',
      position: 1,
      played: 6,
      won: 5,
      drawn: 0,
      lost: 1,
      goalsFor: 18,
      goalsAgainst: 8,
      goalDifference: 10,
      points: 15
    },
    {
      teamId: '2',
      teamName: 'Étoiles United',
      position: 2,
      played: 5,
      won: 4,
      drawn: 0,
      lost: 1,
      goalsFor: 14,
      goalsAgainst: 6,
      goalDifference: 8,
      points: 12
    },
    {
      teamId: '3',
      teamName: 'Dynamique Petion-Ville',
      position: 3,
      played: 5,
      won: 3,
      drawn: 0,
      lost: 2,
      goalsFor: 12,
      goalsAgainst: 10,
      goalDifference: 2,
      points: 9
    },
    {
      teamId: '4',
      teamName: 'Sporting Daloa',
      position: 4,
      played: 5,
      won: 2,
      drawn: 0,
      lost: 3,
      goalsFor: 8,
      goalsAgainst: 12,
      goalDifference: -4,
      points: 6
    }
  ]
};

export const mockTournaments: Tournament[] = [
  mockTournament,
  {
    id: '2',
    name: 'Coupe Mario Brutus 2023',
    year: 2023,
    status: 'completed',
    startDate: new Date('2023-12-20'),
    endDate: new Date('2024-01-05'),
    teams: [
      {
        id: 'old1',
        name: 'Champions 2023',
        group: 'A',
        players: [],
        stats: {
          points: 18,
          gamesPlayed: 6,
          wins: 6,
          draws: 0,
          losses: 0,
          goalsFor: 20,
          goalsAgainst: 5,
          goalDifference: 15,
          form: ['W', 'W', 'W', 'W', 'W']
        }
      }
    ],
    matches: [],
    groups: ['A', 'B', 'C'],
    maxTeamsPerGroup: 4,
    playersPerTeam: 11,
    description: 'Édition 2023 de la Coupe Mario Brutus',
    location: 'Petion-Ville, Haiti',
    standings: [
      {
        teamId: 'old1',
        teamName: 'Champions 2023',
        position: 1,
        played: 6,
        won: 6,
        drawn: 0,
        lost: 0,
        goalsFor: 20,
        goalsAgainst: 5,
        goalDifference: 15,
        points: 18
      }
    ]
  },
  {
    id: '3',
    name: 'Coupe Mario Brutus 2022',
    year: 2022,
    status: 'completed',
    startDate: new Date('2022-12-20'),
    endDate: new Date('2023-01-05'),
    teams: [
      {
        id: 'old2',
        name: 'Vainqueurs 2022',
        group: 'A',
        players: [],
        stats: {
          points: 15,
          gamesPlayed: 6,
          wins: 5,
          draws: 0,
          losses: 1,
          goalsFor: 16,
          goalsAgainst: 8,
          goalDifference: 8,
          form: ['W', 'W', 'L', 'W', 'W']
        }
      }
    ],
    matches: [],
    groups: ['A', 'B'],
    maxTeamsPerGroup: 6,
    playersPerTeam: 11,
    description: 'Édition 2022 de la Coupe Mario Brutus',
    location: 'Petion-Ville, Haiti',
    standings: [
      {
        teamId: 'old2',
        teamName: 'Vainqueurs 2022',
        position: 1,
        played: 6,
        won: 5,
        drawn: 0,
        lost: 1,
        goalsFor: 16,
        goalsAgainst: 8,
        goalDifference: 8,
        points: 15
      }
    ]
  }
];