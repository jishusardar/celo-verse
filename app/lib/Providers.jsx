"use client"

import '@rainbow-me/rainbowkit/styles.css';
import { celoSepoliaTestnet, sepolia } from './config';
import { ReactNode } from 'react';

import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const config = getDefaultConfig({
  appName: 'fun-world',
  projectId: '48a659c2e97d9b1924a096b71ff4f45d',
  chains: [celoSepoliaTestnet, sepolia], //,mainnet, polygon, optimism, arbitrum, base
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider>
                <main className="flex min-h-screen w-full flex-col items-center py-8 px-16 dark:bg-black ">
                  {children}
    
                </main>
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
  );
}
