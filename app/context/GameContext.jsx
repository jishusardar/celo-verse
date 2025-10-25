'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {setPlayerState} from '../action'

const GameContext = createContext(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children, socket }) => {
  const [players, setPlayers] = useState(new Map());
  const [worldObjects, setWorldObjects] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // Handle initial world state
    socket.on('worldState', (data) => {
      const playersMap = new Map();
      data.players.forEach((player) => {
        playersMap.set(player.id, player);
      });
      setPlayers(playersMap);
      setWorldObjects(data.objects);
      
      // Set current player (the one with our socket ID)
      const current = data.players.find((p) => p.id === socket.id);
      if (current) {
        setCurrentPlayer(current);
      }
    });

    // Handle new player joining
    socket.on('playerJoined', (player) => {
      setPlayers(prev => {
        const newMap = new Map(prev);
        newMap.set(player.id, player);
        return newMap;
      });
    });

    // Handle player movement
    socket.on('playerMoved', (data) => {
      setPlayers(prev => {
        const newMap = new Map(prev);
        const player = newMap.get(data.id);
        if (player) {
          newMap.set(data.id, { ...player, x: data.x, y: data.y });
        }
        return newMap;
      });
      
      // Update current player if it's the current player moving
      if (data.id === socket.id) {
        setCurrentPlayer(prev => prev ? { ...prev, x: data.x, y: data.y } : null);
      }
    });

    // Handle player sitting
    socket.on('playerSitting', (data) => {
      setPlayers(prev => {
        const newMap = new Map(prev);
        const player = newMap.get(data.playerId);
        if (player) {
          newMap.set(data.playerId, {
            ...player,
            x: data.x,
            y: data.y,
            isSitting: true,
            sittingOn: data.chairId
          });
        }
        return newMap;
      });

      setWorldObjects(prev => 
        prev.map(obj => 
          obj.id === data.chairId ? { ...obj, occupied: true } : obj
        )
      );
    });

    // Handle player standing
    socket.on('playerStanding', (data) => {
      setPlayers(prev => {
        const newMap = new Map(prev);
        const player = newMap.get(data.playerId);
        if (player) {
          newMap.set(data.playerId, {
            ...player,
            isSitting: false,
            sittingOn: null
          });
        }
        return newMap;
      });

      setWorldObjects(prev => 
        prev.map(obj => 
          obj.type === 'chair' && obj.occupied ? { ...obj, occupied: false } : obj
        )
      );
    });

    // Handle avatar updates
    socket.on('avatarUpdated', (data) => {
      setPlayers(prev => {
        const newMap = new Map(prev);
        const player = newMap.get(data.id);
        if (player) {
          newMap.set(data.id, { ...player, avatar: data.avatar });
        }
        return newMap;
      });
    });

    // Handle chat messages
    socket.on('chatMessage', (message) => {
      setChatMessages(prev => [...prev.slice(-49), message]); // Keep last 50 messages
    });

    // Handle player leaving
    socket.on('playerLeft', (playerId) => {
      setPlayers(prev => {
        const newMap = new Map(prev);
        newMap.delete(playerId);
        return newMap;
      });
    });

    return () => {
      socket.off('worldState');
      socket.off('playerJoined');
      socket.off('playerMoved');
      socket.off('playerSitting');
      socket.off('playerStanding');
      socket.off('avatarUpdated');
      socket.off('chatMessage');
      socket.off('playerLeft');
    };
  }, [socket]);

  const addPlayer = (player) => {
    setPlayers(prev => {
      const newMap = new Map(prev);
      newMap.set(player.id, player);
      return newMap;
    });
  };

  const updatePlayer = (id, updates) => {
    setPlayers(prev => {
      const newMap = new Map(prev);
      const player = newMap.get(id);
      if (player) {
        newMap.set(id, { ...player, ...updates });
      }
      return newMap;
    });
  };

  const removePlayer = (id) => {
    setPlayers(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  const updateWorldObjects = (objects) => {
    setWorldObjects(objects);
  };

  const addChatMessage = (message) => {
    setChatMessages(prev => [...prev.slice(-49), message]);
  };

  const value = {
    socket,
    players,
    worldObjects,
    chatMessages,
    currentPlayer,
    addPlayer,
    updatePlayer,
    removePlayer,
    updateWorldObjects,
    addChatMessage,
    setCurrentPlayer,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
