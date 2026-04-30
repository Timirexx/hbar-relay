import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Zap, Clock, ShieldCheck, Activity } from 'lucide-react';

const TerminalUI = ({ 
    score, 
    onStart, 
    onClaimStars, 
    connected, 
    isPaying, 
    leaderboard = [],
    starCount = 0
}) => {
    const [cooldown, setCooldown] = useState(0);
    const [isExtracting, setIsExtracting] = useState(false);

    useEffect(() => {
        const lastClaim = localStorage.getItem('last_star_claim');
        if (lastClaim) {
            const diff = Date.now() - parseInt(lastClaim);
            const remaining = Math.max(0, 24 * 60 * 60 * 1000 - diff);
            setCooldown(remaining);
        }
    }, []);

    const handleAction = async (action) => {
        if (action === 'claim') {
            setIsExtracting(true);
            await onClaimStars();
            setTimeout(() => setIsExtracting(false), 2000);
        } else {
            await onStart();
        }
    };

    const formatCooldown = (ms) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}H ${minutes}M`;
    };

    const pulseColumns = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: `${i * 8.3}%`,
        delay: `${Math.random() * 1}s`,
    })), []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 relative z-20">
            {/* ACTION PANEL */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="brutalist-card border-electric-lavender shadow-[8px_8px_0px_#A855F7]">
                    <div className="text-electric-lavender font-bold text-sm tracking-widest mb-6 flex items-center gap-2">
                        <Zap size={14} className="animate-pulse" /> VIOLET_UPLINK
                    </div>
                    
                    <button 
                        onClick={() => handleAction('start')}
                        disabled={!connected || isPaying}
                        className="w-full btn-mechanical bg-electric-lavender text-cyber-indigo py-6 text-2xl font-black italic tracking-tighter mb-4"
                    >
                        {isPaying ? 'SYNCING...' : 'INIT_RELAY'}
                    </button>
                    
                    <div className="text-[10px] text-soft-lilac/40 font-mono mt-2 flex justify-between uppercase">
                        <span>FEE: 1000 tinybars</span>
                        <span>LINK: ENCRYPTED</span>
                    </div>
                </div>

                {/* STAR FORGE */}
                <div className="brutalist-card border-electric-lavender overflow-hidden relative">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <div className="text-soft-lilac font-bold text-xs uppercase opacity-50 mb-1">Energy_Vault</div>
                            <div className="text-4xl font-black font-mono tracking-tighter text-soft-lilac drop-shadow-[0_0_10px_#C084FC]">
                                {starCount.toString().padStart(5, '0')}
                            </div>
                        </div>
                        <Activity size={24} className="text-neon-violet animate-pulse" />
                    </div>

                    <button 
                        onClick={() => handleAction('claim')}
                        disabled={!connected || cooldown > 0 || isExtracting}
                        className="w-full btn-mechanical bg-soft-lilac text-cyber-indigo py-3 text-sm flex items-center justify-center gap-2 relative overflow-hidden"
                    >
                        {isExtracting && (
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                {pulseColumns.map(col => (
                                    <div key={col.id} className="absolute top-0 bottom-0 w-1 bg-neon-violet/40 blur-sm animate-[matrix_1s_steps(10)_infinite]" style={{ left: col.left, animationDelay: col.delay }} />
                                ))}
                            </div>
                        )}
                        <span className="relative z-10">{isExtracting ? 'PULSING...' : cooldown > 0 ? `LOCKED: ${formatCooldown(cooldown)}` : 'EXTRACT_ENERGY'}</span>
                    </button>
                </div>
            </div>

            {/* CONSENSUS FEED */}
            <div className="lg:col-span-8">
                <div className="brutalist-card border-electric-lavender h-full flex flex-col shadow-[8px_8px_0px_#A855F7]">
                    <div className="flex justify-between items-center mb-4 border-b-2 border-electric-lavender/20 pb-2">
                        <div className="text-electric-lavender font-bold text-sm flex items-center gap-2 uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-neon-violet animate-pulse shadow-[0_0_8px_#A855F7]" /> 
                            Violet_Consensus_Stream
                        </div>
                        <div className="text-[10px] opacity-30 font-mono">NODE: VIOLET_TESTNET</div>
                    </div>

                    <div className="terminal-feed flex-grow h-[300px] custom-scrollbar border-electric-lavender/30">
                        <div className="space-y-1">
                            {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 text-electric-lavender/80 hover:bg-neon-violet/10 p-1 transition-colors border-b border-electric-lavender/5">
                                    <span className="col-span-2 text-neon-violet">[{new Date(entry.timestamp).toLocaleTimeString([], {hour12: false})}]</span>
                                    <span className="col-span-4 truncate opacity-60 font-bold">{entry.player}</span>
                                    <span className="col-span-2 font-black text-soft-lilac text-right">{entry.score}</span>
                                    <span className="col-span-4 truncate opacity-30 text-[8px] font-mono ml-4">PROOF:{entry.proofHash}</span>
                                </div>
                            )) : (
                                <div className="animate-pulse text-electric-lavender/20 uppercase tracking-[0.5em] text-center mt-20">
                                    Intercepting_Violet_Packets...
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
