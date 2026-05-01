import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { hederaTestnet } from '@reown/appkit/networks';

// 1. Get Project ID
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

// 2. Define Networks
export const networks = [hederaTestnet];

// 3. Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks
});

// 4. Initialize AppKit
export const appkit = createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata: {
        name: 'HBAR RELAY',
        description: 'Brutalist 2D dApp Relay',
        url: 'https://hbar-relay.vercel.app',
        icons: ['https://www.hashpack.app/img/logo.svg']
    },
    features: {
        analytics: false
    },
    themeMode: 'dark',
    themeVariables: {
        '--w3m-accent': '#C084FC',
        '--w3m-color-mix': '#1A1025',
        '--w3m-border-radius-master': '24px',
        '--w3m-z-index': 99999
    }
});
