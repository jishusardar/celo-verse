import React from 'react'
import Header from './_components/header'
import Hero from './_components/hero'
import { Providers } from './lib/Providers'

function Homepage() {
  return (
    <div>
      <Providers >
        <Header/>
        <Hero/>
      </Providers>
      
    </div>
  )
}

export default Homepage