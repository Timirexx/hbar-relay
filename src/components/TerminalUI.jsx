import React, { useState, useMemo } from 'react';
import { Zap, Activity, Cpu, Shield, Clock } from 'lucide-react';

const TerminalUI = ({ 
    score, 
    onStart, 
    onClaimStars, 
    connected, 
    isPaying, 
    leaderboard = [],
    starCount = 0
}) => {
    const [isExtracting, setIsExtracting] = useState(false);

    const handleClaim = async () => {
        setIsExtracting(true);
        await onClaimStars();
        setTimeout(() => setIsExtracting(false), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 relative z-20">
            {/* ACTION CENTER */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="glass-3d p-8 flex flex-col items-center">
                    <div className="text-light-purple font-black text-xs tracking-[0.3em] mb-8 uppercase flex items-center gap-2">
                        <Cpu size={16} className="animate-pulse" /> Command_Relay
                    </div>
                    
                    <button 
                        onClick={onStart}
                        disabled={!connected || isPaying}
                        className="btn-3d w-full py-8 text-2xl font-black"
                    >
                        {isPaying ? 'SYNCING...' : 'RELAY_START'}
                    </button>
                    
                    <div className="mt-8 flex justify-between w-full text-[10px] text-light-purple/60 font-bold uppercase border-t border-white/5 pt-4">
                        <span className="flex items-center gap-1"><Shield size={12}/> Secure_Node</span>
                        <span>GAS: 1000 tHBAR</span>
                    </div>
                </div>

                {/* ENERGY STORAGE (Modern 3D) */}
                <div className="glass-3d p-8 flex flex-col gap-6 relative overflow-hidden group">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-light-purple opacity-40 tracking-widest mb-2">Energy_Stars</span>
                            <span className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                                {starCount.toString().padStart(4, '0')}
                            </span>
                        </div>
                        <Activity size={32} className="text-light-purple animate-pulse" />
                    </div>

                    <button 
                        onClick={handleClaim}
                        disabled={!connected || isExtracting}
                        className="btn-3d w-full py-4 text-sm flex items-center justify-center gap-2"
                    >
                        <Zap size={16} />
                        {isExtracting ? 'EXTRACTING...' : 'CLAIM_DAILY_ENERGY'}
                    </button>
                </div>
            </div>

            {/* LEADERBOARD */}
            <div className="lg:col-span-8">
                <div className="glass-3d p-8 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-light-purple shadow-[0_0_15px_#A855F7]"></div>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter">Relay_Consensus_Feed</h2>
                        </div>
                        <span className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">HCS_TESTNET_SYNC</span>
                    </div>

                    <div className="flex-grow overflow-y-auto custom-scrollbar pr-4">
                        <div className="space-y-3">
                            {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-dark-purple/10 border border-light-purple/10 hover:border-light-purple/40 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-light-purple/5 flex items-center justify-center text-light-purple font-black shadow-inner border border-white/5">
                                            {i + 1}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm truncate w-32 md:w-48 text-white/90">{entry.player}</span>
                                            <span className="text-[8px] opacity-20 font-mono">SIG: {entry.proofHash.substring(0, 16)}...</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-light-purple drop-shadow-sm">{entry.score}</div>
                                        <div className="text-[8px] opacity-30 uppercase">{new Date(entry.timestamp).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-64 flex flex-col items-center justify-center opacity-10 uppercase tracking-[0.5em] font-black">
                                    Scanning_Network...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TerminalUI;
