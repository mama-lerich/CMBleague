import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tournament, UserRole, Team, Player } from '../types';

interface AppContextType {
  currentTournament: Tournament | null;
  userRole: UserRole['role'];
  setCurrentTournament: (tournament: Tournament | null) => void;
  setUserRole: (role: UserRole['role']) => void;
  tournaments: Tournament[];
  setTournaments: (tournaments: Tournament[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

// Clés pour le localStorage
const STORAGE_KEYS = {
  TOURNAMENTS: 'coupe_mario_brutus_tournaments',
  CURRENT_TOURNAMENT: 'coupe_mario_brutus_current_tournament',
  USER_ROLE: 'coupe_mario_brutus_user_role'
};

// Fonctions utilitaires pour le localStorage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  }
};

const loadFromStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    return null;
  }
};

// Fonction pour convertir les dates string en objets Date
const reviveDates = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    // Vérifier si c'est une date ISO
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(reviveDates);
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = reviveDates(obj[key]);
    }
    return result;
  }
  
  return obj;
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentTournament, setCurrentTournamentState] = useState<Tournament | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole['role']>('public');
  const [tournaments, setTournamentsState] = useState<Tournament[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les données au démarrage
  useEffect(() => {
    const loadData = () => {
      try {
        // Charger le rôle utilisateur
        const savedRole = loadFromStorage(STORAGE_KEYS.USER_ROLE);
        if (savedRole) {
          setUserRoleState(savedRole);
        }

        // Charger les tournois
        const savedTournaments = loadFromStorage(STORAGE_KEYS.TOURNAMENTS);
        if (savedTournaments) {
          const tournamentsWithDates = reviveDates(savedTournaments);
          setTournamentsState(tournamentsWithDates);
        }

        // Charger le tournoi actuel
        const savedCurrentTournament = loadFromStorage(STORAGE_KEYS.CURRENT_TOURNAMENT);
        if (savedCurrentTournament) {
          const tournamentWithDates = reviveDates(savedCurrentTournament);
          setCurrentTournamentState(tournamentWithDates);
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Fonctions avec persistance
  const setCurrentTournament = (tournament: Tournament | null) => {
    setCurrentTournamentState(tournament);
    if (tournament) {
      saveToStorage(STORAGE_KEYS.CURRENT_TOURNAMENT, tournament);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_TOURNAMENT);
    }
  };

  const setUserRole = (role: UserRole['role']) => {
    setUserRoleState(role);
    saveToStorage(STORAGE_KEYS.USER_ROLE, role);
  };

  const setTournaments = (newTournaments: Tournament[]) => {
    setTournamentsState(newTournaments);
    saveToStorage(STORAGE_KEYS.TOURNAMENTS, newTournaments);
    
    // Mettre à jour le tournoi actuel s'il fait partie de la liste
    if (currentTournament) {
      const updatedCurrentTournament = newTournaments.find(t => t.id === currentTournament.id);
      if (updatedCurrentTournament) {
        setCurrentTournamentState(updatedCurrentTournament);
        saveToStorage(STORAGE_KEYS.CURRENT_TOURNAMENT, updatedCurrentTournament);
      }
    }
  };

  // Ne pas rendre le contenu tant que les données ne sont pas chargées
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        currentTournament,
        userRole,
        setCurrentTournament,
        setUserRole,
        tournaments,
        setTournaments,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};