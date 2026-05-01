import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { hederaTestnet } from '@reown/appkit/networks';

// 1. Get Project ID
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || '2160ca9430a349cd96add67c48161dd4';

// 2. Define Networks
export const networks = [hederaTestnet];

// 3. Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks
});

// 4. Initialize AppKit with detailed metadata for standard compliance
export const appkit = createAppKit({
    adapters: [wagmiAdapter],
    networks: [hederaTestnet],
    defaultNetwork: hederaTestnet,
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
