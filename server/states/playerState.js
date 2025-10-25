// playerState.js - Player state management

class Player {
  constructor(name = '', x = 0, y = 0) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.anim = 'idle'; // default animation
    this.readyToConnect = false;
    this.videoConnected = false;
  }

  // Method to update player position
  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  // Method to update animation
  updateAnimation(anim) {
    this.anim = anim;
  }

  // Method to serialize player data for sending over socket
  serialize() {
    return {
      name: this.name,
      x: this.x,
      y: this.y,
      anim: this.anim,
      readyToConnect: this.readyToConnect,
      videoConnected: this.videoConnected
    };
  }
}

module.exports = Player;
