import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiAdapter, projectId, networks } from '../config/reownConfig';
import { createAppKit } from '@reown/appkit/react';

// --- ENGINE INITIALIZATION ---
// We call this here to ensure it executes as soon as the Provider is loaded
createAppKit({
    adapters: [wagmiAdapter],
    networks,
    defaultNetwork: networks[0],
    projectId,
    metadata: {
        name: 'HBAR RELAY',
        description: 'Standard Protocol Node',
        url: 'https://hbar-relay.vercel.app',
        icons: ['https://avatars.githubusercontent.com/u/179229932']
    },
    features: {
        analytics: false,
        email: false,
        socials: []
    },
    themeMode: 'dark',
    themeVariables: {
        '--w3m-accent': '#C084FC',
        '--w3m-z-index': 99999
    }
});

const queryClient = new QueryClient();

export const Web3Provider = ({ children }) => {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
};
