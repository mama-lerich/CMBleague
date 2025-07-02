import React, { useState } from 'react';
import { Star, Plus, Edit, Trash2, X, Save, ExternalLink, Upload, Check, AlertCircle } from 'lucide-react';
import { Sponsor } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface SponsorManagerProps {
  onClose: () => void;
}

export const SponsorManager: React.FC<SponsorManagerProps> = ({ onClose }) => {
  const { currentTournament, setCurrentTournament, tournaments, setTournaments } = useApp();
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [sponsorForm, setSponsorForm] = useState({
    name: '',
    logo: '',
    website: '',
    tier: 'official' as Sponsor['tier']
  });

  if (!currentTournament) return null;

  const sponsors = currentTournament.sponsors || [];

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!sponsorForm.name.trim()) {
      errors.push('Le nom du sponsor est obligatoire');
    }
    
    if (sponsorForm.website && !isValidUrl(sponsorForm.website)) {
      errors.push('L\'URL du site web n\'est pas valide');
    }
    
    if (sponsorForm.logo && !isValidUrl(sponsorForm.logo)) {
      errors.push('L\'URL du logo n\'est pas valide');
    }

    // Check for duplicate names (excluding current editing sponsor)
    const existingSponsor = sponsors.find(s => 
      s.name.toLowerCase() === sponsorForm.name.toLowerCase() && 
      s.id !== editingSponsor?.id
    );
    
    if (existingSponsor) {
      errors.push('Un sponsor avec ce nom existe déjà');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const resetForm = () => {
    setSponsorForm({
      name: '',
      logo: '',
      website: '',
      tier: 'official'
    });
    setEditingSponsor(null);
    setShowAddForm(false);
    setValidationErrors([]);
  };

  const handleAddSponsor = () => {
    if (!validateForm()) return;

    const newSponsor: Sponsor = {
      id: Date.now().toString(),
      name: sponsorForm.name.trim(),
      logo: sponsorForm.logo.trim(),
      website: sponsorForm.website.trim(),
      tier: sponsorForm.tier
    };

    const updatedSponsors = [...sponsors, newSponsor];
    const updatedTournament = {
      ...currentTournament,
      sponsors: updatedSponsors
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
    
    resetForm();
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
    setShowAddForm(true);
    setValidationErrors([]);
  };

  const handleUpdateSponsor = () => {
    if (!editingSponsor || !validateForm()) return;

    const updatedSponsor: Sponsor = {
      ...editingSponsor,
      name: sponsorForm.name.trim(),
      logo: sponsorForm.logo.trim(),
      website: sponsorForm.website.trim(),
      tier: sponsorForm.tier
    };

    const updatedSponsors = sponsors.map(s => 
      s.id === editingSponsor.id ? updatedSponsor : s
    );

    const updatedTournament = {
      ...currentTournament,
      sponsors: updatedSponsors
    };

    setCurrentTournament(updatedTournament);
    setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
    
    resetForm();
    showSuccessMessage();
  };

  const handleDeleteSponsor = (sponsorId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce sponsor ?')) {
      const updatedSponsors = sponsors.filter(s => s.id !== sponsorId);
      const updatedTournament = {
        ...currentTournament,
        sponsors: updatedSponsors
      };

      setCurrentTournament(updatedTournament);
      setTournaments(tournaments.map(t => t.id === currentTournament.id ? updatedTournament : t));
      showSuccessMessage();
    }
  };

  const tierLabels = {
    official: 'Officiel',
    gold: 'Or',
    silver: 'Argent',
    bronze: 'Bronze'
  };

  const tierColors = {
    official: 'bg-blue-100 text-blue-800',
    gold: 'bg-yellow-100 text-yellow-800',
    silver: 'bg-gray-100 text-gray-800',
    bronze: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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
          {showAddForm && (
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingSponsor ? 'Modifier le Sponsor' : 'Ajouter un Nouveau Sponsor'}
              </h3>
              
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Erreurs de validation
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du sponsor *
                  </label>
                  <input
                    type="text"
                    value={sponsorForm.name}
                    onChange={(e) => setSponsorForm({...sponsorForm, name: e.target.value})}
                    placeholder="Nom du sponsor"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de partenariat
                  </label>
                  <select
                    value={sponsorForm.tier}
                    onChange={(e) => setSponsorForm({...sponsorForm, tier: e.target.value as Sponsor['tier']})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="official">Officiel</option>
                    <option value="gold">Or</option>
                    <option value="silver">Argent</option>
                    <option value="bronze">Bronze</option>
                  </select>
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
              </div>

              {/* Logo Preview */}
              {sponsorForm.logo && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aperçu du logo
                  </label>
                  <div className="w-24 h-24 bg-white rounded-lg border border-gray-300 flex items-center justify-center">
                    <img
                      src={sponsorForm.logo}
                      alt="Aperçu"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<span class="text-xs text-gray-500">Erreur de chargement</span>';
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
                  onClick={resetForm}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Add Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mb-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Ajouter un Sponsor</span>
            </button>
          )}

          {/* Sponsors List */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Sponsors Actuels ({sponsors.length})
            </h3>

            {sponsors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sponsors.map((sponsor) => (
                  <div key={sponsor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 truncate">{sponsor.name}</h4>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditSponsor(sponsor)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSponsor(sponsor.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Logo Preview */}
                    <div className="w-full h-16 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                      {sponsor.logo ? (
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-xs text-gray-500">${sponsor.name}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span className="text-xs text-gray-500">{sponsor.name}</span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tierColors[sponsor.tier]}`}>
                          {tierLabels[sponsor.tier]}
                        </span>
                      </div>
                      
                      {sponsor.website && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Site:</span>
                          <a
                            href={sponsor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="text-xs">Visiter</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Aucun sponsor ajouté</p>
                <p className="text-sm mt-1">Cliquez sur "Ajouter un Sponsor" pour commencer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};