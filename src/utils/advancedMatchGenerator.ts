import { Team, Match, TournamentFormat, TournamentFormatConfig } from '../types';

export interface AdvancedMatchGenerationOptions {
  teams: Team[];
  format: TournamentFormat;
  startDate: Date;
  endDate: Date;
  venues: string[];
  matchTimes: string[]; // ['15:00', '18:00', '20:30']
  matchesPerDay: number;
  journeysCount?: number; // Pour le format liga
  groupsConfig?: {
    groupsCount: number;
    teamsPerGroup: number;
  };
}

export interface MatchScheduleDay {
  date: Date;
  matches: Match[];
  availableSlots: number;
}

export class AdvancedMatchGenerator {
  private teams: Team[];
  private format: TournamentFormat;
  private startDate: Date;
  private endDate: Date;
  private venues: string[];
  private matchTimes: string[];
  private matchesPerDay: number;
  private journeysCount: number;
  private schedule: MatchScheduleDay[] = [];
  private currentMatchId = 1;

  constructor(options: AdvancedMatchGenerationOptions) {
    this.teams = options.teams;
    this.format = options.format;
    this.startDate = new Date(options.startDate);
    this.endDate = new Date(options.endDate);
    this.venues = options.venues.length > 0 ? options.venues : ['Stade Principal'];
    this.matchTimes = options.matchTimes.length > 0 ? options.matchTimes : ['15:00'];
    this.matchesPerDay = Math.max(1, options.matchesPerDay);
    this.journeysCount = options.journeysCount || (this.teams.length - 1) * 2; // Aller-retour par défaut
    
    this.initializeSchedule();
  }

  private initializeSchedule(): void {
    const currentDate = new Date(this.startDate);
    
    while (currentDate <= this.endDate) {
      this.schedule.push({
        date: new Date(currentDate),
        matches: [],
        availableSlots: this.matchesPerDay
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  generateAllMatches(): Match[] {
    const allMatches: Match[] = [];

    switch (this.format) {
      case 'league':
        allMatches.push(...this.generateLeagueMatches());
        break;
      case 'world_cup':
        allMatches.push(...this.generateWorldCupMatches());
        break;
      case 'champions_league':
        allMatches.push(...this.generateChampionsLeagueMatches());
        break;
    }

    return allMatches;
  }

  private generateLeagueMatches(): Match[] {
    const matches: Match[] = [];
    const totalJourneys = this.journeysCount;
    const matchesPerJourney = this.teams.length / 2;
    
    // Générer les journées avec rotation des équipes
    for (let journey = 1; journey <= totalJourneys; journey++) {
      const journeyMatches = this.generateJourneyMatches(journey);
      matches.push(...journeyMatches);
    }

    return this.scheduleMatches(matches);
  }

  private generateJourneyMatches(journey: number): Match[] {
    const matches: Match[] = [];
    const teams = [...this.teams];
    const isReturnLeg = journey > this.teams.length - 1;
    
    // Algorithme de rotation pour éviter les conflits
    const rotatedTeams = this.rotateTeamsForJourney(teams, journey);
    
    for (let i = 0; i < rotatedTeams.length / 2; i++) {
      const homeTeam = isReturnLeg ? rotatedTeams[rotatedTeams.length - 1 - i] : rotatedTeams[i];
      const awayTeam = isReturnLeg ? rotatedTeams[i] : rotatedTeams[rotatedTeams.length - 1 - i];
      
      if (homeTeam && awayTeam && homeTeam.id !== awayTeam.id) {
        matches.push(this.createMatch(
          homeTeam,
          awayTeam,
          `Journée ${journey}`,
          'A',
          isReturnLeg ? 'second' : 'first'
        ));
      }
    }

    return matches;
  }

  private rotateTeamsForJourney(teams: Team[], journey: number): Team[] {
    if (teams.length % 2 !== 0) {
      teams.push({ id: 'bye', name: 'Exempt' } as Team);
    }

    const rotated = [...teams];
    const rotations = (journey - 1) % (teams.length - 1);
    
    for (let r = 0; r < rotations; r++) {
      const temp = rotated[1];
      for (let i = 1; i < rotated.length - 1; i++) {
        rotated[i] = rotated[i + 1];
      }
      rotated[rotated.length - 1] = temp;
    }

    return rotated.filter(team => team.id !== 'bye');
  }

  private generateWorldCupMatches(): Match[] {
    const matches: Match[] = [];
    
    // 1. Phase de groupes
    const groups = this.createBalancedGroups();
    const groupMatches = this.generateGroupStageMatches(groups);
    matches.push(...groupMatches);
    
    // 2. Phases éliminatoires (seront générées après la phase de groupes)
    const knockoutMatches = this.generateKnockoutPlaceholders(groups);
    matches.push(...knockoutMatches);

    return this.scheduleMatches(matches);
  }

  private generateChampionsLeagueMatches(): Match[] {
    const matches: Match[] = [];
    
    // 1. Phase de groupes avec aller-retour
    const groups = this.createBalancedGroups();
    const groupMatches = this.generateGroupStageMatchesWithReturn(groups);
    matches.push(...groupMatches);
    
    // 2. Phases éliminatoires avec aller-retour
    const knockoutMatches = this.generateTwoLeggedKnockoutPlaceholders(groups);
    matches.push(...knockoutMatches);

    return this.scheduleMatches(matches);
  }

  private createBalancedGroups(): Team[][] {
    const groupsCount = Math.ceil(this.teams.length / 4);
    const groups: Team[][] = [];
    const shuffledTeams = [...this.teams].sort(() => Math.random() - 0.5);
    
    // Créer des groupes équilibrés
    for (let i = 0; i < groupsCount; i++) {
      groups.push([]);
    }
    
    // Distribuer les équipes de manière équilibrée
    shuffledTeams.forEach((team, index) => {
      const groupIndex = index % groupsCount;
      groups[groupIndex].push(team);
    });
    
    return groups.filter(group => group.length > 1);
  }

  private generateGroupStageMatches(groups: Team[][]): Match[] {
    const matches: Match[] = [];
    
    // Pour chaque groupe, générer les matchs dans l'ordre optimal
    groups.forEach((groupTeams, groupIndex) => {
      const groupLetter = String.fromCharCode(65 + groupIndex);
      const groupMatches = this.generateOptimalGroupMatches(groupTeams, groupLetter);
      matches.push(...groupMatches);
    });
    
    return matches;
  }

  private generateOptimalGroupMatches(teams: Team[], groupLetter: string): Match[] {
    const matches: Match[] = [];
    const totalRounds = teams.length - 1;
    
    // Générer les matchs par journée pour éviter qu'une équipe joue plusieurs fois
    for (let round = 0; round < totalRounds; round++) {
      const roundMatches = this.generateRoundRobinRound(teams, round, groupLetter);
      matches.push(...roundMatches);
    }
    
    return matches;
  }

  private generateRoundRobinRound(teams: Team[], round: number, groupLetter: string): Match[] {
    const matches: Match[] = [];
    const n = teams.length;
    
    if (n % 2 !== 0) {
      // Ajouter une équipe "fantôme" pour les nombres impairs
      teams = [...teams, { id: 'bye', name: 'Exempt' } as Team];
    }
    
    const totalTeams = teams.length;
    const matchesPerRound = totalTeams / 2;
    
    for (let match = 0; match < matchesPerRound; match++) {
      let home = (round + match) % (totalTeams - 1);
      let away = (totalTeams - 1 - match + round) % (totalTeams - 1);
      
      if (match === 0) {
        away = totalTeams - 1;
      }
      
      // Alterner domicile/extérieur
      if (round % 2 === 1) {
        [home, away] = [away, home];
      }
      
      const homeTeam = teams[home];
      const awayTeam = teams[away];
      
      if (homeTeam?.id !== 'bye' && awayTeam?.id !== 'bye') {
        matches.push(this.createMatch(
          homeTeam,
          awayTeam,
          'Phase de groupes',
          groupLetter
        ));
      }
    }
    
    return matches;
  }

  private generateGroupStageMatchesWithReturn(groups: Team[][]): Match[] {
    const matches: Match[] = [];
    
    groups.forEach((groupTeams, groupIndex) => {
      const groupLetter = String.fromCharCode(65 + groupIndex);
      
      // Matchs aller
      const firstLegMatches = this.generateOptimalGroupMatches(groupTeams, groupLetter);
      matches.push(...firstLegMatches);
      
      // Matchs retour (inversion domicile/extérieur)
      const secondLegMatches = firstLegMatches.map(match => 
        this.createMatch(
          match.awayTeam,
          match.homeTeam,
          'Phase de groupes',
          groupLetter,
          'second'
        )
      );
      matches.push(...secondLegMatches);
    });
    
    return matches;
  }

  private generateKnockoutPlaceholders(groups: Team[][]): Match[] {
    const matches: Match[] = [];
    const qualifiedTeamsCount = groups.length * 2; // 2 équipes par groupe
    
    if (qualifiedTeamsCount >= 8) {
      // Huitièmes de finale
      for (let i = 0; i < qualifiedTeamsCount / 2; i++) {
        matches.push(this.createPlaceholderMatch('Huitièmes de finale', 'Élimination'));
      }
    }
    
    if (qualifiedTeamsCount >= 4) {
      // Quarts de finale
      for (let i = 0; i < Math.min(4, qualifiedTeamsCount / 4); i++) {
        matches.push(this.createPlaceholderMatch('Quarts de finale', 'Élimination'));
      }
    }
    
    // Demi-finales
    matches.push(this.createPlaceholderMatch('Demi-finale 1', 'Élimination'));
    matches.push(this.createPlaceholderMatch('Demi-finale 2', 'Élimination'));
    
    // Finale
    matches.push(this.createPlaceholderMatch('Finale', 'Élimination'));
    
    return matches;
  }

  private generateTwoLeggedKnockoutPlaceholders(groups: Team[][]): Match[] {
    const matches: Match[] = [];
    const qualifiedTeamsCount = groups.length * 2;
    
    if (qualifiedTeamsCount >= 8) {
      // Huitièmes aller-retour
      for (let i = 0; i < qualifiedTeamsCount / 2; i++) {
        matches.push(this.createPlaceholderMatch('Huitièmes de finale', 'Élimination', 'first'));
        matches.push(this.createPlaceholderMatch('Huitièmes de finale', 'Élimination', 'second'));
      }
    }
    
    // Quarts aller-retour
    for (let i = 0; i < 2; i++) {
      matches.push(this.createPlaceholderMatch('Quarts de finale', 'Élimination', 'first'));
      matches.push(this.createPlaceholderMatch('Quarts de finale', 'Élimination', 'second'));
    }
    
    // Demi-finales aller-retour
    matches.push(this.createPlaceholderMatch('Demi-finale', 'Élimination', 'first'));
    matches.push(this.createPlaceholderMatch('Demi-finale', 'Élimination', 'second'));
    
    // Finale (match unique)
    matches.push(this.createPlaceholderMatch('Finale', 'Élimination'));
    
    return matches;
  }

  private scheduleMatches(matches: Match[]): Match[] {
    const scheduledMatches: Match[] = [];
    let currentDayIndex = 0;
    
    for (const match of matches) {
      // Trouver le prochain créneau disponible
      while (currentDayIndex < this.schedule.length) {
        const day = this.schedule[currentDayIndex];
        
        if (day.availableSlots > 0) {
          // Assigner le match à ce jour
          const timeSlot = this.getNextAvailableTime(day);
          const scheduledMatch = {
            ...match,
            date: this.combineDateTime(day.date, timeSlot),
            venue: this.getNextAvailableVenue(day)
          };
          
          day.matches.push(scheduledMatch);
          day.availableSlots--;
          scheduledMatches.push(scheduledMatch);
          break;
        } else {
          currentDayIndex++;
        }
      }
      
      // Si on a dépassé la période, arrêter
      if (currentDayIndex >= this.schedule.length) {
        console.warn('Période insuffisante pour programmer tous les matchs');
        break;
      }
    }
    
    return scheduledMatches;
  }

  private getNextAvailableTime(day: MatchScheduleDay): string {
    const usedTimes = day.matches.map(m => 
      m.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    );
    
    for (const time of this.matchTimes) {
      if (!usedTimes.includes(time)) {
        return time;
      }
    }
    
    // Si tous les créneaux sont pris, utiliser le premier
    return this.matchTimes[0];
  }

  private getNextAvailableVenue(day: MatchScheduleDay): string {
    const usedVenues = day.matches.map(m => m.venue);
    
    for (const venue of this.venues) {
      const venueUsageCount = usedVenues.filter(v => v === venue).length;
      const maxUsagePerVenue = Math.ceil(this.matchesPerDay / this.venues.length);
      
      if (venueUsageCount < maxUsagePerVenue) {
        return venue;
      }
    }
    
    // Si tous les stades sont utilisés au maximum, utiliser le premier
    return this.venues[0];
  }

  private combineDateTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const combinedDate = new Date(date);
    combinedDate.setHours(hours, minutes, 0, 0);
    return combinedDate;
  }

  private createMatch(
    homeTeam: Team,
    awayTeam: Team,
    round: string,
    group: string,
    leg?: 'first' | 'second'
  ): Match {
    return {
      id: `match-${this.currentMatchId++}`,
      homeTeam,
      awayTeam,
      date: new Date(), // Sera mis à jour lors de la planification
      venue: '', // Sera mis à jour lors de la planification
      status: 'upcoming',
      group,
      round: leg ? `${round} (${leg === 'first' ? 'Aller' : 'Retour'})` : round,
      leg
    };
  }

  private createPlaceholderMatch(round: string, group: string, leg?: 'first' | 'second'): Match {
    // Créer des équipes placeholder
    const placeholderHome: Team = {
      id: `placeholder-home-${this.currentMatchId}`,
      name: 'À déterminer',
      group: '',
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

    const placeholderAway: Team = {
      id: `placeholder-away-${this.currentMatchId}`,
      name: 'À déterminer',
      group: '',
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

    return this.createMatch(placeholderHome, placeholderAway, round, group, leg);
  }

  getScheduleSummary(): { totalDays: number; matchesPerDay: number; totalMatches: number } {
    const totalMatches = this.schedule.reduce((sum, day) => sum + day.matches.length, 0);
    return {
      totalDays: this.schedule.length,
      matchesPerDay: this.matchesPerDay,
      totalMatches
    };
  }
}

export const generateAdvancedMatches = (options: AdvancedMatchGenerationOptions): Match[] => {
  const generator = new AdvancedMatchGenerator(options);
  return generator.generateAllMatches();
};