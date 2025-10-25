"use client"
import React, { useRef } from 'react'
import { useGame } from '../gameParts/main'

function Game() {
  const canvasRef = useRef(null);
  
  // Initialize the game with the canvas reference
  useGame(canvasRef);

  return (
    <div>
      <canvas id="game" ref={canvasRef}></canvas>
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