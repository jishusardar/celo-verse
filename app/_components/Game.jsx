"use client"
import React, {useState, useRef,useEffect,useCallback } from 'react'
import { useGame } from '../gameParts/main'
import { useGameContext } from '../context/GameContext';

function Game() {
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

  const handleTouchStart = useCallback((direction) => {
      setTouchControls(prev => ({ ...prev, [direction]: true }));
    }, []);
  
    const handleTouchEnd = useCallback((direction) => {
      setTouchControls(prev => ({ ...prev, [direction]: false }));
    }, []);

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

        // Handle clicking/tapping on chairs
  const handleCanvasClick = (e) => {
    if (!socket || !currentPlayer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasSize.width / 800; // Scale factor for responsive canvas
    const scaleY = canvasSize.height / 600;
    
    const x = (e.clientX - rect.left) / scaleX;
    const y = (e.clientY - rect.top) / scaleY;

    // Check if clicking on a chair
    const clickedChair = worldObjects.find(obj => 
      obj.type === 'chair' && 
      x >= obj.x && x <= obj.x + obj.width &&
      y >= obj.y && y <= obj.y + obj.height
    );

    if (clickedChair) {
      if (currentPlayer.isSitting) {
        socket.emit('standUp');
      } else {
        socket.emit('trySit');
      }
    }
  };

  useGame(canvasRef);

  return (
    <div>
      <canvas id="game" ref={canvasRef}
      width={canvasSize.width}
          height={canvasSize.height}
          className="game-canvas cursor-pointer border-2 border-gray-300 rounded-lg shadow-lg"
          onClick={handleCanvasClick}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}></canvas>
      <div className="orientation" id="orientation">&#8634;</div>
      <div className="mobile-block" id="mobile-control">
        <div className="control" id="left">&#8592;</div>
        <div className="control" id="up">&#8593;</div>
        <div className="control" id="down">&#8595;</div>
        <div className="control" id="right">&#8594;</div>
      </div>
    </div>
  )
}

export default Game