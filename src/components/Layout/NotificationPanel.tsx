import React from 'react';
import { X, Bell, Calendar, Trophy, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  // Mock notifications
  const notifications = [
    {
      id: '1',
      type: 'match_start',
      title: 'Match en cours',
      message: 'Les Lions FC vs Étoiles United vient de commencer',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      type: 'goal',
      title: 'But marqué !',
      message: 'Jean-Baptiste Koné marque pour Les Lions FC (1-0)',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'tournament_update',
      title: 'Nouveau match programmé',
      message: 'Demi-finale programmée pour demain 15h00',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match_start':
      case 'match_end':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'goal':
        return <Trophy className="h-5 w-5 text-green-500" />;
      case 'tournament_update':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:inset-auto lg:top-16 lg:right-4 lg:w-96">
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed inset-x-4 top-4 bottom-4 lg:inset-auto lg:top-0 lg:right-0 lg:w-96 lg:max-h-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 text-gray-500 mr-2" />
            Notifications
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(notification.timestamp, 'HH:mm', { locale: fr })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucune notification</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
            Marquer tout comme lu
          </button>
        </div>
      </div>
    </div>
  );
};