'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameContext } from '../context/GameContext';
import { useAccount } from 'wagmi';
import { redirect } from 'next/navigation';
import { existProfile } from '@/app/action';

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const { socket, players, worldObjects, currentPlayer } = useGameContext();
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

  // ✨ NEW: Image loading state and refs
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imagesRef = useRef({
    tree: null,
    rock: null,
    home: null,
    background: null,
    // Character images
    Adam: null,
    Ash: null,
    Lucy: null,
    Nancy: null
  });
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

  // ✨ NEW: Load all images
  useEffect(() => {
    const imagesToLoad = {
      tree: '/sheets/tree2.png',      // Put your tree.png in public folder
      rock: '/sheets/rock1.png',
      home: '/sheets/home.png',
      background: '/sheets/grass1.png',
      // Character images
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
          console.log('All images loaded successfully! 🎉');
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

  // Device detection and responsive sizing
  useEffect(() => {
    const detectDevice = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                            window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    const updateCanvasSize = () => {
      const container = canvasRef.current?.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const maxWidth = Math.min(containerRect.width - 32, 1200); // 32px for padding
      const maxHeight = Math.min(window.innerHeight * 0.7, 800);
      
      // Maintain aspect ratio (4:3)
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

  // Handle keyboard input
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

  // Touch control handlers
  const handleTouchStart = useCallback((direction) => {
    setTouchControls(prev => ({ ...prev, [direction]: true }));
  }, []);

  const handleTouchEnd = useCallback((direction) => {
    setTouchControls(prev => ({ ...prev, [direction]: false }));
  }, []);

  // Handle movement (keyboard + touch)
  useEffect(() => {
    if (!socket || !currentPlayer || currentPlayer.isSitting) return;

    const moveInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastMoveTime < 50) return; // Throttle movement

      let deltaX = 0;
      let deltaY = 0;
      const speed = 4;

      // Keyboard controls
      if (keys.has('w') || keys.has('arrowup')) deltaY = -speed;
      if (keys.has('s') || keys.has('arrowdown')) deltaY = speed;
      if (keys.has('a') || keys.has('arrowleft')) deltaX = -speed;
      if (keys.has('d') || keys.has('arrowright')) deltaX = speed;

      // Touch controls
      if (touchControls.up) deltaY = -speed;
      if (touchControls.down) deltaY = speed;
      if (touchControls.left) deltaX = -speed;
      if (touchControls.right) deltaX = speed;

      if (deltaX !== 0 || deltaY !== 0) {
        socket.emit('playerMove', { deltaX, deltaY });
        setLastMoveTime(now);
      }
    }, 8); // ~60fps

    return () => clearInterval(moveInterval);
  }, [socket, keys, touchControls, currentPlayer, lastMoveTime]);


  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      

      // ✨ Draw background FIRST (before anything else)
    if (imagesLoaded && imagesRef.current.background) {
      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(
        imagesRef.current.background,
        0, 0,
        canvas.width, 
        canvas.height
      );
    }

      // Calculate scaling factors
      const scaleX = canvasSize.width / 800;
      const scaleY = canvasSize.height / 600;

       worldObjects.forEach(obj => {
        const x = obj.x * scaleX;
        const y = obj.y * scaleY;
        const width = obj.width * scaleX;
        const height = obj.height * scaleY;

        // If images are loaded, use them
        if (imagesLoaded && imagesRef.current[obj.type]) {
          // Disable smoothing for pixel art
          ctx.imageSmoothingEnabled = false;
          
          ctx.drawImage(
            imagesRef.current[obj.type],
            x,
            y,
            width,
            height
          );
        } else {
          // Fallback to colored rectangles
          ctx.fillStyle = getObjectColor(obj.type, obj.occupied);
          ctx.fillRect(x, y, width, height);

          // Add visual details for fallback
    //       if (obj.type === 'tree') {
    //         ctx.fillStyle = '#8B4513';
    //         ctx.fillRect(
    //           (obj.x + obj.width/2 - 5) * scaleX,
    //           (obj.y + obj.height - 20) * scaleY,
    //           10 * scaleX,
    //           20 * scaleY
    //         );
    //       } else if (obj.type === 'home') {
    //         ctx.fillStyle = '#654321';
    //         ctx.fillRect(
    //           (obj.x + obj.width/2 - 8) * scaleX,
    //           (obj.y + obj.height - 30) * scaleY,
    //           16 * scaleX,
    //           30 * scaleY
    //         );
    //         ctx.fillStyle = '#87CEEB';
    //         ctx.fillRect((obj.x + 10) * scaleX, (obj.y + 20) * scaleY, 15 * scaleX, 15 * scaleY);
    //         ctx.fillRect((obj.x + obj.width - 25) * scaleX, (obj.y + 20) * scaleY, 15 * scaleX, 15 * scaleY);
    //       } else if (obj.type === 'rock') {
    //         ctx.fillStyle = '#8B4513';
    //         ctx.fillRect(
    //           (obj.x + obj.width/2 - 2) * scaleX,
    //           (obj.y - 10) * scaleY,
    //           4 * scaleX,
    //           15 * scaleY
    //         );
    //       }
    }
     });

      // Draw world objects
    //   worldObjects.forEach(obj => {
    //     ctx.fillStyle = getObjectColor(obj.type, obj.occupied);
    //     ctx.fillRect(obj.x * scaleX, obj.y * scaleY, obj.width * scaleX, obj.height * scaleY);

    //     // Add visual details
    //     if (obj.type === 'tree') {
    //       // Draw tree trunk
    //       ctx.fillStyle = '#8B4513';
    //       ctx.fillRect(
    //         (obj.x + obj.width/2 - 5) * scaleX, 
    //         (obj.y + obj.height - 20) * scaleY, 
    //         10 * scaleX, 
    //         20 * scaleY
    //       );
    //     } else if (obj.type === 'home') {
    //       // Draw door
    //       ctx.fillStyle = '#654321';
    //       ctx.fillRect(
    //         (obj.x + obj.width/2 - 8) * scaleX, 
    //         (obj.y + obj.height - 30) * scaleY, 
    //         16 * scaleX, 
    //         30 * scaleY
    //       );
    //       // Draw windows
    //       ctx.fillStyle = '#87CEEB';
    //       ctx.fillRect((obj.x + 10) * scaleX, (obj.y + 20) * scaleY, 15 * scaleX, 15 * scaleY);
    //       ctx.fillRect((obj.x + obj.width - 25) * scaleX, (obj.y + 20) * scaleY, 15 * scaleX, 15 * scaleY);
    //     } else if (obj.type === 'chair') {
    //       // Draw chair back
    //       ctx.fillStyle = obj.occupied ? '#FF6347' : '#8B4513';
    //       ctx.fillRect(
    //         (obj.x + obj.width/2 - 2) * scaleX, 
    //         (obj.y - 10) * scaleY, 
    //         4 * scaleX, 
    //         15 * scaleY
    //       );
    //     }
    //   });

      // Draw players
      players.forEach(player => {
        // Draw player character image
        if (imagesLoaded && player.avatar?.character && imagesRef.current[player.avatar.character]) {
          // Disable smoothing for pixel art
          ctx.imageSmoothingEnabled = false;

          ctx.drawImage(
            imagesRef.current[player.avatar.character],
            player.x * scaleX,
            player.y * scaleY,
            player.width * scaleX,
            player.height * scaleY
          );
        } else {
          // Fallback to colored rectangle if image not loaded
          ctx.fillStyle = player.color;
          ctx.fillRect(player.x * scaleX, player.y * scaleY, player.width * scaleX, player.height * scaleY);
        }

        // Draw player name
        ctx.fillStyle = 'white';
        ctx.font = `${12 * Math.min(scaleX, scaleY)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(player.name, (player.x + player.width/2) * scaleX, (player.y - 5) * scaleY);

        // Draw sitting indicator
        if (player.isSitting) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = `${10 * Math.min(scaleX, scaleY)}px Arial`;
          ctx.fillText('💺', (player.x + player.width/2) * scaleX, (player.y - 15) * scaleY);
        }
      });

      requestAnimationFrame(render);
    };

    render();
  }, [players, worldObjects, currentPlayer, canvasSize, imagesLoaded]);

  const getObjectColor = (type, occupied) => {
    switch (type) {
      case 'tree': return '#228B22';
      case 'home': return '#8B4513';
     
      case 'rock': return '#696969';
      default: return '#999';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Canvas Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="game-canvas cursor-pointer border-2 border-gray-300 rounded-lg shadow-lg"
          
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
      
      {/* Instructions overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded-lg text-sm max-w-48">
        <div className="font-bold mb-1">Controls:</div>
        <div className="text-xs">
          {isMobile ? (
            <>
              <div>Touch buttons: Move</div>
              <div>Tap chairs: Sit/Stand</div>
              <div>Tap chat: Message</div>
            </>
          ) : (
            <>
              <div>WASD / Arrow Keys: Move</div>
              <div>Click chairs: Sit/Stand</div>
              <div>Enter: Chat</div>
            </>
          )}
        </div>
      </div>

      {/* Player count */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-lg text-sm">
        <div className="font-bold">Players: {players.size}</div>
      </div>

      {/* Mobile Touch Controls */}
      {isMobile && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-center">
          <div className="bg-black bg-opacity-50 rounded-lg p-2">
            <div className="grid grid-cols-3 gap-2">
              <div></div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg touch-manipulation"
                onTouchStart={() => handleTouchStart('up')}
                onTouchEnd={() => handleTouchEnd('up')}
                onMouseDown={() => handleTouchStart('up')}
                onMouseUp={() => handleTouchEnd('up')}
                onMouseLeave={() => handleTouchEnd('up')}
              >
                ↑
              </button>
              <div></div>
              
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg touch-manipulation"
                onTouchStart={() => handleTouchStart('left')}
                onTouchEnd={() => handleTouchEnd('left')}
                onMouseDown={() => handleTouchStart('left')}
                onMouseUp={() => handleTouchEnd('left')}
                onMouseLeave={() => handleTouchEnd('left')}
              >
                ←
              </button>
              
              <button
                className="bg-gray-600 text-white p-3 rounded-lg touch-manipulation"
                onTouchStart={() => {
                  if (currentPlayer?.isSitting) {
                    socket?.emit('standUp');
                  } else {
                    socket?.emit('trySit');
                  }
                }}
              >
                💺
              </button>
              
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg touch-manipulation"
                onTouchStart={() => handleTouchStart('right')}
                onTouchEnd={() => handleTouchEnd('right')}
                onMouseDown={() => handleTouchStart('right')}
                onMouseUp={() => handleTouchEnd('right')}
                onMouseLeave={() => handleTouchEnd('right')}
              >
                →
              </button>
              
              <div></div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg touch-manipulation"
                onTouchStart={() => handleTouchStart('down')}
                onTouchEnd={() => handleTouchEnd('down')}
                onMouseDown={() => handleTouchStart('down')}
                onMouseUp={() => handleTouchEnd('down')}
                onMouseLeave={() => handleTouchEnd('down')}
              >
                ↓
              </button>
              <div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
