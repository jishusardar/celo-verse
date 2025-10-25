"use client"
import Link from 'next/link'
import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

function Header() {
  return (
    <header className="absolute top-0 left-0 w-full z-20 p-6 md:p-8">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <div className="flex items-center text-white text-xl font-bold">
            <div className="w-6 h-6 mr-2 bg-white rounded-full"></div>
            Celoverse
          </div>
        </div>
        <ConnectButton />
        
      </div>
    </header>
  )
}

export default Header
