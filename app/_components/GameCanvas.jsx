'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const { socket, players, worldObjects, currentPlayer } = useGame();
  const [keys, setKeys] = useState(new Set());
  const [lastMoveTime, setLastMoveTime] = useState(0);

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

  // Handle movement
  useEffect(() => {
    if (!socket || !currentPlayer || currentPlayer.isSitting) return;

    const moveInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastMoveTime < 50) return; // Throttle movement

      let deltaX = 0;
      let deltaY = 0;
      const speed = 4 ;

      if (keys.has('w') || keys.has('arrowup')) deltaY = -speed;
      if (keys.has('s') || keys.has('arrowdown')) deltaY = speed;
      if (keys.has('a') || keys.has('arrowleft')) deltaX = -speed;
      if (keys.has('d') || keys.has('arrowright')) deltaX = speed;

      if (deltaX !== 0 || deltaY !== 0) {
        socket.emit('playerMove', { deltaX, deltaY });
        setLastMoveTime(now);
      }
    }, 16); // ~60fps

    return () => clearInterval(moveInterval);
  }, [socket, keys, currentPlayer, lastMoveTime]);

  // Handle clicking on chairs
  const handleCanvasClick = (e) => {
    if (!socket || !currentPlayer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw world objects
      worldObjects.forEach(obj => {
        ctx.fillStyle = getObjectColor(obj.type, obj.occupied);
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

        // Add visual details
        if (obj.type === 'tree') {
          // Draw tree trunk
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(obj.x + obj.width/2 - 5, obj.y + obj.height - 20, 10, 20);
        } else if (obj.type === 'home') {
          // Draw door
          ctx.fillStyle = '#654321';
          ctx.fillRect(obj.x + obj.width/2 - 8, obj.y + obj.height - 30, 16, 30);
          // Draw windows
          ctx.fillStyle = '#87CEEB';
          ctx.fillRect(obj.x + 10, obj.y + 20, 15, 15);
          ctx.fillRect(obj.x + obj.width - 25, obj.y + 20, 15, 15);
        } else if (obj.type === 'chair') {
          // Draw chair back
          ctx.fillStyle = obj.occupied ? '#FF6347' : '#8B4513';
          ctx.fillRect(obj.x + obj.width/2 - 2, obj.y - 10, 4, 15);
        }
      });

      // Draw players
      players.forEach(player => {
        // Draw player body
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Draw player name
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, player.x + player.width/2, player.y - 5);

        // Draw sitting indicator
        if (player.isSitting) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = '10px Arial';
          ctx.fillText('💺', player.x + player.width/2, player.y - 15);
        }
      });

      requestAnimationFrame(render);
    };

    render();
  }, [players, worldObjects, currentPlayer]);

  const getObjectColor = (type, occupied) => {
    switch (type) {
      case 'tree': return '#228B22';
      case 'home': return '#8B4513';
      case 'chair': return occupied ? '#FF6347' : '#D2691E';
      case 'obstacle': return '#696969';
      default: return '#999';
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas cursor-pointer"
        onClick={handleCanvasClick}
      />
      
      {/* Instructions overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg text-sm">
        <div className="font-bold mb-2">Controls:</div>
        <div>WASD / Arrow Keys: Move</div>
        <div>Click chairs: Sit/Stand</div>
        <div>Enter: Chat</div>
      </div>

      {/* Player count */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg text-sm">
        <div className="font-bold">Players Online: {players.size}</div>
      </div>
    </div>
  );
};

export default GameCanvas;
