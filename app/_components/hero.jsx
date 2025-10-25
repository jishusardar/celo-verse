import Image from 'next/image'
import React from 'react'

function Hero() {
  return (
    <div className="p-20">
      <section className="relative w-full h-[80vh] flex flex-col items-center justify-between text-white rounded-3xl overflow-hidden max-w-7xl mx-auto">
      <div className="absolute inset-0 w-full h-full">
          <Image 
            src={'/background.jpg'} 
            alt="background image"
            fill 
            style={{ objectFit: "cover" }}
            sizes="100vw"
            priority
          />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative z-20 text-center max-w-4xl p-6 md:p-12 pt-20 flex flex-col items-center justify-center flex-grow"> 
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 leading-snug">
            Celoverse <br className="sm:hidden" />
          </h1>
          <p className="text-base md:text-xl text-gray-300 max-w-xl mx-auto mb-12">
            Celo verse is a web3 gaming platform that leverages the Celo blockchain to offer players a unique gaming experience with integrated crypto rewards NFT.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="px-8 py-3 text-base font-semibold rounded-full border-2 border-white text-white hover:bg-white/10 transition">
              Connect Wallet and Play &gt;
            </button>
          </div>
        </div>
    </section>
    </div>
  )
}

export default Hero
