import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

const WalletChoiceModal = ({ isOpen, onClose, onSelectEVM, onSelectNative }) => {
    if (!isOpen) return null;

    // We handle the selection with a slight delay or order to ensure the engine fires
    const handleSelectEVM = (e) => {
        e.stopPropagation();
        console.log("UPLINK // EVM_SELECTED");
        onSelectEVM();
        onClose();
    };

    const handleSelectNative = (e) => {
        e.stopPropagation();
        console.log("UPLINK // NATIVE_SELECTED");
        onSelectNative();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 pointer-events-auto">
            {/* Backdrop - Explicitly clickable only for closing */}
            <div 
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl transition-opacity cursor-pointer"
                onClick={onClose}
            />

            {/* Modal Card - Elevated above backdrop */}
            <div className="relative z-50 bg-[#1A1025] border border-[#C084FC]/40 w-full max-w-md rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,1)] overflow-hidden animate-slide-down pointer-events-auto">
                
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-b from-white/5 to-transparent">
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">CHOOSE_WALLET</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <ShieldCheck size={12} className="text-[#C084FC]" />
                            <span className="text-[10px] font-bold text-[#C084FC] tracking-[0.2em] uppercase">HEDERA_TESTNET_ONLY</span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 rounded-2xl hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 flex flex-col gap-4 relative z-10">
                    
                    {/* OPTION A: METAMASK */}
                    <button 
                        onClick={handleSelectEVM}
                        className="group relative flex items-center gap-6 p-6 rounded-3xl bg-[#2D1B4E]/60 border border-white/10 hover:border-[#F6851B]/50 transition-all duration-300 text-left overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] pointer-events-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#F6851B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 rounded-2xl bg-[#F6851B]/10 flex items-center justify-center border border-[#F6851B]/20 shadow-inner group-hover:rotate-6 transition-transform">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-10 h-10" />
                        </div>
                        <div className="flex flex-col relative z-20">
                            <span className="text-lg font-black text-white uppercase tracking-tight">MetaMask</span>
                            <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mt-1">EVM // SMART_CONTRACTS</span>
                        </div>
                    </button>

                    {/* OPTION B: HASHPACK */}
                    <button 
                        onClick={handleSelectNative}
                        className="group relative flex items-center gap-6 p-6 rounded-3xl bg-[#2D1B4E]/60 border border-white/10 hover:border-[#D15C22]/50 transition-all duration-300 text-left overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] pointer-events-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#D15C22]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 rounded-2xl bg-[#D15C22]/10 flex items-center justify-center border border-[#D15C22]/20 shadow-inner group-hover:rotate-6 transition-transform">
                            <img src="https://www.hashpack.app/img/logo.svg" alt="HashPack" className="w-10 h-10 brightness-110" />
                        </div>
                        <div className="flex flex-col relative z-20">
                            <span className="text-lg font-black text-white uppercase tracking-tight">HashPack</span>
                            <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mt-1">NATIVE // 0.0.XXX_ACCOUNTS</span>
                        </div>
                    </button>

                </div>

                {/* Footer Tip */}
                <div className="p-6 bg-black/40 border-t border-white/5 text-center">
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">
                        Click outside to abort the uplink sequence.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WalletChoiceModal;
