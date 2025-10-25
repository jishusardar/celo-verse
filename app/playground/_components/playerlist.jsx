'use client';

import { useGame } from '@/app/context/GameContext';
import { Users, User } from 'lucide-react';

const PlayerList = () => {
  const { players, currentPlayer } = useGame();

  return (
    <div className="bg-black bg-opacity-20 p-4">
      <div className="flex items-center space-x-2 text-white mb-4">
        <Users size={20} />
        <h3 className="font-semibold">Players Online ({players.size})</h3>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {Array.from(players.values()).map(player => (
          <div
            key={player.id}
            className={`flex items-center space-x-3 p-2 rounded-lg ${
              player.id === (currentPlayer && currentPlayer.id) 
                ? 'bg-blue-600 bg-opacity-50' 
                : 'bg-gray-700 bg-opacity-30'
            }`}
          >
            {/* Player Avatar */}
            <div className="relative">
              <div 
                className="w-8 h-8 rounded-full border-2 border-white"
                style={{ backgroundColor: player.color }}
              />
              {player.isSitting && (
                <div className="absolute -bottom-1 -right-1 text-xs">💺</div>
              )}
            </div>
            
            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">
                {player.name}
                {player.id === (currentPlayer && currentPlayer.id) && (
                  <span className="text-blue-300 ml-1">(You)</span>
                )}
              </div>
              <div className="text-gray-300 text-xs">
                {player.isSitting ? 'Sitting' : 'Walking'}
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className={`w-2 h-2 rounded-full ${
              player.isSitting ? 'bg-yellow-400' : 'bg-green-400'
            }`} />
          </div>
        ))}
        
        {players.size === 0 && (
          <div className="text-gray-400 text-sm text-center py-4">
            No other players online
          </div>
        )}
      </div>
      
      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
          <div className="flex justify-between">
            <span>Walking:</span>
            <span>{Array.from(players.values()).filter(p => !p.isSitting).length}</span>
          </div>
          <div className="flex justify-between">
            <span>Sitting:</span>
            <span>{Array.from(players.values()).filter(p => p.isSitting).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerList;