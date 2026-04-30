import React from 'react';
import { Wallet, LogOut } from 'lucide-react';

const WalletConnect = ({ connected, accountId, onConnect, onDisconnect, isConnecting }) => {
    return (
        <div className="flex items-center gap-4">
            {connected ? (
                <div className="flex items-center gap-4">
                    <div className="border-2 border-electric-lavender px-3 py-1 text-sm font-mono bg-soft-lilac text-cyber-indigo shadow-[4px_4px_0_#A855F7]">
                        {accountId}
                    </div>
                    <button 
                        onClick={onDisconnect}
                        className="btn-mechanical p-2 bg-neon-violet"
                        title="Disconnect"
                    >
                        <LogOut size={18} className="text-white" />
                    </button>
                </div>
            ) : (
                <button 
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="btn-mechanical flex items-center gap-2 bg-electric-lavender text-cyber-indigo"
                >
                    <Wallet size={18} />
                    {isConnecting ? 'SYNCING...' : 'UPLINK_WALLET'}
                </button>
            )}
        </div>
    );
};

export default WalletConnect;
