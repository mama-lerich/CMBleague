import { Tournament, Match, Team, TournamentFormat } from '../types';

export interface MatchGenerationConfig {
  intervalBetweenMatches: number; // jours
  matchesPerDay: number;
  matchTimes: string[];
  venues: string[];
  journeysCount: number; // pour format liga
  restDaysBetweenRounds: number;
  groupPhaseFirst: boolean;
  respectTournamentPeriod: boolean;
  startDate: Date;
  endDate: Date;
}

export interface GenerationOptions {
  tournament: Tournament;
  config: MatchGenerationConfig;
}

export class IntelligentMatchGenerator {
  private tournament: Tournament;
  private config: MatchGenerationConfig;
  private currentDate: Date;
  private usedTimeSlots: Set<string> = new Set();

  constructor(options: GenerationOptions) {
    this.tournament = options.tournament;
    this.config = options.config;
    this.currentDate = new Date(options.config.startDate);
  }

  generateMatches(): Match[] {
    const matches: Match[] = [];

    switch (this.tournament.format) {
      case 'league':
        matches.push(...this.generateLeagueMatches());
        break;
      case 'world_cup':
        matches.push(...this.generateWorldCupMatches());
        break;
      case 'champions_league':
        matches.push(...this.generateChampionsLeagueMatches());
        break;
    }

    return matches;
  }

  private generateLeagueMatches(): Match[] {
    const matches: Match[] = [];
    const teams = this.tournament.teams;

    // Générer les journées
    for (let journey = 1; journey <= this.config.journeysCount; journey++) {
      const isReturnLeg = journey === 2;
      
      // Générer tous les matchs pour cette journée
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const homeTeam = isReturnLeg ? teams[j] : teams[i];
          const awayTeam = isReturnLeg ? teams[i] : teams[j];
          
          const match = this.createMatch(
            homeTeam,
            awayTeam,
            `Journée ${this.getJourneyNumber(matches.length + 1)}`,
            homeTeam.group || 'A',
            isReturnLeg ? 'second' : 'first'
          );
          
          matches.push(match);
        }
      }
    }

    return matches;
  }

  private generateWorldCupMatches(): Match[] {
    const matches: Match[] = [];
    
    // Phase de groupes
    matches.push(...this.generateGroupStageMatches());
    
    // Les phases éliminatoires seront générées après que tous les matchs de groupes soient terminés
    // Pour l'instant, on génère juste la structure
    
    return matches;
  }

  private generateChampionsLeagueMatches(): Match[] {
    const matches: Match[] = [];
    
    // Phase de groupes avec matchs aller-retour
    matches.push(...this.generateGroupStageMatches(true));
    
    return matches;
  }

  private generateGroupStageMatches(withReturnLeg: boolean = false): Match[] {
    const matches: Match[] = [];
    const groupedTeams = this.groupTeamsByGroup();

    // Pour chaque groupe
    Object.entries(groupedTeams).forEach(([groupName, teams]) => {
      const groupMatches = this.generateRoundRobinForGroup(teams, groupName, withReturnLeg);
      matches.push(...groupMatches);
    });

    return matches;
  }

  private generateRoundRobinForGroup(teams: Team[], groupName: string, withReturnLeg: boolean): Match[] {
    const matches: Match[] = [];
    
    // Algorithme intelligent pour éviter qu'une équipe joue plusieurs matchs consécutifs
    const rounds = this.generateBalancedRounds(teams);
    
    rounds.forEach((round, roundIndex) => {
      round.forEach(([homeTeam, awayTeam]) => {
        // Match aller
        const match = this.createMatch(
          homeTeam,
          awayTeam,
          'Phase de groupes',
          groupName,
          withReturnLeg ? 'first' : undefined
        );
        matches.push(match);
      });
      
      // Ajouter du repos entre les tours
      if (roundIndex < rounds.length - 1) {
        this.addRestDays(this.config.restDaysBetweenRounds);
      }
    });

    // Matchs retour si nécessaire
    if (withReturnLeg) {
      this.addRestDays(this.config.restDaysBetweenRounds * 2); // Plus de repos avant les matchs retour
      
      rounds.forEach((round, roundIndex) => {
        round.forEach(([homeTeam, awayTeam]) => {
          // Match retour (inversion des équipes)
          const match = this.createMatch(
            awayTeam,
            homeTeam,
            'Phase de groupes',
            groupName,
            'second'
          );
          matches.push(match);
        });
        
        if (roundIndex < rounds.length - 1) {
          this.addRestDays(this.config.restDaysBetweenRounds);
        }
      });
    }

    return matches;
  }

  private generateBalancedRounds(teams: Team[]): [Team, Team][][] {
    const rounds: [Team, Team][][] = [];
    const n = teams.length;
    
    if (n % 2 === 1) {
      // Ajouter une équipe "bye" si nombre impair
      teams = [...teams, null as any];
    }
    
    const totalRounds = teams.length - 1;
    
    for (let round = 0; round < totalRounds; round++) {
      const roundMatches: [Team, Team][] = [];
      
      for (let i = 0; i < teams.length / 2; i++) {
        const home = teams[i];
        const away = teams[teams.length - 1 - i];
        
        if (home && away) {
          roundMatches.push([home, away]);
        }
      }
      
      rounds.push(roundMatches);
      
      // Rotation des équipes (sauf la première)
      const fixed = teams[0];
      const rotating = teams.slice(1);
      rotating.unshift(rotating.pop()!);
      teams = [fixed, ...rotating];
    }
    
    return rounds;
  }

  private createMatch(
    homeTeam: Team,
    awayTeam: Team,
    round: string,
    group: string,
    leg?: 'first' | 'second'
  ): Match {
    const matchDateTime = this.getNextAvailableDateTime();
    
    const match: Match = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      homeTeam,
      awayTeam,
      date: matchDateTime,
      venue: this.getRandomVenue(),
      status: 'upcoming',
      group,
      round: leg ? `${round} (${leg === 'first' ? 'Aller' : 'Retour'})` : round,
      leg
    };

    return match;
  }

  private getNextAvailableDateTime(): Date {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      // Vérifier si on peut programmer des matchs ce jour
      const dayKey = this.currentDate.toDateString();
      const matchesThisDay = Array.from(this.usedTimeSlots)
        .filter(slot => slot.startsWith(dayKey))
        .length;
      
      if (matchesThisDay < this.config.matchesPerDay) {
        // Trouver un créneau horaire disponible
        for (const time of this.config.matchTimes) {
          const timeSlotKey = `${dayKey}-${time}`;
          
          if (!this.usedTimeSlots.has(timeSlotKey)) {
            const [hours, minutes] = time.split(':').map(Number);
            const matchDate = new Date(this.currentDate);
            matchDate.setHours(hours, minutes, 0, 0);
            
            // Vérifier que c'est dans la période du tournoi
            if (this.config.respectTournamentPeriod) {
              if (matchDate < this.config.startDate || matchDate > this.config.endDate) {
                this.advanceToNextDay();
                attempts++;
                continue;
              }
            }
            
            this.usedTimeSlots.add(timeSlotKey);
            return matchDate;
          }
        }
      }
      
      // Passer au jour suivant
      this.advanceToNextDay();
      attempts++;
    }
    
    // Fallback si on ne trouve pas de créneau
    return new Date(this.currentDate);
  }

  private advanceToNextDay(): void {
    this.currentDate.setDate(this.currentDate.getDate() + this.config.intervalBetweenMatches + 1);
  }

  private addRestDays(days: number): void {
    this.currentDate.setDate(this.currentDate.getDate() + days);
  }

  private getRandomVenue(): string {
    return this.config.venues[Math.floor(Math.random() * this.config.venues.length)];
  }

  private groupTeamsByGroup(): Record<string, Team[]> {
    const grouped: Record<string, Team[]> = {};
    
    this.tournament.teams.forEach(team => {
      const group = team.group || 'A';
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(team);
    });
    
    return grouped;
  }

  private getJourneyNumber(matchNumber: number): number {
    const teamsCount = this.tournament.teams.length;
    const matchesPerJourney = (teamsCount * (teamsCount - 1)) / 2;
    return Math.ceil(matchNumber / matchesPerJourney);
  }
}

export const generateIntelligentMatches = (options: GenerationOptions): Match[] => {
  const generator = new IntelligentMatchGenerator(options);
  return generator.generateMatches();
};