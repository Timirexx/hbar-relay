import React, { useState } from 'react';
import { Wallet, ChevronDown, Copy, RefreshCw, LogOut, Box, Zap } from 'lucide-react';
import { useDualWallet } from '../hooks/useDualWallet';

const WalletConnectNode = () => {
    const { 
        isConnected, 
        address, 
        balance, 
        disconnectWallet, 
        openWalletModal 
    } = useDualWallet();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const truncateId = (id) => id ? `${id.slice(0, 6)}...${id.slice(-4)}` : '';

    if (!isConnected) {
        return (
            <button 
                onClick={openWalletModal}
                className="group bg-[#2A1B3D] text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black tracking-widest text-sm uppercase transition-all duration-300 shadow-tactile border-t border-white/10 hover:scale-105 hover:bg-[#3D2759] active:translate-y-1 active:shadow-inner animate-pulse-glow"
            >
                <Wallet size={18} className="group-hover:rotate-12 transition-transform" />
                <span>Connect Wallet</span>
            </button>
        );
    }

    return (
        <div className="relative flex flex-col items-end gap-2">
            <div 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="bg-[#1A1025]/80 backdrop-blur-md border-t border-[#C084FC]/40 rounded-full p-1.5 flex items-center gap-6 shadow-2xl cursor-pointer hover:border-[#C084FC]/60 transition-all group"
            >
                <div className="flex items-center gap-2 pl-3">
                    <div className="w-2 h-2 rounded-full animate-pulse shadow-lg bg-[#C084FC] shadow-[#C084FC]"></div>
                    <span className="text-[10px] font-black tracking-[0.2em] text-white/60 uppercase">
                        Protocol_Ready
                    </span>
                </div>

                <div className="text-sm font-black text-white flex items-center gap-2 drop-shadow-[0_0_8px_#A855F7]">
                    <span className="opacity-40 text-[10px]">READOUT:</span>
                    <span>{balance}</span>
                </div>

                <div className="bg-black/40 px-4 py-2 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-white/5 flex items-center gap-2">
                    <Box size={14} className="text-[#C084FC]" />
                    <span className="text-xs font-mono font-bold text-[#C084FC]/90">{truncateId(address)}</span>
                    <ChevronDown size={14} className={`text-[#C084FC] transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {dropdownOpen && (
                <div className="absolute top-full mt-2 w-56 bg-[#1A1025]/95 backdrop-blur-xl border border-[#C084FC]/20 rounded-2xl shadow-3xl p-2 animate-slide-down overflow-hidden z-[100]">
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(address);
                            setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#C084FC]/10 text-xs font-bold text-white transition-all group"
                    >
                        <Copy size={14} className="text-[#C084FC]" />
                        <span>Copy Address</span>
                    </button>

                    <button 
                        onClick={() => {
                            disconnectWallet();
                            setDropdownOpen(false);
                            openWalletModal();
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#C084FC]/10 text-xs font-bold text-white transition-all"
                    >
                        <RefreshCw size={14} className="text-[#C084FC]" />
                        <span>Change Wallet</span>
                    </button>

                    <div className="h-[1px] bg-white/5 my-1 mx-2"></div>

                    <button 
                        onClick={() => {
                            disconnectWallet();
                            setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-xs font-bold text-red-400 transition-all"
                    >
                        <LogOut size={14} />
                        <span>Disconnect</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default WalletConnectNode;
