import { HashConnect } from 'hashconnect';

const NETWORK = import.meta.env.VITE_NETWORK || 'testnet';
const appMetadata = {
    name: "HBAR RELAY",
    description: "Brutalist 2D dApp Relay",
    icon: "https://www.hashpack.app/img/logo.svg"
};

// Create a SINGLETON instance that lives for the duration of the session
export const hcInstance = new HashConnect(NETWORK, true);

// Initialize it immediately at the module level
export let hcInitData = null;

export const initHashConnect = async () => {
    if (hcInitData) return hcInitData;
    console.log("UPLINK // INITIALIZING_HASHPACK_SINGLETON");
    hcInitData = await hcInstance.init(appMetadata);
    return hcInitData;
};

// Start the init process immediately
initHashConnect();
