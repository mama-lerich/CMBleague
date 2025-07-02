import React, { useState } from 'react';
import { Trophy, Users, Calendar, BarChart3, Settings, User, Menu, Bell, Award } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { MobileMenu } from './MobileMenu';
import { NotificationPanel } from './NotificationPanel';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { userRole, setUserRole, currentTournament } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Accueil', icon: Trophy },
    { id: 'matches', label: 'Matchs', icon: Calendar },
    { id: 'teams', label: 'Équipes', icon: Users },
    { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
    { id: 'hall-of-fame', label: 'Hall of Fame', icon: Award },
    ...(userRole === 'admin' ? [{ id: 'admin', label: 'Administration', icon: Settings }] : [])
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'À venir';
      case 'ongoing': return 'En cours';
      case 'finished': return 'Terminé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600';
      case 'ongoing': return 'text-green-600';
      case 'finished': 
      case 'completed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      <header className="bg-white shadow-lg border-b-4 border-green-600 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 sm:p-3 rounded-xl">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent truncate">
                  Coupe Mario Brutus
                </h1>
                {currentTournament && (
                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                    {currentTournament.name} • 
                    <span className={`ml-1 ${getStatusColor(currentTournament.status)}`}>
                      {getStatusLabel(currentTournament.status)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      currentView === item.id
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Notifications */}
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>

              {/* User Role Toggle */}
              <div className="hidden sm:flex items-center space-x-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as 'admin' | 'public')}
                  className="bg-gray-100 border border-gray-300 rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="public">Public</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation Tabs */}
          <div className="lg:hidden pb-4 overflow-x-auto">
            <div className="flex space-x-1 min-w-max">
              {navigationItems.slice(0, 5).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                      currentView === item.id
                        ? 'bg-green-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentView={currentView}
        onViewChange={onViewChange}
      />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </>
  );
};