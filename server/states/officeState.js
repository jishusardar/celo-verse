// officeState.js - Office/Room state management

const Player = require('./playerState');

class OfficeState {
  constructor() {
    this.players = new Map(); // Use JavaScript Map instead of MapSchema
  }

  // Add a new player
  addPlayer(playerId, playerData) {
    const player = new Player(
      playerData.name,
      playerData.x || 0,
      playerData.y || 0
    );
    this.players.set(playerId, player);
    return player;
  }

  // Remove a player
  removePlayer(playerId) {
    return this.players.delete(playerId);
  }

  // Get a player
  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  // Update player data
  updatePlayer(playerId, updates) {
    const player = this.players.get(playerId);
    if (player) {
      Object.assign(player, updates);
    }
    return player;
  }

  // Serialize all players for broadcasting
  serialize() {
    const playersObj = {};
    this.players.forEach((player, playerId) => {
      playersObj[playerId] = player.serialize();
    });
    return {
      players: playersObj
    };
  }

  // Get all players as array
  getAllPlayers() {
    return Array.from(this.players.entries()).map(([id, player]) => ({
      id,
      ...player.serialize()
    }));
  }
}

module.exports = OfficeState;
