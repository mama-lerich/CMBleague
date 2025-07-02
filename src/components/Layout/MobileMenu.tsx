import React from 'react';
import { X, Trophy, Calendar, Users, BarChart3, Settings, Award } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  currentView,
  onViewChange
}) => {
  const { userRole } = useApp();

  const navigationItems = [
    { id: 'dashboard', label: 'Accueil', icon: Trophy },
    { id: 'matches', label: 'Matchs', icon: Calendar },
    { id: 'teams', label: 'Équipes', icon: Users },
    { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
    { id: 'hall-of-fame', label: 'Hall of Fame', icon: Award },
    ...(userRole === 'admin' ? [{ id: 'admin', label: 'Administration', icon: Settings }] : [])
  ];

  const handleViewChange = (view: string) => {
    onViewChange(view);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl transform transition-transform">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    currentView === item.id
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};