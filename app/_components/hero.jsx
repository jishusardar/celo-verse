"use client"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import Image from 'next/image'
import Link from 'next/link';
import React,{useState,useEffect} from 'react'
import { useAccount } from 'wagmi';
import { existProfile,upsertUser } from '../action';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

export let user_wallet_address ;

function Hero() {
  const { address, isConnected } = useAccount();
  const [userName, setUserName] = useState();

  useEffect(() => {
        if (!address) return;
        async function loadUser() {
            const user = await existProfile(address);
            console.log(user);
            setUserName(user ? user.username : null);
            
        }
        loadUser();
        user_wallet_address = address;
    },[address])

    function checkPlay() {
      if(userName) {
        redirect('/dash');
      }
    }

  async function handleProfileCreation(){
        if (!address) {
             toast.warning('Connect wallet')
        }
        if (!inputUserName.trim()) {
             toast.warning('Enter user-name')
        }
        try {
            await existProfile(address);
            await upsertUser(address,userName);
        } catch (error) {
            console.error('Error creating profile:', error);
            toast.error('Failed to create profile. Please try again.');
        }
    }
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
      <div className="relative z-20 text-center max-w-4xl p-6 md:p-12 pt-20 flex flex-col items-center justify-center grow"> 
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 leading-snug">
            Celoverse <br className="sm:hidden" />
          </h1>
          <p className="text-base md:text-xl text-gray-300 max-w-xl mx-auto mb-12">
            Celo verse is a web3 gaming platform that leverages the Celo blockchain to offer players a unique gaming experience with integrated crypto rewards NFT.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {isConnected? (<AlertDialog>
              <AlertDialogTrigger asChild>
            <button onClick={checkPlay}  className="px-8 py-3 text-base font-semibold rounded-full border-2 border-white text-white hover:bg-white/10 transition">
              <div> Play </div>
            </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Enter Your User Name:</AlertDialogTitle>
                <AlertDialogDescription>
                  <Input onChange={(e) => setUserName(e.target.value)} type="name" placeholder="Example : +
                  souvik23"/>
          </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
               <Link href={'/'}>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              </Link>
              <Link href={'/dash'}>
              <AlertDialogAction onClick={handleProfileCreation}>Continue</AlertDialogAction>
              </Link>
        </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>):(<button  className="px-8 py-3 text-base font-semibold rounded-full border-2 border-white text-white hover:bg-white/10 transition">
              <div>Connect Wallet and Play &gt;</div>
            </button>)
            }
          </div>
        </div>
    </section>
    </div>
  )
}

export default Hero
