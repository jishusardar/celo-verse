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
  const worldObjects = [{
          "gid": 41,
          "properties": {
            "key_id": "0"
          },
          "x": 168.068723520391,
          "y": 304.210537259897
        },
        {
          "gid": 41,
          "properties": {
            "key_id": "1",
            "message": "forest open"
          },
          "x": 271.907779481714,
          "y": 272.11010318925
        },
        {
          "gid": 43,
          "properties": {
            "cX": 23,
            "cY": 35,
            "key_id": "0"
          },
          "x": 183.963926729017,
          "y": 287.997234483859
        },
        {
          "gid": 43,
          "properties": {
            "cX": 23,
            "cY": 36,
            "key_id": "0"
          },
          "x": 183.963926729017,
          "y": 295.974684890709
        },
        {
          "gid": 43,
          "properties": {
            "cX": 16,
            "cY": 35,
            "key_id": "99"
          },
          "x": 127.856255066198,
          "y": 287.977303431505
        },
        {
          "gid": 43,
          "properties": {
            "cX": 16,
            "cY": 36,
            "key_id": "99"
          },
          "x": 127.856255066198,
          "y": 295.948122129154
        },
        {
          "gid": 43,
          "properties": {
            "cX": 36,
            "cY": 33,
            "key_id": "3"
          },
          "x": 288.031664915439,
          "y": 272.020598121953
        },
        {
          "gid": 43,
          "properties": {
            "cX": 36,
            "cY": 34,
            "key_id": "3"
          },
          "x": 288.031664915439,
          "y": 279.998598121953
        },
        {
          "gid": 40,
          "properties": {
            "message": "Hmm machine *locked whole *this place. *Find a way to *turn it down! **         Dan",
            "message_id": "0"
          },
          "x": 143.110327622781,
          "y": 277.832664074891
        },
        {
          "gid": 42,
          "properties": {
            "scroll_id": "0"
          },
          "x": 295.786697692457,
          "y": 304.036247715519
        },
        {
          "gid": 44,
          "properties": {
            "cX": 27,
            "cY": 32,
            "key_id": "1"
          },
          "x": 216.014969126177,
          "y": 264.088567329882
        },
        {
          "gid": 44,
          "properties": {
            "cX": 28,
            "cY": 32,
            "key_id": "1"
          },
          "x": 223.967317407846,
          "y": 264.088567329882
        },
        {
          "gid": 44,
          "properties": {
            "cX": 43,
            "cY": 26,
            "key_id": "4"
          },
          "x": 343.929743023581,
          "y": 216.130033954836
        },
        {
          "gid": 44,
          "properties": {
            "cX": 44,
            "cY": 26,
            "key_id": "4"
          },
          "x": 351.881743023581,
          "y": 216.130033954836
        },
        {
          "gid": 41,
          "properties": {
            "key_id": "4"
          },
          "x": 351.960538561284,
          "y": 208.040405553523
        },
        {
          "gid": 41,
          "properties": {
            "key_id": "8",
            "message": "basement open"
          },
          "x": 223.893219903859,
          "y": 176.030661123198
        },
        {
          "gid": 41,
          "properties": {
            "key_id": "3",
            "message": "garden open"
          },
          "x": 159.964706387747,
          "y": 152.002747775548
        },
        {
          "gid": 43,
          "properties": {
            "cX": 15,
            "cY": 3,
            "key_id": "8"
          },
          "x": 119.965612538113,
          "y": 32.0421363127097
        },
        {
          "gid": 43,
          "properties": {
            "cX": 15,
            "cY": 4,
            "key_id": "8"
          },
          "x": 119.965612538113,
          "y": 40.0201363127097
        },
        {
          "gid": 43,
          "properties": {
            "cX": 7,
            "cY": 35,
            "key_id": "99"
          },
          "x": 55.9864200478847,
          "y": 287.994347894629
        },
        {
          "gid": 43,
          "properties": {
            "cX": 7,
            "cY": 36,
            "key_id": "99"
          },
          "x": 55.9864200478847,
          "y": 295.965347894629
        },
        {
          "gid": 44,
          "properties": {
            "cX": 20,
            "cY": 24,
            "key_id": "6"
          },
          "x": 160.004822951058,
          "y": 200.038858311182
        },
        {
          "gid": 44,
          "properties": {
            "cX": 21,
            "cY": 24,
            "key_id": "6"
          },
          "x": 167.956822951058,
          "y": 200.038858311182
        },
        {
          "gid": 44,
          "properties": {
            "cX": 43,
            "cY": 6,
            "key_id": "7"
          },
          "x": 344.049482255728,
          "y": 56.0111452750509
        },
        {
          "gid": 44,
          "properties": {
            "cX": 44,
            "cY": 6,
            "key_id": "7"
          },
          "x": 352.001482255728,
          "y": 56.0111452750509
        },
        {
          "gid": 42,
          "properties": {
            "scroll_id": "1"
          },
          "x": 360.022009871549,
          "y": 39.9176360746903
        },
        {
          "gid": 41,
          "properties": {
            "key_id": "7"
          },
          "x": 360.04990006203,
          "y": 16.1254393824523
        },
        {
          "gid": 42,
          "properties": {
            "scroll_id": "2"
          },
          "x": 359.980774807226,
          "y": 303.981810008799
        },
        {
          "gid": 42,
          "properties": {
            "scroll_id": "3"
          },
          "x": 7.9777483110204,
          "y": 311.932761238971
        },
        {
          "gid": 41,
          "properties": {
            "key_id": "6",
            "message": "island open"
          },
          "x": 72.0635739198713,
          "y": 79.9484141306786
        },
        {
          "gid": 1,
          "properties": {
            "key_id": "99"
          },
          "x": 175.975550145427,
          "y": 288.037648029262
        },
        {
          "gid": 1,
          "properties": {
            "key_id": "99"
          },
          "x": 175.959735627496,
          "y": 296.040782242246
        },
        {
          "gid": 42,
          "properties": {
            "scroll_id": "4"
          },
          "x": 8.04977665612947,
          "y": 16.0203051993646
        },
        {
          "gid": 40,
          "properties": {
            "message": "keep off the *flowers...",
            "message_id": "1"
          },
          "x": 223.960032778568,
          "y": 222.382451699703
        },
        {
          "gid": 40,
          "properties": {
            "message": "This beatiful *water... *Makes me soo *happy!",
            "message_id": "2"
          },
          "x": 247.908866997143,
          "y": 150.575282635577
        },
        {
          "gid": 40,
          "properties": {
            "message": "Code with *five digits.. *Security!!",
            "message_id": "3"
          },
          "x": 24.0332488200485,
          "y": 110.034071874533
        },
        {
          "gid": 40,
          "properties": {
            "message": "Someone needs *to clean this!",
            "message_id": "4"
          },
          "x": 136.183798224027,
          "y": 14.2705302013792
        },
        {
          "gid": 40,
          "properties": {
            "message": "Who is hiding*in grass..",
            "message_id": "5"
          },
          "x": 368.049794875805,
          "y": 222.495687931816
        },
        {
          "gid": 1,
          "properties": {
            "finish_id": 1
          },
          "x": 119.745771662646,
          "y": 288.022893681401
        },
        {
          "gid": 1,
          "properties": {
            "finish_id": 1
          },
          "x": 119.745771662646,
          "y": 295.872971468535
        }
      ]

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
