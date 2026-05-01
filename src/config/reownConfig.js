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
