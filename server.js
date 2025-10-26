const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const { Server } = require('socket.io');
const { ethers } = require('ethers');
const { paySingle, payMultiple, getContractBalance } = require('./payoutService');
const cors = require('cors');

// Store for WebRTC rooms (playerId -> {socketId, streams})
const videoRooms = new Map();

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Celo provider
const celoProvider = new ethers.JsonRpcProvider(
  process.env.CELO_RPC_URL || 'https://alfajores-forno.celo-testnet.org'
);


// Initialize Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handler(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });





  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Game state
  const players = new Map();
  const worldObjects = [
    { id: 'tree1', type: 'tree', x: 100, y: 100, width: 40, height: 60 },
    { id: 'tree2', type: 'tree', x: 300, y: 200, width: 40, height: 60 },
    { id: 'home1', type: 'home', x: 500, y: 150, width: 80, height: 100 },
    { id: 'obstacle1', type: 'rock', x: 150, y: 400, width: 50, height: 50 },
    { id: 'obstacle2', type: 'rock', x: 600, y: 300, width: 40, height: 40 },
    { id: 'rock1', type: 'rock', x: 50, y: 50, width: 30, height: 30 },

    { id: 'tree1', type: 'tree', x: 120,y: 120, width: 40, height: 60 },
    { id: 'tree2', type: 'tree', x: 670, y: 378, width: 40, height: 60 },
    
    { id: 'obstacle1', type: 'rock', x: 487, y: 36, width: 50, height: 50 },
    { id: 'obstacle2', type: 'rock', x: 674, y: 34, width: 40, height: 40 },
    { id: 'rock1', type: 'rock', x: 87, y: 738, width: 30, height: 30 },

    { id: 'tree1', type: 'tree', x: 346, y: 56, width: 40, height: 60 },
    { id: 'tree2', type: 'tree', x: 85, y: 690, width: 40, height: 60 },
    
    { id: 'obstacle1', type: 'rock', x: 6, y: 496, width: 50, height: 50 },
    { id: 'obstacle2', type: 'rock', x: 35, y: 563, width: 40, height: 40 },
    { id: 'rock1', type: 'rock', x: 356, y: 79, width: 30, height: 30 },

    { id: 'tree1', type: 'tree', x: 352, y: 587, width: 40, height: 60 },
    { id: 'tree2', type: 'tree', x: 469, y: 246, width: 40, height: 60 },
    { id: 'home1', type: 'home', x: 234, y: 399, width: 80, height: 100 },
    { id: 'obstacle1', type: 'rock', x: 356, y: 486, width: 50, height: 50 },
    { id: 'obstacle2', type: 'rock', x: 335, y: 288, width: 40, height: 40 },
    { id: 'rock1', type: 'rock', x: 47, y: 48, width: 30, height: 30 },
  ];

  // Collision detection function
  const checkCollision = (player, newX, newY, playerWidth = 30, playerHeight = 30) => {
    // Check collision with world objects (excluding chairs when not occupied)
    for (const obj of worldObjects) {
      // Skip chairs that are not occupied (players can walk through empty chairs)
      if (obj.type === 'chair' && !obj.occupied) continue;
      
      // Check if player rectangle intersects with object rectangle
      if (newX < obj.x + obj.width &&
          newX + playerWidth > obj.x &&
          newY < obj.y + obj.height &&
          newY + playerHeight > obj.y) {
        return true; // Collision detected
      }
    }
    
    // Check collision with other players
    for (const [playerId, otherPlayer] of players) {
      if (playerId === player.id || otherPlayer.isSitting) continue;
      
      if (newX < otherPlayer.x + otherPlayer.width &&
          newX + playerWidth > otherPlayer.x &&
          newY < otherPlayer.y + otherPlayer.height &&
          newY + playerHeight > otherPlayer.y) {
        return true; // Collision with another player
      }
    }
    
    return false; // No collision
  };

  // Socket.IO event handlers
  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Create new player
    const newPlayer = {
      id: socket.id,
      x: Math.random() * 700,
      y: Math.random() * 500,
      width: 30,
      height: 30,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      name: `Player${Math.floor(Math.random() * 1000)}`,
      avatar: {
        body: 'default',
        hair: 'default',
        clothes: 'default',
        accessories: 'none',
        character: 'Adam'
      },
      isSitting: false,
      sittingOn: null
    };

    players.set(socket.id, newPlayer);

    // Send world state to new player
    socket.emit('worldState', {
      players: Array.from(players.values()),
      objects: worldObjects
    });

    // Notify other players
    socket.broadcast.emit('playerJoined', newPlayer);

    // Handle player movement
    socket.on('playerMove', ({ deltaX, deltaY }) => {
      const player = players.get(socket.id);
      if (player && !player.isSitting) {
        const newX = player.x + deltaX;
        const newY = player.y + deltaY;

        // Keep player in bounds
        const boundedX = Math.max(0, Math.min(770, newX));
        const boundedY = Math.max(0, Math.min(570, newY));

        // Check for collisions before updating position
        if (!checkCollision(player, boundedX, boundedY)) {
          player.x = boundedX;
          player.y = boundedY;
          players.set(socket.id, player);
          io.emit('playerMoved', { id: socket.id, x: player.x, y: player.y });
        }
      }
    });

    // Handle sitting
    socket.on('trySit', () => {
      const player = players.get(socket.id);
      if (!player || player.isSitting) return;

      // Find nearest available chair
      const nearbyChair = worldObjects.find(obj => 
        obj.type === 'chair' && 
        !obj.occupied &&
        Math.abs(obj.x - player.x) < 50 &&
        Math.abs(obj.y - player.y) < 50
      );

      if (nearbyChair) {
        nearbyChair.occupied = true;
        player.isSitting = true;
        player.sittingOn = nearbyChair.id;
        player.x = nearbyChair.x;
        player.y = nearbyChair.y;

        players.set(socket.id, player);
        io.emit('playerSitting', {
          playerId: socket.id,
          chairId: nearbyChair.id,
          x: player.x,
          y: player.y
        });
      }
    });

    // Handle standing up
    socket.on('standUp', () => {
      const player = players.get(socket.id);
      if (!player || !player.isSitting) return;

      const chair = worldObjects.find(obj => obj.id === player.sittingOn);
      if (chair) {
        chair.occupied = false;
      }

      player.isSitting = false;
      player.sittingOn = null;

      players.set(socket.id, player);
      io.emit('playerStanding', { playerId: socket.id });
    });

    // Handle avatar updates
    socket.on('updateAvatar', (avatar) => {
      const player = players.get(socket.id);
      if (player) {
        player.avatar = avatar;
        players.set(socket.id, player);
        io.emit('avatarUpdated', { id: socket.id, avatar });
      }
    });

    // Handle chat messages
    socket.on('chatMessage', (message) => {
      const player = players.get(socket.id);
      if (player) {
        const chatMsg = {
          id: Date.now().toString(),
          playerName: player.name,
          message: message,
          timestamp: Date.now()
        };
        io.emit('chatMessage', chatMsg);
      }
    });

    // WebRTC Signaling
    socket.on('joinVideoRoom', () => {
      const player = players.get(socket.id);
      if (player) {
        videoRooms.set(socket.id, { socketId: socket.id, streams: new Set() });
        socket.emit('videoRoomJoined', Array.from(videoRooms.keys()));
      }
    });

    socket.on('leaveVideoRoom', () => {
     console.log('Player leaving video room:', socket.id);
     videoRooms.delete(socket.id);
     socket.broadcast.emit('peerLeft', socket.id);
   });

    socket.on('offer', ({ targetId, offer }) => {
      io.to(targetId).emit('offer', { fromId: socket.id, offer });
    });

    socket.on('answer', ({ targetId, answer }) => {
      io.to(targetId).emit('answer', { fromId: socket.id, answer });
    });

    socket.on('ice-candidate', ({ targetId, candidate }) => {
      io.to(targetId).emit('ice-candidate', { fromId: socket.id, candidate });
    });

    socket.on('toggleVideo', ({ enabled }) => {
      socket.broadcast.emit('peerVideoToggle', { peerId: socket.id, enabled });
    });

    socket.on('toggleAudio', ({ enabled }) => {
      socket.broadcast.emit('peerAudioToggle', { peerId: socket.id, enabled });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
      
      const player = players.get(socket.id);
      if (player && player.isSitting) {
        const chair = worldObjects.find(obj => obj.id === player.sittingOn);
        if (chair) {
          chair.occupied = false;
        }
      }

      players.delete(socket.id);
      io.emit('playerLeft', socket.id);
    });
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running on same port`);
  });
});
