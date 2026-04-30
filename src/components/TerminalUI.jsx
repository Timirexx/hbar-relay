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

    const handleExtract = async () => {
        setIsExtracting(true);
        await onClaimStars();
        setTimeout(() => setIsExtracting(false), 2000);
    };

    const formatCooldown = (ms) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}H ${minutes}M`;
    };

    // Matrix characters for the "Extract Data" animation
    const matrixColumns = useMemo(() => Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        left: `${i * 10}%`,
        delay: `${Math.random() * 2}s`,
        chars: Array.from({ length: 8 }).map(() => String.fromCharCode(0x30A0 + Math.random() * 96)).join('')
    })), []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 relative z-20">
            {/* ACTION PANEL (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="brutalist-card bg-black border-white shadow-[8px_8px_0px_#FF5F1F]">
                    <div className="text-signal-orange font-bold text-sm tracking-widest mb-6 flex items-center gap-2">
                        <Zap size={14} className="animate-pulse" /> START_PROCEDURE
                    </div>
                    
                    <button 
                        onClick={onStart}
                        disabled={!connected || isPaying}
                        className="w-full btn-mechanical bg-signal-orange text-black py-6 text-2xl font-black italic tracking-tighter mb-4"
                    >
                        {isPaying ? 'ENCRYPTING...' : 'RELAY_SIGNAL'}
                    </button>
                    
                    <div className="text-[10px] text-white/40 font-mono mt-2 flex justify-between uppercase">
                        <span>ENTRY_FEE: 1000 tinybars</span>
                        <span>NET_STATUS: STABLE</span>
                    </div>
                </div>

                {/* STAR FORGE (REWARDS) */}
                <div className="brutalist-card overflow-hidden relative">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <div className="text-white font-bold text-xs uppercase opacity-50 mb-1">Star_Vault</div>
                            <div className="text-4xl font-black font-mono tracking-tighter">
                                {starCount.toString().padStart(5, '0')}
                            </div>
                        </div>
                        <Activity size={24} className="text-signal-orange animate-pulse" />
                    </div>

                    <button 
                        onClick={handleExtract}
                        disabled={!connected || cooldown > 0 || isExtracting}
                        className="w-full btn-mechanical bg-white text-black py-3 text-sm flex items-center justify-center gap-2 relative overflow-hidden"
                    >
                        {isExtracting && (
                            <div className="matrix-layer">
                                {matrixColumns.map(col => (
                                    <div key={col.id} className="matrix-char" style={{ left: col.left, animationDelay: col.delay }}>
                                        {col.chars}
                                    </div>
                                ))}
                            </div>
                        )}
                        <span className="relative z-10">{isExtracting ? 'EXTRACTING...' : cooldown > 0 ? `LOCKED: ${formatCooldown(cooldown)}` : 'EXTRACT_DATA'}</span>
                    </button>
                </div>
            </div>

            {/* CONSENSUS FEED (8 cols) */}
            <div className="lg:col-span-8">
                <div className="brutalist-card h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b-2 border-white/10 pb-2">
                        <div className="text-white font-bold text-sm flex items-center gap-2 uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-signal-orange animate-[pulse-fast_0.5s_steps(2)_infinite]" /> 
                            Live_Consensus_Feed
                        </div>
                        <div className="text-[10px] opacity-30 font-mono">MIRROR_NODE: TESTNET</div>
                    </div>

                    <div className="terminal-feed flex-grow h-[300px] custom-scrollbar">
                        <div className="space-y-1">
                            {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 text-white/80 hover:bg-white/5 p-1 transition-colors">
                                    <span className="col-span-2 text-signal-orange">[{new Date(entry.timestamp).toLocaleTimeString([], {hour12: false})}]</span>
                                    <span className="col-span-4 truncate opacity-60">{entry.player}</span>
                                    <span className="col-span-2 font-bold text-white text-right">{entry.score} pts</span>
                                    <span className="col-span-4 truncate opacity-30 text-[8px] font-mono ml-4">HASH:{entry.proofHash}</span>
                                </div>
                            )) : (
                                <div className="animate-pulse text-white/20 uppercase tracking-[0.5em] text-center mt-20">
                                    Scanning_Network_Packets...
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
