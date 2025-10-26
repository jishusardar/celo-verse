const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

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
    { id: 'chair1', type: 'chair', x: 200, y: 300, width: 30, height: 30, occupied: false },
    { id: 'chair2', type: 'chair', x: 400, y: 350, width: 30, height: 30, occupied: false },
    { id: 'obstacle1', type: 'rock', x: 150, y: 400, width: 50, height: 50 },
    { id: 'obstacle2', type: 'rock', x: 600, y: 300, width: 40, height: 40 },
    { id: 'rock1', type: 'rock', x: 50, y: 50, width: 30, height: 30 },
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
