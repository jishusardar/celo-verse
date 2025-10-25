const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Store room states
const rooms = new Map();

// Get or create room state
function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new OfficeState());
  }
  return rooms.get(roomId);
}

  io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  let currentRoom = null;
  let currentPlayer = null;

  // Join room
  socket.on('joinRoom', (data) => {
    const { roomId, playerName, x, y } = data;
    
    // Leave previous room if any
    if (currentRoom) {
      socket.leave(currentRoom);
    }

    // Join new room
    socket.join(roomId);
    currentRoom = roomId;

    // Get or create room state
    const roomState = getOrCreateRoom(roomId);

    // Add player to room
    currentPlayer = roomState.addPlayer(socket.id, {
      name: playerName,
      x: x || 0,
      y: y || 0
    });

    // Send current state to the joining player
    socket.emit('currentPlayers', roomState.serialize());

    // Notify other players about new player
    socket.to(roomId).emit('playerJoined', {
      id: socket.id,
      player: currentPlayer.serialize()
    });

    console.log(`Player ${playerName} joined room ${roomId}`);
  });

  // Player movement
  socket.on('playerMovement', (data) => {
    if (!currentRoom) return;

    const { x, y, anim } = data;
    const roomState = rooms.get(currentRoom);
    
    if (roomState) {
      roomState.updatePlayer(socket.id, { x, y, anim });
      
      // Broadcast to other players in the room
      socket.to(currentRoom).emit('playerMoved', {
        id: socket.id,
        x,
        y,
        anim
      });
    }
  });

  // Ready to connect (for video/voice)
  socket.on('readyToConnect', (isReady) => {
    if (!currentRoom) return;

    const roomState = rooms.get(currentRoom);
    if (roomState) {
      roomState.updatePlayer(socket.id, { readyToConnect: isReady });
      
      socket.to(currentRoom).emit('playerReadyChange', {
        id: socket.id,
        readyToConnect: isReady
      });
    }
  });

  // Video connected status
  socket.on('videoConnected', (isConnected) => {
    if (!currentRoom) return;

    const roomState = rooms.get(currentRoom);
    if (roomState) {
      roomState.updatePlayer(socket.id, { videoConnected: isConnected });
      
      socket.to(currentRoom).emit('playerVideoChange', {
        id: socket.id,
        videoConnected: isConnected
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    if (currentRoom) {
      const roomState = rooms.get(currentRoom);
      if (roomState) {
        roomState.removePlayer(socket.id);
        
        // Notify other players
        socket.to(currentRoom).emit('playerLeft', socket.id);

        // Clean up empty rooms
        if (roomState.players.size === 0) {
          rooms.delete(currentRoom);
          console.log(`Room ${currentRoom} deleted (empty)`);
        }
      }
    }
  });
});

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});