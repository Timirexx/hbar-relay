import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

const WalletChoiceModal = ({ isOpen, onClose, onSelectEVM, onSelectNative }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/85 backdrop-blur-xl transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative bg-[#1A1025] border border-[#C084FC]/30 w-full max-w-md rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8),0_0_50px_rgba(192,132,252,0.1)] overflow-hidden animate-slide-down">
                
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-b from-white/5 to-transparent">
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">UPLINK_CHOICE</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <ShieldCheck size={12} className="text-[#C084FC]" />
                            <span className="text-[10px] font-bold text-[#C084FC] tracking-[0.2em] uppercase">HEDERA_TESTNET_ONLY</span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 rounded-2xl hover:bg-white/5 text-white/40 hover:text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 flex flex-col gap-4">
                    
                    {/* OPTION A: METAMASK (EVM) */}
                    <button 
                        onClick={() => {
                            onSelectEVM();
                            onClose();
                        }}
                        className="group relative flex items-center gap-6 p-6 rounded-3xl bg-[#2D1B4E]/40 border border-white/5 hover:border-[#F6851B]/50 transition-all duration-300 text-left overflow-hidden"
                    >
                        {/* Brand Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F6851B]/5 blur-3xl group-hover:bg-[#F6851B]/20 transition-all"></div>
                        
                        <div className="w-16 h-16 rounded-2xl bg-[#F6851B]/10 flex items-center justify-center border border-[#F6851B]/20 shadow-inner group-hover:scale-110 transition-transform">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-10 h-10 drop-shadow-[0_4px_8px_rgba(246,133,27,0.3)]" />
                        </div>
                        
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-white">METAMASK</span>
                            <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mt-1">EVM_PROTOCOL // ETHEREUM_MODE</span>
                        </div>
                    </button>

                    {/* OPTION B: HASHPACK (NATIVE) */}
                    <button 
                        onClick={() => {
                            onSelectNative();
                            onClose();
                        }}
                        className="group relative flex items-center gap-6 p-6 rounded-3xl bg-[#2D1B4E]/40 border border-white/5 hover:border-[#D15C22]/50 transition-all duration-300 text-left overflow-hidden"
                    >
                        {/* Brand Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D15C22]/5 blur-3xl group-hover:bg-[#D15C22]/20 transition-all"></div>

                        <div className="w-16 h-16 rounded-2xl bg-[#D15C22]/10 flex items-center justify-center border border-[#D15C22]/20 shadow-inner group-hover:scale-110 transition-transform">
                            <img src="https://www.hashpack.app/img/logo.svg" alt="HashPack" className="w-10 h-10 brightness-110 drop-shadow-[0_4px_8px_rgba(209,92,34,0.3)]" />
                        </div>

                        <div className="flex flex-col">
                            <span className="text-lg font-black text-white">HASHPACK</span>
                            <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mt-1">HEDERA_NATIVE // 0.0.XXX_MODE</span>
                        </div>
                    </button>

                </div>

                {/* Footer Tip */}
                <div className="p-6 bg-black/40 border-t border-white/5 text-center">
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">
                        Ensure your wallet is toggled to TESTNET mode before connecting.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WalletChoiceModal;
