import React, { useState } from 'react';
import { Camera, Upload, X, Plus, Edit, Trash2, Eye, Download, Share2, Filter } from 'lucide-react';

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  title: string;
  description?: string;
  date: Date;
  category: 'match' | 'ceremony' | 'training' | 'celebration';
  tags: string[];
  uploadedBy: string;
}

interface GalleryManagerProps {
  onClose: () => void;
}

export const GalleryManager: React.FC<GalleryManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'organize'>('upload');
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Upload form
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'match' as GalleryItem['category'],
    tags: '',
    file: null as File | null
  });

  // Mock gallery items
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([
    {
      id: '1',
      type: 'image',
      url: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg',
      thumbnail: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?w=400',
      title: 'But décisif en finale',
      description: 'Jean-Baptiste Koné marque le but de la victoire',
      date: new Date('2024-12-30'),
      category: 'match',
      tags: ['finale', 'but', 'victoire'],
      uploadedBy: 'Admin'
    },
    {
      id: '2',
      type: 'image',
      url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg',
      thumbnail: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?w=400',
      title: 'Remise du trophée',
      description: 'Cérémonie de remise des prix 2024',
      date: new Date('2024-12-30'),
      category: 'ceremony',
      tags: ['trophée', 'cérémonie', 'prix'],
      uploadedBy: 'Admin'
    }
  ]);

  const categories = [
    { key: 'match', label: 'Matchs', color: 'bg-blue-100 text-blue-800' },
    { key: 'ceremony', label: 'Cérémonies', color: 'bg-purple-100 text-purple-800' },
    { key: 'training', label: 'Entraînements', color: 'bg-green-100 text-green-800' },
    { key: 'celebration', label: 'Célébrations', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUpload = () => {
    if (!uploadForm.title || !uploadForm.file) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newItem: GalleryItem = {
      id: Date.now().toString(),
      type: uploadForm.file.type.startsWith('video/') ? 'video' : 'image',
      url: URL.createObjectURL(uploadForm.file),
      thumbnail: URL.createObjectURL(uploadForm.file),
      title: uploadForm.title,
      description: uploadForm.description,
      date: new Date(),
      category: uploadForm.category,
      tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      uploadedBy: 'Admin'
    };

    setGalleryItems([newItem, ...galleryItems]);
    setUploadForm({
      title: '',
      description: '',
      category: 'match',
      tags: '',
      file: null
    });
    showSuccessMessage();
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      setGalleryItems(galleryItems.filter(item => item.id !== itemId));
      showSuccessMessage();
    }
  };

  const handleUpdateItem = () => {
    if (editingItem) {
      setGalleryItems(galleryItems.map(item => 
        item.id === editingItem.id ? editingItem : item
      ));
      setEditingItem(null);
      showSuccessMessage();
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  const renderUploadTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Upload className="h-6 w-6 text-blue-500 mr-2" />
          Ajouter des Photos/Vidéos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                placeholder="Titre de la photo/vidéo"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                placeholder="Description de l'événement..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm({...uploadForm, category: e.target.value as GalleryItem['category']})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                placeholder="finale, but, victoire"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Cliquez pour sélectionner un fichier
                </p>
                <p className="text-sm text-gray-500">
                  Images: JPG, PNG, GIF • Vidéos: MP4, MOV
                </p>
              </label>
              {uploadForm.file && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-800 font-medium">{uploadForm.file.name}</p>
                  <p className="text-sm text-green-600">
                    {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={!uploadForm.title || !uploadForm.file}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ajouter à la Galerie
        </button>
      </div>
    </div>
  );

  const renderManageTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Gérer la Galerie ({filteredItems.length} éléments)
          </h3>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="relative aspect-square">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  categories.find(c => c.key === item.category)?.color || 'bg-gray-100 text-gray-800'
                }`}>
                  {categories.find(c => c.key === item.category)?.label}
                </span>
              </div>
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  onClick={() => setEditingItem(item)}
                  className="bg-black bg-opacity-50 text-white p-1 rounded hover:bg-opacity-70"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="bg-black bg-opacity-50 text-white p-1 rounded hover:bg-opacity-70"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-1 truncate">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{item.date.toLocaleDateString('fr-FR')}</span>
                <span>{item.uploadedBy}</span>
              </div>
              {item.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="text-gray-400 text-xs">+{item.tags.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12">
          <div className="text-center">
            <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun élément trouvé
            </h4>
            <p className="text-gray-500">
              Aucun élément ne correspond aux filtres sélectionnés
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrganizeTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Organisation et Statistiques
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {categories.map(category => {
            const count = galleryItems.filter(item => item.category === category.key).length;
            return (
              <div key={category.key} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{category.label}</div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Actions en Masse</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-5 w-5 text-blue-600" />
              <span>Exporter tout</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Share2 className="h-5 w-5 text-green-600" />
              <span>Partager sélection</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span>Supprimer sélection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 z-10">
            <Plus className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Opération réussie !</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Camera className="h-6 w-6 text-pink-500 mr-2" />
            Gestion de la Galerie
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-6 border-b border-gray-200">
          {[
            { key: 'upload', label: 'Ajouter', icon: Upload },
            { key: 'manage', label: 'Gérer', icon: Eye },
            { key: 'organize', label: 'Organiser', icon: Filter }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-pink-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'upload' && renderUploadTab()}
          {activeTab === 'manage' && renderManageTab()}
          {activeTab === 'organize' && renderOrganizeTab()}
        </div>

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Modifier l'élément</h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value as GalleryItem['category']})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <input
                    type="text"
                    value={editingItem.tags.join(', ')}
                    onChange={(e) => setEditingItem({
                      ...editingItem, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateItem}
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};