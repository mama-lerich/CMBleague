import { Team, Match, TournamentFormat, TournamentFormatConfig } from '../types';
import { getFormatConfig } from './tournamentFormats';

export interface MatchGenerationOptions {
  teams: Team[];
  format: TournamentFormat;
  startDate: Date;
  venues: string[];
  groupsConfig?: {
    groupsCount: number;
    teamsPerGroup: number;
  };
}

export class MatchGenerator {
  private teams: Team[];
  private format: TournamentFormat;
  private formatConfig: TournamentFormatConfig;
  private startDate: Date;
  private venues: string[];
  private currentDate: Date;

  constructor(options: MatchGenerationOptions) {
    this.teams = options.teams;
    this.format = options.format;
    this.formatConfig = getFormatConfig(options.format);
    this.startDate = options.startDate;
    this.venues = options.venues.length > 0 ? options.venues : ['Stade Principal'];
    this.currentDate = new Date(options.startDate);
  }

  generateAllMatches(): Match[] {
    const matches: Match[] = [];

    switch (this.format) {
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
    
    // Générer tous les matchs aller
    for (let i = 0; i < this.teams.length; i++) {
      for (let j = i + 1; j < this.teams.length; j++) {
        const homeTeam = this.teams[i];
        const awayTeam = this.teams[j];
        
        // Match aller
        matches.push(this.createMatch(
          homeTeam,
          awayTeam,
          `Journée ${matches.length + 1}`,
          'A',
          'first'
        ));
      }
    }

    // Générer tous les matchs retour
    for (let i = 0; i < this.teams.length; i++) {
      for (let j = i + 1; j < this.teams.length; j++) {
        const homeTeam = this.teams[j]; // Inversion pour le retour
        const awayTeam = this.teams[i];
        
        // Match retour
        matches.push(this.createMatch(
          homeTeam,
          awayTeam,
          `Journée ${matches.length + 1}`,
          'A',
          'second'
        ));
      }
    }

    return matches;
  }

  private generateWorldCupMatches(): Match[] {
    const matches: Match[] = [];
    const groupsCount = Math.ceil(this.teams.length / 4);
    const teamsPerGroup = Math.floor(this.teams.length / groupsCount);
    
    // Créer les groupes
    const groups = this.createGroups(groupsCount, teamsPerGroup);
    
    // Phase de groupes
    groups.forEach((groupTeams, groupIndex) => {
      const groupLetter = String.fromCharCode(65 + groupIndex);
      
      // Round-robin dans chaque groupe
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          matches.push(this.createMatch(
            groupTeams[i],
            groupTeams[j],
            'Phase de groupes',
            groupLetter
          ));
        }
      }
    });

    // Phases éliminatoires (simulées pour l'exemple)
    const qualifiedTeams = this.getQualifiedTeams(groups, 2); // 2 équipes par groupe
    
    if (qualifiedTeams.length >= 8) {
      matches.push(...this.generateKnockoutPhase(qualifiedTeams, 'Huitièmes de finale'));
    }

    return matches;
  }

  private generateChampionsLeagueMatches(): Match[] {
    const matches: Match[] = [];
    const groupsCount = Math.ceil(this.teams.length / 4);
    const teamsPerGroup = 4;
    
    // Créer les groupes
    const groups = this.createGroups(groupsCount, teamsPerGroup);
    
    // Phase de groupes avec matchs aller-retour
    groups.forEach((groupTeams, groupIndex) => {
      const groupLetter = String.fromCharCode(65 + groupIndex);
      
      // Matchs aller
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          matches.push(this.createMatch(
            groupTeams[i],
            groupTeams[j],
            'Phase de groupes',
            groupLetter,
            'first'
          ));
        }
      }
      
      // Matchs retour
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          matches.push(this.createMatch(
            groupTeams[j], // Inversion pour le retour
            groupTeams[i],
            'Phase de groupes',
            groupLetter,
            'second'
          ));
        }
      }
    });

    // Phases éliminatoires avec matchs aller-retour
    const qualifiedTeams = this.getQualifiedTeams(groups, 2);
    
    if (qualifiedTeams.length >= 8) {
      matches.push(...this.generateTwoLeggedKnockout(qualifiedTeams, 'Huitièmes de finale'));
    }

    return matches;
  }

  private createGroups(groupsCount: number, teamsPerGroup: number): Team[][] {
    const groups: Team[][] = [];
    const shuffledTeams = [...this.teams].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < groupsCount; i++) {
      const start = i * teamsPerGroup;
      const end = Math.min(start + teamsPerGroup, shuffledTeams.length);
      groups.push(shuffledTeams.slice(start, end));
    }
    
    return groups;
  }

  private getQualifiedTeams(groups: Team[][], teamsPerGroup: number): Team[] {
    const qualified: Team[] = [];
    
    groups.forEach(group => {
      // Simuler la qualification des meilleures équipes
      // En réalité, cela devrait être basé sur les résultats
      qualified.push(...group.slice(0, teamsPerGroup));
    });
    
    return qualified;
  }

  private generateKnockoutPhase(teams: Team[], round: string): Match[] {
    const matches: Match[] = [];
    
    for (let i = 0; i < teams.length; i += 2) {
      if (i + 1 < teams.length) {
        matches.push(this.createMatch(
          teams[i],
          teams[i + 1],
          round,
          'Élimination'
        ));
      }
    }
    
    return matches;
  }

  private generateTwoLeggedKnockout(teams: Team[], round: string): Match[] {
    const matches: Match[] = [];
    
    for (let i = 0; i < teams.length; i += 2) {
      if (i + 1 < teams.length) {
        // Match aller
        matches.push(this.createMatch(
          teams[i],
          teams[i + 1],
          round,
          'Élimination',
          'first'
        ));
        
        // Match retour
        matches.push(this.createMatch(
          teams[i + 1],
          teams[i],
          round,
          'Élimination',
          'second'
        ));
      }
    }
    
    return matches;
  }

  private createMatch(
    homeTeam: Team,
    awayTeam: Team,
    round: string,
    group: string,
    leg?: 'first' | 'second'
  ): Match {
    const match: Match = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      homeTeam,
      awayTeam,
      date: new Date(this.currentDate),
      venue: this.getRandomVenue(),
      status: 'upcoming',
      group,
      round: leg ? `${round} (${leg === 'first' ? 'Aller' : 'Retour'})` : round,
      leg
    };

    // Avancer la date pour le prochain match
    this.advanceDate();

    return match;
  }

  private getRandomVenue(): string {
    return this.venues[Math.floor(Math.random() * this.venues.length)];
  }

  private advanceDate(): void {
    // Avancer de 3-7 jours pour le prochain match
    const daysToAdd = Math.floor(Math.random() * 5) + 3;
    this.currentDate.setDate(this.currentDate.getDate() + daysToAdd);
  }
}

export const generateMatches = (options: MatchGenerationOptions): Match[] => {
  const generator = new MatchGenerator(options);
  return generator.generateAllMatches();
};