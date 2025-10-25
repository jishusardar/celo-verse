"use client"
import Image from 'next/image'
import React,{useEffect,useState} from 'react'
import { PlayDialog } from './_components/PlayDialog'
import { Providers } from '@/app/lib/Providers'
import { useAccount } from 'wagmi';
import { redirect } from 'next/navigation';
import { existProfile } from '@/app/action';

function HeroHome() {
   const { address, isConnected } = useAccount();
  const [userName, setUserName] = useState();
  useEffect(()=> {
    if (!isConnected) {
      redirect('/')
    }
  },[])
  useEffect(() => {
          if (!address) return;
          async function loadUser() {
              const user = await existProfile(address);
              console.log(user);
              setUserName(user ? user.username : null);
              
          }
          loadUser();
         },[address])

  function handleRedirection() {
    if(userName) {
      redirect('/playground')
    }
  }

  return (
    <div className="p-0">
      <Providers >
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
          <h1 onClick={handleRedirection} className="text-5xl sm:text-7xl font-extrabold mb-6 leading-snug">
            <PlayDialog/> <br className="sm:hidden" />
          </h1>
        </div>
    </section>
    </Providers>
    </div>
  )
}

export default HeroHome
