import React, { useState } from 'react';
import { Star, ExternalLink, Plus } from 'lucide-react';
import { Sponsor } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { SponsorManager } from '../Admin/SponsorManager';

export const SponsorsSection: React.FC = () => {
  const { userRole, globalSponsors } = useApp();
  const [showSponsorManager, setShowSponsorManager] = useState(false);

  if (!globalSponsors || globalSponsors.length === 0) {
    // Show add button for admin even when no sponsors
    if (userRole === 'admin') {
      return (
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Star className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Sponsors officiels
                </h2>
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                Nos partenaires de confiance qui soutiennent le développement du football amateur
              </p>
              
              <button 
                onClick={() => setShowSponsorManager(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>Ajouter un sponsor</span>
              </button>
            </div>
          </div>

          {/* Sponsor Manager Modal */}
          {showSponsorManager && (
            <SponsorManager onClose={() => setShowSponsorManager(false)} />
          )}
        </section>
      );
    }
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Sponsors officiels
            </h2>
            <Star className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nos partenaires de confiance qui soutiennent le développement du football amateur
          </p>
          
          {/* Admin Add Button */}
          {userRole === 'admin' && (
            <button 
              onClick={() => setShowSponsorManager(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Gérer les sponsors</span>
            </button>
          )}
        </div>

        {/* Sponsors Grid - Centered */}
        <div className="flex justify-center">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9 gap-4 sm:gap-6 items-center justify-items-center max-w-6xl">
            {globalSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="group relative bg-white rounded-xl p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full max-w-[120px]"
              >
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="aspect-square flex items-center justify-center">
                    {sponsor.logo ? (
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          // Fallback to text if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center"><span class="text-xs sm:text-sm font-bold text-gray-600 text-center px-1">${sponsor.name}</span></div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs sm:text-sm font-bold text-gray-600 text-center px-1">
                          {sponsor.name}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-300 flex items-center justify-center">
                    <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </a>

                {/* Sponsor name tooltip */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                  {sponsor.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sponsor Manager Modal */}
      {showSponsorManager && (
        <SponsorManager onClose={() => setShowSponsorManager(false)} />
      )}
    </section>
  );
};