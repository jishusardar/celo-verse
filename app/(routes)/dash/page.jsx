import Image from 'next/image'
import React from 'react'
import { PlayDialog } from './_components/PlayDialog'

function HeroHome() {
  return (
    <div className="p-0">
      <section className="relativeh-[100vh] w-screen flex flex-col items-center justify-between text-white overflow-hidden max-w-7xl mx-auto">
      <div className="absolute inset-0 w-full h-full">
          <Image 
            src={'/background.jpg'} 
            alt="Vibrant abstract background image"
            fill 
            style={{ objectFit: "cover" }}
            sizes="100vw"
            priority
          />
      </div>
      <div className="relative z-20 text-center max-w-4xl p-6 md:p-12 pt-20 flex flex-col items-center justify-center grow"> 
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 leading-snug">
            <PlayDialog/> <br className="sm:hidden" />
          </h1>
        </div>
    </section>
    </div>
  )
}

export default HeroHome
