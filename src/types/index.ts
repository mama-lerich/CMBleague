export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  teamId: string;
  photo?: string;
  age?: number;
  height?: number;
  weight?: number;
  nationality?: string;
  stats: {
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    gamesPlayed: number;
    minutesPlayed: number;
    saves?: number; // For goalkeepers
  };
  awards?: string[];
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  group: string;
  players: Player[];
  coach?: string;
  founded?: number;
  homeVenue?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
  stats: {
    points: number;
    gamesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    form: ('W' | 'D' | 'L')[];
  };
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: Date;
  venue: string;
  status: 'upcoming' | 'live' | 'finished' | 'postponed';
  score?: {
    home: number;
    away: number;
    halfTime?: {
      home: number;
      away: number;
    };
    penalties?: {
      home: number;
      away: number;
    };
  };
  group: string;
  round: string;
  referee?: string;
  attendance?: number;
  weather?: string;
  events?: MatchEvent[];
  liveMinute?: number;
  period?: 'first_half' | 'half_time' | 'second_half' | 'full_time' | 'extra_first' | 'extra_break' | 'extra_second' | 'penalty_shootout' | 'finished';
  leg?: 'first' | 'second'; // Pour les matchs aller-retour
  aggregateScore?: {
    home: number;
    away: number;
  };
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty';
  minute: number;
  playerId: string;
  playerName: string;
  teamId: string;
  description?: string;
}

export type TournamentFormat = 'league' | 'world_cup' | 'champions_league';

export interface TournamentFormatConfig {
  id: TournamentFormat;
  name: string;
  description: string;
  icon: string;
  phases: TournamentPhase[];
  features: string[];
  minTeams: number;
  maxTeams: number;
  recommendedTeams: number[];
}

export interface TournamentPhase {
  id: string;
  name: string;
  type: 'group_stage' | 'knockout' | 'league';
  format: 'round_robin' | 'single_elimination' | 'two_legged' | 'home_away';
  teamsAdvancing?: number; // Nombre d'équipes qui passent au tour suivant
  groupsCount?: number;
  teamsPerGroup?: number;
  homeAndAway?: boolean; // Pour les matchs aller-retour
}

export interface Tournament {
  id: string;
  name: string;
  year: number;
  status: 'upcoming' | 'ongoing' | 'finished' | 'completed';
  startDate: Date;
  endDate: Date;
  teams: Team[];
  matches: Match[];
  groups: string[];
  maxTeamsPerGroup: number;
  playersPerTeam: number;
  description?: string;
  location?: string;
  prize?: string;
  sponsors?: Sponsor[];
  rules?: string[];
  standings?: TeamStanding[];
  format: TournamentFormat;
  formatConfig?: TournamentFormatConfig;
  currentPhase?: string;
  phases?: TournamentPhase[];
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  position: number;
  played: number;
  won: number;
  drawn?: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website?: string;
  tier: 'gold' | 'silver' | 'bronze' | 'official';
}

export interface UserRole {
  role: 'admin' | 'public';
}

export interface Notification {
  id: string;
  type: 'match_start' | 'match_end' | 'goal' | 'card' | 'tournament_update';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  matchId?: string;
  teamId?: string;
}

export interface Award {
  id: string;
  name: string;
  description: string;
  icon: string;
  recipients: {
    playerId?: string;
    teamId?: string;
    playerName?: string;
    teamName?: string;
    year: number;
  }[];
}

// Nouvelles interfaces pour le Hall of Fame
export interface HallOfFameRecord {
  id: string;
  category: HallOfFameCategory;
  title: string;
  description: string;
  year: number;
  tournamentId: string;
  tournamentName: string;
  recipient: {
    type: 'player' | 'team' | 'coach' | 'match' | 'goal';
    id: string;
    name: string;
    teamName?: string;
    photo?: string;
    details?: any;
  };
  stats?: {
    value: number;
    unit: string;
    context?: string;
  };
  achievement?: string;
}

export type HallOfFameCategory = 
  | 'best_team_ever'
  | 'top_scorer'
  | 'top_assistant'
  | 'best_goalkeeper'
  | 'best_young_player'
  | 'best_defender'
  | 'best_coach'
  | 'fair_play_team'
  | 'goal_of_year'
  | 'legendary_match'
  | 'most_titled_club'
  | 'most_consistent_player'
  | 'coach_revelation'
  | 'exceptional_performance'
  | 'best_stadium_atmosphere'
  | 'longest_winning_streak'
  | 'fastest_goal'
  | 'most_saves_match'
  | 'comeback_of_year';