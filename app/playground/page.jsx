'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { AnimatedShinyText} from "@/components/ui/animated-shiny-text"
// import ChatPanel from '../components/ChatPanel';
import AvatarCustomization from './_components/AvatarCustomization';
import PlayerList from './_components/PlayerList';
// import Web3Integration from '../components/Web3Integration';

import GameCanvas from '../_components/GameCanvas';
import { GameProvider } from '../context/GameContext';
import ChatPanel from './_components/chatpanel';
//import GameCanvas from '../_components/Game';
import { Providers } from '../lib/Providers';
import { useAccount } from 'wagmi';
import {existProfile} from '../action'

export default function Home() {
  useEffect(() => {
  const handleKeyDown = (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      return false;
    }
  };

  // Add {passive: false} to make preventDefault work
  window.addEventListener('keydown', handleKeyDown, { passive: false });

  return () => {
    window.removeEventListener('keydown', handleKeyDown, { passive: false });
  };
}, []);
  const [socket, setSocket] = useState(null);
  const [isConnectedBro, setIsConnectedBro] = useState(false);
  const [showAvatarCustomization, setShowAvatarCustomization] = useState(false);
  const [customiseOption, setCustomiseOption] = useState(false);
  const { address, isConnected } = useAccount();
    const [userName, setUserName] = useState();

    useEffect(() => {
              if (!address) return;
              async function loadUser() {
                  const user = await existProfile(address);
                  console.log(user);
                  setUserName(user ? user.username : null);
                  
              }
              loadUser();
             },[address])

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setIsConnectedBro(true);
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnectedBro(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnectedBro(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  if (!socket) {
    return (
      <div className="z-10 flex min-h-64 items-center justify-center">
      <div
        className={cn(
          "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        )}
      >
        <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
          <span>✨ Connecting You To The Celoverse</span>
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedShinyText>
      </div>
    </div>
    );
  }

  return (
    <GameProvider socket={socket}>
        <Providers >
      <div className="game-container h-screen flex flex-col">
        {/* Header */}
        <div className="bg-black bg-opacity-20 text-white p-2 lg:p-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-2 lg:space-x-4">
            <h1 className="text-lg lg:text-2xl font-bold">Celoverse</h1>
            <div className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm ${
              isConnectedBro ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {isConnectedBro ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAvatarCustomization(!showAvatarCustomization)}
              className="px-3 lg:px-4 py-1 lg:py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm lg:text-base"
            >
              Customize Avatar
            </button>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Game Canvas */}
          <div className="flex-1 flex items-center justify-center p-2 lg:p-4 min-h-0">
            <GameCanvas />
          </div>

          {/* Side Panels */}
          <div className="w-full lg:w-80 bg-black bg-opacity-10 flex flex-col max-h-96 lg:max-h-none">
            <PlayerList />
            {/* <Web3Integration /> */}
            <ChatPanel />
          </div>
        </div>

        {/* Avatar Customization Modal */}
        {showAvatarCustomization && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-scroll">
            <div className="avatar-customization max-w-md w-full mx-4">
              <AvatarCustomization onClose={() => setShowAvatarCustomization(false)} />
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-black bg-opacity-20 text-white p-2 text-xs lg:text-sm text-center">
          <span className="hidden sm:inline">Use WASD or Arrow Keys to move • Click on chairs to sit • Press Enter to chat</span>
          <span className="sm:hidden">Touch controls below • Tap chairs to sit • Tap chat to message</span>
        </div>
      </div>
      </Providers>
    </GameProvider>
  );
}
