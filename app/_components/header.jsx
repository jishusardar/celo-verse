import Link from 'next/link'
import React from 'react'

function Header() {
  return (
      <header className="absolute top-0 left-0 w-full z-20 p-6 md:p-8">
    <div className="flex justify-between items-center max-w-7xl mx-auto">
      <div className="flex items-center space-x-8">
        <div className="flex items-center text-white text-xl font-bold">
          <div className="w-6 h-6 mr-2 bg-white rounded-full"></div>
          Celoverse
        </div>
        <nav className="hidden md:flex space-x-6 text-sm text-gray-300">
          <a href="#" className="hover:text-white transition">Features</a>
        </nav>
      </div>

        <Link href="/home" className='px-4 py-2 text-sm font-semibold rounded-full border border-gray-600 text-white bg-transparent hover:border-white transition'>
        Connect Wallet
        </Link>
    </div>
  </header>
  )
}

export default Header
