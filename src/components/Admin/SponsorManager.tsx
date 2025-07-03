import React, { useState } from 'react';
import { Star, Plus, Edit, X, Save, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { Sponsor } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface SponsorManagerProps {
  onClose: () => void;
}

export const SponsorManager: React.FC<SponsorManagerProps> = ({ onClose }) => {
  const { globalSponsors, setGlobalSponsors } = useApp();
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [sponsorForm, setSponsorForm] = useState({
    name: '',
    logo: '',
    website: '',
    tier: 'official' as Sponsor['tier']
  });

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const resetForm = () => {
    setSponsorForm({
      name: '',
      logo: '',
      website: '',
      tier: 'official'
    });
  };

  const handleAddSponsor = () => {
    if (!sponsorForm.name.trim()) {
      alert('Veuillez saisir le nom du sponsor');
      return;
    }

    const newSponsor: Sponsor = {
      id: Date.now().toString(),
      name: sponsorForm.name.trim(),
      logo: sponsorForm.logo.trim(),
      website: sponsorForm.website.trim(),
      tier: sponsorForm.tier
    };

    setGlobalSponsors([...globalSponsors, newSponsor]);
    resetForm();
    setShowAddForm(false);
    showSuccessMessage();
  };

  const handleEditSponsor = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setSponsorForm({
      name: sponsor.name,
      logo: sponsor.logo,
      website: sponsor.website || '',
      tier: sponsor.tier
    });
  };

  const handleUpdateSponsor = () => {
    if (!editingSponsor || !sponsorForm.name.trim()) {
      alert('Veuillez saisir le nom du sponsor');
      return;
    }

    const updatedSponsor: Sponsor = {
      ...editingSponsor,
      name: sponsorForm.name.trim(),
      logo: sponsorForm.logo.trim(),
      website: sponsorForm.website.trim(),
      tier: sponsorForm.tier
    };

    setGlobalSponsors(globalSponsors.map(s => s.id === editingSponsor.id ? updatedSponsor : s));
    setEditingSponsor(null);
    resetForm();
    showSuccessMessage();
  };

  const handleDeleteSponsor = (sponsorId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce sponsor ?')) {
      setGlobalSponsors(globalSponsors.filter(s => s.id !== sponsorId));
      showSuccessMessage();
    }
  };

  const handleCancelEdit = () => {
    setEditingSponsor(null);
    setShowAddForm(false);
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 z-10">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Opération réussie !</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Star className="h-6 w-6 text-yellow-500 mr-2" />
            Gestion des Sponsors
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Add/Edit Form */}
          {(showAddForm || editingSponsor) && (
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingSponsor ? 'Modifier le Sponsor' : 'Ajouter un Nouveau Sponsor'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du sponsor *
                  </label>
                  <input
                    type="text"
                    value={sponsorForm.name}
                    onChange={(e) => setSponsorForm({...sponsorForm, name: e.target.value})}
                    placeholder="Nom de l'entreprise"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL du logo
                  </label>
                  <input
                    type="url"
                    value={sponsorForm.logo}
                    onChange={(e) => setSponsorForm({...sponsorForm, logo: e.target.value})}
                    placeholder="https://example.com/logo.png"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    value={sponsorForm.website}
                    onChange={(e) => setSponsorForm({...sponsorForm, website: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau de partenariat
                  </label>
                  <select
                    value={sponsorForm.tier}
                    onChange={(e) => setSponsorForm({...sponsorForm, tier: e.target.value as Sponsor['tier']})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gold">Or</option>
                    <option value="silver">Argent</option>
                    <option value="bronze">Bronze</option>
                    <option value="official">Officiel</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              {sponsorForm.logo && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aperçu
                  </label>
                  <div className="w-24 h-24 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center">
                    <img
                      src={sponsorForm.logo}
                      alt={sponsorForm.name}
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="text-xs text-gray-500 text-center">Image non valide</div>`;
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={editingSponsor ? handleUpdateSponsor : handleAddSponsor}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingSponsor ? 'Modifier' : 'Ajouter'}</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Add Button */}
          {!showAddForm && !editingSponsor && (
            <div className="mb-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Ajouter un Sponsor</span>
              </button>
            </div>
          )}

          {/* Sponsors List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              Sponsors Actuels ({globalSponsors.length})
            </h3>
            
            {globalSponsors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {globalSponsors.map((sponsor) => (
                  <div key={sponsor.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                        {sponsor.logo ? (
                          <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className="w-full h-full object-contain rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="text-xs text-gray-500 text-center">${sponsor.name.charAt(0)}</div>`;
                              }
                            }}
                          />
                        ) : (
                          <span className="text-sm font-bold text-gray-600">
                            {sponsor.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{sponsor.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sponsor.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                            sponsor.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                            sponsor.tier === 'bronze' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {sponsor.tier === 'gold' ? 'Or' :
                             sponsor.tier === 'silver' ? 'Argent' :
                             sponsor.tier === 'bronze' ? 'Bronze' : 'Officiel'}
                          </span>
                          {sponsor.website && (
                            <a
                              href={sponsor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSponsor(sponsor)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSponsor(sponsor.id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <X className="h-3 w-3" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">
                  Aucun sponsor ajouté
                </h4>
                <p className="text-gray-500">
                  Commencez par ajouter vos premiers sponsors
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};