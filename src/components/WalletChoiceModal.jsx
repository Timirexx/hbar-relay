import React from 'react';
import { X, Wallet, ShieldCheck, Box } from 'lucide-react';

const WalletChoiceModal = ({ isOpen, onClose, onSelectEVM, onSelectNative }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-gradient-to-br from-[#2D1B4E]/90 to-[#140A23]/95 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="p-8 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-light-purple/10 flex items-center justify-center text-light-purple shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                            <Wallet size={24} />
                        </div>
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Select_Uplink</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/60 hover:text-white transition-all shadow-carved"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Options Grid */}
                <div className="p-8 flex flex-col gap-4">
                    
                    {/* OPTION A: EVM */}
                    <button 
                        onClick={() => {
                            onSelectEVM();
                            onClose();
                        }}
                        className="group relative flex items-center gap-4 p-6 rounded-2xl bg-black/20 border border-white/5 shadow-tactile hover:bg-light-purple/10 hover:border-light-purple/30 transition-all text-left"
                    >
                        <div className="w-12 h-12 rounded-xl bg-[#627EEA]/20 flex items-center justify-center text-[#627EEA]">
                            <Box size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black italic uppercase text-xs tracking-widest text-white group-hover:text-light-purple">MetaMask / EVM</h3>
                            <p className="text-[10px] text-white/40 mt-1">Connect via Reown AppKit protocol</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ShieldCheck size={16} className="text-light-purple" />
                        </div>
                    </button>

                    {/* OPTION B: NATIVE */}
                    <button 
                        onClick={() => {
                            onSelectNative();
                            onClose();
                        }}
                        className="group relative flex items-center gap-4 p-6 rounded-2xl bg-black/20 border border-white/5 shadow-tactile hover:bg-light-purple/10 hover:border-light-purple/30 transition-all text-left"
                    >
                        <div className="w-12 h-12 rounded-xl bg-light-purple/20 flex items-center justify-center text-light-purple">
                            <Zap size={28} fill="currentColor" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black italic uppercase text-xs tracking-widest text-white group-hover:text-light-purple">HashPack / Native</h3>
                            <p className="text-[10px] text-white/40 mt-1">Direct Hedera 0.0.xxx connection</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ShieldCheck size={16} className="text-light-purple" />
                        </div>
                    </button>

                </div>

                <div className="p-4 bg-black/20 text-[8px] font-bold text-center opacity-20 tracking-[1em] uppercase">
                    Protocol_Handshake_Ready
                </div>
            </div>
        </div>
    );
};

import { Zap } from 'lucide-react';
export default WalletChoiceModal;
