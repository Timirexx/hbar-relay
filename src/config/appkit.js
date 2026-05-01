import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { hederaTestnet } from '@reown/appkit/networks';

// 1. Get Project ID (Hardcoded for stability)
export const projectId = '2160ca9430a349cd96add67c48161dd4';

// 2. Define Networks
export const networks = [hederaTestnet];

// 3. Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks
});

// 4. Initialize AppKit IMMEDIATELY
export const appkitInstance = createAppKit({
    adapters: [wagmiAdapter],
    networks,
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
        '--w3m-z-index': 999999
    }
});
