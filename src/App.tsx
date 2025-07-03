import React, { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Matches } from './components/Matches/Matches';
import { Teams } from './components/Teams/Teams';
import { Players } from './components/Players/Players';
import { Statistics } from './components/Statistics/Statistics';
import { Admin } from './components/Admin/Admin';
import { Archives } from './components/Archives/Archives';
import { Gallery } from './components/Gallery/Gallery';
import { LiveScore } from './components/LiveScore/LiveScore';
import { HallOfFame } from './components/HallOfFame/HallOfFame';
import { SponsorsSection } from './components/Layout/SponsorsSection';
import { useApp } from './contexts/AppContext';
import { mockTournament, mockTournaments } from './data/mockData';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { setCurrentTournament, setTournaments, tournaments, currentTournament } = useApp();

  useEffect(() => {
    // Initialiser avec les données mock seulement si aucune donnée n'existe
    if (tournaments.length === 0) {
      setTournaments(mockTournaments);
    }
    
    if (!currentTournament && tournaments.length === 0) {
      setCurrentTournament(mockTournament);
    }
  }, [setCurrentTournament, setTournaments, tournaments, currentTournament]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'matches':
        return <Matches />;
      case 'teams':
        return <Teams />;
      case 'players':
        return <Players />;
      case 'statistics':
        return <Statistics />;
      case 'admin':
        return <Admin />;
      case 'archives':
        return <Archives tournaments={tournaments} />;
      case 'gallery':
        return <Gallery />;
      case 'hall-of-fame':
        return <HallOfFame tournaments={tournaments} />;
      case 'live':
        // Find a live match for demo
        const liveMatch = currentTournament?.matches.find(m => m.status === 'live');
        return liveMatch ? <LiveScore match={liveMatch} /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {renderCurrentView()}
      </main>

      {/* Sponsors Section - Only on Dashboard */}
      {currentView === 'dashboard' && <SponsorsSection />}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2 text-sm sm:text-base">
              © 2024 Coupe Mario Brutus - Plateforme officielle du championnat
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Développé avec passion pour le football amateur
            </p>
            
            {/* Quick Links */}
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
              <button 
                onClick={() => setCurrentView('archives')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Archives
              </button>
              <button 
                onClick={() => setCurrentView('gallery')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Galerie
              </button>
              <button 
                onClick={() => setCurrentView('hall-of-fame')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Hall of Fame
              </button>
              <button 
                onClick={() => setCurrentView('players')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Joueurs
              </button>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">Contact: info@coupemariobrutus.com</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;