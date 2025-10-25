'use client';

import { useState } from 'react';
import { useGameContext } from '@/app/context/GameContext';
import { X, Palette, Shirt, Crown, Sparkles } from 'lucide-react';

const AvatarCustomization = ({ onClose }) => {
  const { socket, currentPlayer } = useGameContext();
  const [customization, setCustomization] = useState({
    body: currentPlayer?.avatar.body || 'default',
    hair: currentPlayer?.avatar.hair || 'default',
    clothes: currentPlayer?.avatar.clothes || 'default',
    accessories: currentPlayer?.avatar.accessories || 'none'
  });

  const bodyOptions = [
    { id: 'default', name: 'Default', color: '#FFDBAC' },
    { id: 'tan', name: 'Tan', color: '#D2B48C' },
    { id: 'dark', name: 'Dark', color: '#8B4513' },
    { id: 'pale', name: 'Pale', color: '#F5DEB3' }
  ];

  const hairOptions = [
    { id: 'default', name: 'Default', color: '#8B4513' },
    { id: 'blonde', name: 'Blonde', color: '#F4E4BC' },
    { id: 'black', name: 'Black', color: '#2C1810' },
    { id: 'red', name: 'Red', color: '#A0522D' },
    { id: 'blue', name: 'Blue', color: '#4169E1' },
    { id: 'pink', name: 'Pink', color: '#FF69B4' }
  ];

  const clothesOptions = [
    { id: 'default', name: 'Default', color: '#87CEEB' },
    { id: 'red', name: 'Red Shirt', color: '#DC143C' },
    { id: 'green', name: 'Green Shirt', color: '#228B22' },
    { id: 'purple', name: 'Purple Shirt', color: '#8A2BE2' },
    { id: 'yellow', name: 'Yellow Shirt', color: '#FFD700' },
    { id: 'black', name: 'Black Shirt', color: '#2F2F2F' }
  ];

  const accessoriesOptions = [
    { id: 'none', name: 'None', icon: '👤' },
    { id: 'hat', name: 'Hat', icon: '🎩' },
    { id: 'glasses', name: 'Glasses', icon: '👓' },
    { id: 'crown', name: 'Crown', icon: '👑' },
    { id: 'mask', name: 'Mask', icon: '🎭' }
  ];

  const handleSave = () => {
    if (socket) {
      socket.emit('updateAvatar', customization);
    }
    onClose();
  };

  const renderOption = (option, type) => {
    // In JavaScript, you can access properties using bracket notation or dot notation.
    // Since 'type' is a string variable, we use bracket notation for dynamic access.
    const isSelected = customization[type] === option.id;
    
    return (
      <button
        key={option.id}
        onClick={() => setCustomization(prev => ({ ...prev, [type]: option.id }))}
        className={`p-3 rounded-lg border-2 transition-all ${
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {type === 'accessories' ? (
          <div className="text-2xl">{option.icon}</div>
        ) : (
          <div 
            className="w-8 h-8 rounded-full mx-auto mb-2"
            style={{ backgroundColor: option.color }}
          />
        )}
        <div className="text-sm font-medium">{option.name}</div>
      </button>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Sparkles className="mr-2" />
          Customize Your Avatar
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Preview */}
      <div className="bg-gray-100 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Preview</h3>
        <div className="flex justify-center">
          <div className="relative">
            {/* Body */}
            <div 
              className="w-16 h-16 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: bodyOptions.find(b => b.id === customization.body)?.color }}
            />
            {/* Hair */}
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-8 rounded-t-full"
              style={{ backgroundColor: hairOptions.find(h => h.id === customization.hair)?.color }}
            />
            {/* Clothes */}
            <div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-8 rounded-b-lg"
              style={{ backgroundColor: clothesOptions.find(c => c.id === customization.clothes)?.color }}
            />
            {/* Accessories */}
            {customization.accessories !== 'none' && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xl">
                {accessoriesOptions.find(a => a.id === customization.accessories)?.icon}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customization Options */}
      <div className="space-y-6">
        {/* Body Color */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Palette className="mr-2" />
            Body Color
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {bodyOptions.map(option => renderOption(option, 'body'))}
          </div>
        </div>

        {/* Hair */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Hair Color</h3>
          <div className="grid grid-cols-3 gap-3">
            {hairOptions.map(option => renderOption(option, 'hair'))}
          </div>
        </div>

        {/* Clothes */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Shirt className="mr-2" />
            Clothes
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {clothesOptions.map(option => renderOption(option, 'clothes'))}
          </div>
        </div>

        {/* Accessories */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Crown className="mr-2" />
            Accessories
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {accessoriesOptions.map(option => renderOption(option, 'accessories'))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-8">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AvatarCustomization;