'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// import ChatPanel from '../components/ChatPanel';
// import AvatarCustomization from '../components/AvatarCustomization';
// import PlayerList from '../components/PlayerList';
// import Web3Integration from '../components/Web3Integration';

import GameCanvas from '../_components/GameCanvas';
import { GameProvider } from '../context/GameContext';
import Game from '../_components/Game';


export default function Home() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showAvatarCustomization, setShowAvatarCustomization] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setIsConnected(true);
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  if (!socket) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Connecting to server...</div>
      </div>
    );
  }

  return (
    <GameProvider socket={socket}>
      <div className="game-container">
        {/* Header */}
        <div className="bg-black bg-opacity-20 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">🌍 Web3 Virtual World</h1>
            <div className={`px-3 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAvatarCustomization(!showAvatarCustomization)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Customize Avatar
            </button>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex">
          {/* Game Canvas */}
          <div className="flex-1 flex items-center justify-center p-4">
            <Game />
          </div>

          {/* Side Panels */}
          {/* <div className="w-80 bg-black bg-opacity-10 flex flex-col">
            <PlayerList />
            <Web3Integration />
            <ChatPanel />
          </div> */}
        </div>

        {/* Avatar Customization Modal
        {showAvatarCustomization && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="avatar-customization max-w-md w-full mx-4">
              <AvatarCustomization onClose={() => setShowAvatarCustomization(false)} />
            </div>
          </div>
        )} */}

        {/* Instructions */}
        <div className="bg-black bg-opacity-20 text-white p-2 text-sm text-center">
          Use WASD or Arrow Keys to move • Click on chairs to sit • Press Enter to chat
        </div>
      </div>
    </GameProvider>
  );
}
