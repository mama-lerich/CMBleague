import React, { useState } from 'react';
import { Camera, Image, Video, Download, Share2, Heart, Eye } from 'lucide-react';

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  title: string;
  description?: string;
  date: Date;
  category: 'match' | 'ceremony' | 'training' | 'celebration';
  likes: number;
  views: number;
}

export const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Mock gallery data
  const galleryItems: GalleryItem[] = [
    {
      id: '1',
      type: 'image',
      url: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg',
      thumbnail: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?w=400',
      title: 'But décisif en finale',
      description: 'Jean-Baptiste Koné marque le but de la victoire',
      date: new Date('2024-01-05'),
      category: 'match',
      likes: 45,
      views: 234
    },
    {
      id: '2',
      type: 'image',
      url: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg',
      thumbnail: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?w=400',
      title: 'Remise du trophée',
      description: 'Cérémonie de remise des prix 2024',
      date: new Date('2024-01-05'),
      category: 'ceremony',
      likes: 67,
      views: 456
    },
    {
      id: '3',
      type: 'image',
      url: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg',
      thumbnail: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?w=400',
      title: 'Célébration des Lions FC',
      description: 'L\'équipe championne célèbre sa victoire',
      date: new Date('2024-01-05'),
      category: 'celebration',
      likes: 89,
      views: 678
    },
    {
      id: '4',
      type: 'image',
      url: 'https://images.pexels.com/photos/1171084/pexels-photo-1171084.jpeg',
      thumbnail: 'https://images.pexels.com/photos/1171084/pexels-photo-1171084.jpeg?w=400',
      title: 'Entraînement intensif',
      description: 'Préparation avant la demi-finale',
      date: new Date('2024-01-03'),
      category: 'training',
      likes: 23,
      views: 145
    }
  ];

  const categories = [
    { key: 'all', label: 'Tout', icon: Image },
    { key: 'match', label: 'Matchs', icon: Camera },
    { key: 'ceremony', label: 'Cérémonies', icon: Camera },
    { key: 'celebration', label: 'Célébrations', icon: Heart },
    { key: 'training', label: 'Entraînements', icon: Video }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Camera className="h-7 w-7 text-pink-600 mr-3" />
              Galerie Photos & Vidéos
            </h1>
            <p className="text-gray-600 mt-1">
              Revivez les meilleurs moments de la Coupe Mario Brutus
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mt-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === category.key
                    ? 'bg-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            <div className="relative aspect-square">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-300">
                  {item.type === 'video' ? (
                    <Video className="h-12 w-12 text-white" />
                  ) : (
                    <Eye className="h-12 w-12 text-white" />
                  )}
                </div>
              </div>
              
              {/* Category Badge */}
              <div className="absolute top-2 left-2">
                <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                  {categories.find(c => c.key === item.category)?.label}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 truncate">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {item.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{item.date.toLocaleDateString('fr-FR')}</span>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3 w-3" />
                    <span>{item.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{item.views}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for selected item */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white rounded-xl overflow-hidden">
            <div className="relative">
              <img
                src={selectedItem.url}
                alt={selectedItem.title}
                className="w-full h-auto max-h-96 object-contain"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedItem.title}
              </h2>
              {selectedItem.description && (
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{selectedItem.date.toLocaleDateString('fr-FR')}</span>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{selectedItem.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{selectedItem.views}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition-colors">
                    <Share2 className="h-4 w-4" />
                    <span>Partager</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg transition-colors">
                    <Download className="h-4 w-4" />
                    <span>Télécharger</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12">
          <div className="text-center">
            <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Aucune photo trouvée
            </h3>
            <p className="text-gray-500">
              Aucune photo ne correspond à la catégorie sélectionnée
            </p>
          </div>
        </div>
      )}
    </div>
  );
};