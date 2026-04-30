import React from 'react';
import { Wallet, LogOut } from 'lucide-react';

const WalletConnect = ({ connected, accountId, onConnect, onDisconnect, isConnecting }) => {
    return (
        <div className="flex items-center gap-4">
            {connected ? (
                <div className="flex items-center gap-4">
                    <div className="border-2 border-white px-3 py-1 text-sm font-mono bg-white text-black">
                        {accountId}
                    </div>
                    <button 
                        onClick={onDisconnect}
                        className="brutalist-button p-2 bg-signal-orange"
                        title="Disconnect"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            ) : (
                <button 
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="brutalist-button flex items-center gap-2"
                >
                    <Wallet size={18} />
                    {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
                </button>
            )}
        </div>
    );
};

export default WalletConnect;
