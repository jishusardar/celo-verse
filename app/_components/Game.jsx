'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameContext } from '../context/GameContext';
import { useAccount } from 'wagmi';
import { existProfile } from '@/app/action';

// Import game systems from main.js
import {
  level,
  playerSprite,
  mapSprites,
  font,
  introText,
  outroText
} from '../gameParts/const';
import {
  timestamp,
  overlap,
  tweenElement,
  cellAvailable
} from '../gameParts/helpers';
import {
  textGenFull,
  textGenPart,
  timerTextGen
} from '../gameParts/text';
import Animation from '../gameParts/animation';
import Tileset from '../gameParts/tileset';
import Map from '../gameParts/map';
import Entity from '../gameParts/entity';
import Timer from '../gameParts/timer';
import Sound from '../gameParts/sound';

const GameCanvas = () => {
  const canvasRef = useRef(null);
  
  // Multiplayer context (KEEP THIS)
  const { socket, players, worldObjects, currentPlayer } = useGameContext();
  
  // Multiplayer state (KEEP THIS)
  const [keys, setKeys] = useState(new Set());
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isMobile, setIsMobile] = useState(false);
  const [touchControls, setTouchControls] = useState({
    up: false,
    down: false,
    left: false,
    right: false
  });

  // User authentication (KEEP THIS)
  const { address, isConnected } = useAccount();
  const [userName, setUserName] = useState();

  // ✅ ADD: Single-player game systems from main.js
  const [gameState, setGameState] = useState({
    state: 'menu', // 'menu', 'intro', 'play', 'outro', 'finish', 'gameover'
    fps: 0,
    lastfps: 0,
    fpsTimer: 0,
    message: null,
    tooltip: null,
    viewport: { x: 0, y: 0 }
  });

  // ✅ ADD: Game system refs
  const gameSystemsRef = useRef({
    map: null,
    tileset: null,
    fontTile: null,
    soundHandler: null,
    timer: null,
    entities: [],
    collision: [],
    ground: []
  });

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imagesRef = useRef({
    // World objects (KEEP THIS)
    tree: null,
    rock: null,
    home: null,
    background: null,
    // Character images (KEEP THIS)
    Adam: null,
    Ash: null,
    Lucy: null,
    Nancy: null
  });

  // User profile loading (KEEP THIS)
  useEffect(() => {
    if (!address) return;
    async function loadUser() {
      const user = await existProfile(address);
      setUserName(user ? user.username : null);
    }
    loadUser();
  }, [address]);

  // ✅ MODIFIED: Initialize game systems from main.js
  useEffect(() => {
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Initialize tilesets and systems
    const newMapSet = new Tileset(mapSprites, 8, 8, 49, ctx);
    const fontTile = new Tileset(font, 8, 8, 39, ctx);
    const soundHandler = new Sound();

    // Initialize game data from level
    const ground = level.layers[0].data;
    const collision = Array.from(level.layers[1].data);
    const objects = level.layers[2].objects;

    // Create map
    const map = new Map(ground, newMapSet);

    // Setup entities (keys, doors, scrolls, messages)
    const entities = [];
    for (let i = 0; i < objects.length; i++) {
      entities.push(new Entity(objects[i]));
    }

    // Store in ref
    gameSystemsRef.current = {
      map,
      tileset: newMapSet,
      fontTile,
      soundHandler,
      timer: new Timer(3),
      entities,
      collision,
      ground
    };

  }, []);

  // Load images (KEEP THIS - for multiplayer characters and world objects)
  useEffect(() => {
    const imagesToLoad = {
      tree: '/sheets/tree2.png',
      rock: '/sheets/rock1.png',
      home: '/sheets/home.png',
      background: '/sheets/grass1.png',
      Adam: '/character/Adam_login.png',
      Ash: '/character/Ash_login.png',
      Lucy: '/character/Lucy_login.png',
      Nancy: '/character/Nancy_login.png'
    };

    let loadedCount = 0;
    const totalImages = Object.keys(imagesToLoad).length;

    Object.entries(imagesToLoad).forEach(([key, src]) => {
      const img = new Image();
      
      img.onload = () => {
        imagesRef.current[key] = img;
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };

      img.onerror = () => {
        console.error(`Failed to load ${key} from ${src}`);
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };

      img.src = src;
    });
  }, []);

  // Device detection (KEEP THIS)
  useEffect(() => {
    const detectDevice = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|Opera Mini/i.test(navigator.userAgent) || 
                            window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    const updateCanvasSize = () => {
      const container = canvasRef.current?.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const maxWidth = Math.min(containerRect.width - 32, 1200);
      const maxHeight = Math.min(window.innerHeight * 0.7, 800);
      
      const aspectRatio = 4 / 3;
      let width = maxWidth;
      let height = maxWidth / aspectRatio;
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
    };

    detectDevice();
    updateCanvasSize();

    const handleResize = () => {
      detectDevice();
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Keyboard input (KEEP THIS)
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
    };

    const handleKeyUp = (e) => {
      setKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(e.key.toLowerCase());
        return newSet;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch controls (KEEP THIS)
  const handleTouchStart = useCallback((direction) => {
    setTouchControls(prev => ({ ...prev, [direction]: true }));
  }, []);

  const handleTouchEnd = useCallback((direction) => {
    setTouchControls(prev => ({ ...prev, [direction]: false }));
  }, []);

  // ✅ MODIFIED: Movement with multiplayer socket
  useEffect(() => {
    if (!socket || !currentPlayer || currentPlayer.isSitting) return;

    const moveInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastMoveTime < 16) return;

      let deltaX = 0;
      let deltaY = 0;
      const speed = 4;

      if (keys.has('w') || keys.has('arrowup')) deltaY = -speed;
      if (keys.has('s') || keys.has('arrowdown')) deltaY = speed;
      if (keys.has('a') || keys.has('arrowleft')) deltaX = -speed;
      if (keys.has('d') || keys.has('arrowright')) deltaX = speed;

      if (touchControls.up) deltaY = -speed;
      if (touchControls.down) deltaY = speed;
      if (touchControls.left) deltaX = -speed;
      if (touchControls.right) deltaX = speed;

      if (deltaX !== 0 || deltaY !== 0) {
        // Send to server (MULTIPLAYER)
    //     const newX = currentPlayer.x + deltaX;
    //   const newY = currentPlayer.y + deltaY;
    //   const playerWidth = 32;
    //   const playerHeight = 32;

      // Check collision using your collision map
    //   const { collision } = gameSystemsRef.current;

    //   const isWalkable = (x, y) => {
    //     const gridX = Math.floor(x / 32);
    //     const gridY = Math.floor(y / 32);
    //     const index = gridX + (gridY * 48);

    //     if (gridX < 0 || gridX >= 48 || gridY < 0 || gridY >= 40) {
    //       return false;
    //     }
        
    //     // 0 = walkable, 2 = blocked
    //     return collision[index] === 0;
    //   };
      
// ✅ CORRECTED: Remove collision parameter from isWalkable calls
// const topLeft = isWalkable(newX, newY);
// const topRight = isWalkable(newX + playerWidth - 1, newY);
// const bottomLeft = isWalkable(newX, newY + playerHeight - 1);
// const bottomRight = isWalkable(newX + playerWidth - 1, newY + playerHeight - 1);


         // Only send move command if path is clear
     socket.emit('playerMove', { deltaX, deltaY });
      setLastMoveTime(now);
    }
  }, 8);

    return () => clearInterval(moveInterval);
  }, [socket, keys, touchControls, currentPlayer, lastMoveTime]);

  // ✅ NEW: Check entity collisions (from main.js)
  const checkEntities = useCallback(() => {
    if (!currentPlayer || !gameSystemsRef.current.entities) return;

    const { entities, soundHandler } = gameSystemsRef.current;

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (!entity.collected && overlap(
        currentPlayer.x, currentPlayer.y, 32, 32,
        entity.x + 8, entity.y + 8, 16, 16
      )) {
        switch (entity.type) {
          case 'key':
          case 'floor':
            // Handle key/floor logic
            entity.collected = true;
            if (entity.message) {
              setGameState(prev => ({ ...prev, tooltip: entity.message }));
              setTimeout(() => {
                setGameState(prev => ({ ...prev, tooltip: null }));
              }, 2500);
            }
            break;
          
          case 'scroll':
            entity.collected = true;
            soundHandler?.scrollSound();
            break;
          
          case 'message':
            if (!gameState.message) {
              setGameState(prev => ({ ...prev, message: entity.message }));
              setTimeout(() => {
                setGameState(prev => ({ ...prev, message: null }));
              }, 2500);
            }
            break;
        }
      }
    }
  }, [currentPlayer, gameState.message]);

  // ✅ NEW: Render loop combining both systems
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scaleX = canvasSize.width / 800;
      const scaleY = canvasSize.height / 600;

      // Draw background
      if (imagesLoaded && imagesRef.current.background) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(imagesRef.current.background, 0, 0, canvas.width, canvas.height);
      }

      // ✅ Draw map from main.js system
      if (gameSystemsRef.current.tileset && gameSystemsRef.current.ground) {
        const { ground, tileset } = gameSystemsRef.current;
        for (let i = 0; i < ground.length; i++) {
          const posX = (i % 48) * 32;
          const posY = Math.floor(i / 48) * 32;
          let assetX = (ground[i] - 1) * 8;
          
          ctx.drawImage(
            tileset.image,
            assetX, 0, 8, 8,
            posX - gameState.viewport.x,
            posY - gameState.viewport.y,
            32, 32
          );
        }
      }

      // ✅ Draw entities (keys, scrolls, etc.)
      if (gameSystemsRef.current.tileset?.image && gameSystemsRef.current.entities) {
        gameSystemsRef.current.entities.forEach(entity => {
          if (!entity.collected) {
            const posX = entity.x - gameState.viewport.x;
            const posY = entity.y - gameState.viewport.y;
            const assetX = entity.gid * 8;
            
            if (entity.type === 'key' || entity.type === 'scroll') {
              ctx.globalAlpha = 0.55 + tweenElement(gameState.fps, 100)*0.45;
            }
            
            ctx.drawImage(
              gameSystemsRef.current.tileset.image,
              assetX, 0, 8, 8,
              posX, posY, 32, 32
            );
            
            ctx.globalAlpha = 1;
          }
        });
      }

      // Draw world objects (MULTIPLAYER)
    //   worldObjects.forEach(obj => {
    //     const x = obj.x * scaleX;
    //     const y = obj.y * scaleY;
    //     const width = obj.width * scaleX;
    //     const height = obj.height * scaleY;

    //     if (imagesLoaded && imagesRef.current[obj.type]) {
    //       ctx.imageSmoothingEnabled = false;
    //       ctx.drawImage(imagesRef.current[obj.type], x, y, width, height);
    //     } else {
    //       ctx.fillStyle = getObjectColor(obj.type, obj.occupied);
    //       ctx.fillRect(x, y, width, height);
    //     }
    //   });

      // Draw players (MULTIPLAYER with character sprites)
        const currentPlayers = players;
    currentPlayers.forEach(player => {
      if (imagesLoaded ) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          imagesRef.current[player.avatar.character],
          player.x * scaleX,
          player.y * scaleY,
          player.width * scaleX,
          player.height * scaleY
        );
      } else {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x * scaleX, player.y * scaleY, player.width * scaleX, player.height * scaleY);
      }

        // Draw name (only show your name for your player)
        const displayName = player.id === socket?.id ? (userName || player.name) : player.name;
        
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.font = `bold ${12 * Math.min(scaleX, scaleY)}px Arial`;
        ctx.textAlign = 'center';
        ctx.strokeText(displayName, (player.x + player.width/2) * scaleX, (player.y - 5) * scaleY);
        ctx.fillText(displayName, (player.x + player.width/2) * scaleX, (player.y - 5) * scaleY);

        if (player.isSitting) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = `${10 * Math.min(scaleX, scaleY)}px Arial`;
          ctx.fillText('💺', (player.x + player.width/2) * scaleX, (player.y - 15) * scaleY);
        }
      });

      // ✅ Draw messages/tooltips from main.js
      if (gameState.message && gameSystemsRef.current.fontTile?.image) {
      textGenFull(ctx, gameState.message, { w: canvas.width, h: canvas.height }, gameSystemsRef.current.fontTile.image);
    } else if (gameState.tooltip && gameSystemsRef.current.fontTile?.image) {
      textGenPart(ctx, gameState.tooltip, { w: canvas.width, h: canvas.height }, gameSystemsRef.current.fontTile.image);
    }

      // Check collisions
      if (currentPlayer && gameSystemsRef.current.entities) {
      const { entities, soundHandler } = gameSystemsRef.current;

      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        if (!entity.collected && overlap(
          currentPlayer.x, currentPlayer.y, 32, 32,
          entity.x + 8, entity.y + 8, 16, 16
        )) {
          switch (entity.type) {
            case 'key':
            case 'floor':
              entity.collected = true;
              if (entity.message) {
                setGameState(prev => ({ ...prev, tooltip: entity.message }));
                setTimeout(() => {
                  setGameState(prev => ({ ...prev, tooltip: null }));
                }, 2500);
              }
              break;
            
            case 'scroll':
              entity.collected = true;
              soundHandler?.scrollSound();
              break;
            
            case 'message':
              if (!gameState.message) {
                setGameState(prev => ({ ...prev, message: entity.message }));
                setTimeout(() => {
                  setGameState(prev => ({ ...prev, message: null }));
                }, 2500);
              }
              break;
          }
        }
      }
    }

       animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
  }, [ canvasSize, imagesLoaded,players, worldObjects, currentPlayer, userName, socket, gameState, checkEntities]); //players, worldObjects, currentPlayer, userName, socket, gameState, checkEntities

//   const getObjectColor = (type, occupied) => {
//     switch (type) {
//       case 'tree': return '#228B22';
//       case 'home': return '#8B4513';
//       case 'rock': return '#696969';
//       default: return '#999';
//     }
//   };

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="game-canvas cursor-pointer border-2 border-gray-300 rounded-lg shadow-lg overflow-scroll"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',imageRendering: 'pixelated'
          }}
        />
      </div>
      
      {/* Keep all your existing UI components */}
      {/* Instructions, player count, mobile controls, etc. */}
    </div>
  );
};

export default GameCanvas;
