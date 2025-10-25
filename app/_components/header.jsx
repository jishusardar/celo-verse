<<<<<<< HEAD
import Image from 'next/image'
=======
"use client"
>>>>>>> 47c90a1e45ae5494ac87f6abe9d131d972dd97ee
import Link from 'next/link'
import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

function Header() {
  return (
<<<<<<< HEAD
      <header className="absolute top-0 left-0 w-full z-20 p-6 md:p-8">
    <div className="flex justify-between items-center max-w-7xl mx-auto">
      <div className="flex items-center space-x-8">
        <div className="flex items-center text-white text-xl font-bold">
          {/* {logo} */}
          <div className='mr-2'>
            <Image
              src={'/logo.png'} 
              alt='logo'
              width={50}
              height={50}
            />
          </div>
          Celoverse
=======
    <header className="absolute top-0 left-0 w-full z-20 p-6 md:p-8">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <div className="flex items-center text-white text-xl font-bold">
            <div className="w-6 h-6 mr-2 bg-white rounded-full"></div>
            Celoverse
          </div>
>>>>>>> 47c90a1e45ae5494ac87f6abe9d131d972dd97ee
        </div>
        <ConnectButton />
        
      </div>
<<<<<<< HEAD
        <Link href="/home" className='px-4 py-2 text-sm font-semibold rounded-full border border-gray-600 text-white bg-transparent hover:border-white transition'>
        Connect Wallet
        </Link>
    </div>
  </header>
=======
    </header>
>>>>>>> 47c90a1e45ae5494ac87f6abe9d131d972dd97ee
  )
}

export default Header
