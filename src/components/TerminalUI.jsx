import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Zap, Clock, ShieldCheck, Activity, Terminal as TerminalIcon, Cpu } from 'lucide-react';

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
                <div className="brutalist-card border-electric-lavender shadow-[8px_8px_0px_#A855F7] relative">
                    <div className="hardware-corner hardware-corner-tl !w-2 !h-2"></div>
                    <div className="hardware-corner hardware-corner-tr !w-2 !h-2"></div>
                    
                    <div className="text-electric-lavender font-bold text-xs tracking-widest mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 uppercase">
                            <TerminalIcon size={14} /> Mission_Control
                        </div>
                        <div className="led-blink"></div>
                    </div>
                    
                    <button 
                        onClick={() => handleAction('start')}
                        disabled={!connected || isPaying}
                        className="w-full btn-mechanical bg-electric-lavender text-cyber-indigo py-6 text-2xl font-black italic tracking-tighter mb-4"
                    >
                        {isPaying ? 'SYNCING...' : 'INIT_RELAY'}
                    </button>
                    
                    <div className="text-[9px] text-soft-lilac/40 font-mono mt-2 flex justify-between uppercase border-t border-white/10 pt-2">
                        <span>GAS: 1000 tHBAR</span>
                        <span>STATUS: {isPaying ? "BUSY" : "READY"}</span>
                    </div>
                </div>

                {/* STAR FORGE */}
                <div className="brutalist-card border-electric-lavender overflow-hidden relative group">
                    <div className="hardware-corner hardware-corner-bl !w-2 !h-2"></div>
                    <div className="hardware-corner hardware-corner-br !w-2 !h-2"></div>

                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <div className="text-soft-lilac font-bold text-[10px] uppercase opacity-50 mb-1 flex items-center gap-1">
                                <Cpu size={10} /> Extract_Engine
                            </div>
                            <div className="text-5xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_15px_#C084FC]">
                                {starCount.toString().padStart(5, '0')}
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Activity size={24} className="text-neon-violet animate-pulse" />
                            <span className="text-[8px] opacity-30">PULSE_OK</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => handleAction('claim')}
                        disabled={!connected || cooldown > 0 || isExtracting}
                        className="w-full btn-mechanical bg-soft-lilac text-cyber-indigo py-3 text-sm flex items-center justify-center gap-2 relative overflow-hidden font-black"
                    >
                        {isExtracting && (
                            <div className="absolute inset-0 overflow-hidden pointer-events-none bg-neon-violet/20">
                                {pulseColumns.map(col => (
                                    <div key={col.id} className="absolute top-0 bottom-0 w-1 bg-white blur-sm animate-[matrix_1s_steps(10)_infinite]" style={{ left: col.left, animationDelay: col.delay }} />
                                ))}
                            </div>
                        )}
                        <span className="relative z-10">{isExtracting ? 'PULSING...' : cooldown > 0 ? `LOCKED: ${formatCooldown(cooldown)}` : 'EXTRACT_ENERGY'}</span>
                    </button>
                </div>
            </div>

            {/* CONSENSUS FEED */}
            <div className="lg:col-span-8">
                <div className="brutalist-card border-electric-lavender h-full flex flex-col shadow-[8px_8px_0px_#A855F7] relative">
                    <div className="hardware-corner hardware-corner-tl !w-3 !h-3"></div>
                    <div className="hardware-corner hardware-corner-br !w-3 !h-3"></div>

                    <div className="flex justify-between items-center mb-4 border-b-2 border-electric-lavender/20 pb-2">
                        <div className="text-electric-lavender font-bold text-xs flex items-center gap-3 uppercase tracking-widest">
                            <Activity size={16} className="animate-bounce" /> 
                            Violet_Consensus_Stream
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] opacity-30 font-mono">MIRROR_LINK: ACTIVE</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_green]"></div>
                        </div>
                    </div>

                    <div className="terminal-feed flex-grow h-[320px] custom-scrollbar border-electric-lavender/30 relative">
                        {/* Overlay scanline specific to terminal */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(192,132,252,0.05)_1px,transparent_1px)] bg-[length:100%_2px]"></div>
                        
                        <div className="space-y-1 relative z-10">
                            {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 text-electric-lavender/90 hover:bg-neon-violet/15 p-2 transition-colors border-b border-white/5 group">
                                    <span className="col-span-2 text-neon-violet font-bold text-[9px]">[{new Date(entry.timestamp).toLocaleTimeString([], {hour12: false})}]</span>
                                    <span className="col-span-4 truncate opacity-60 font-bold group-hover:opacity-100">{entry.player}</span>
                                    <span className="col-span-2 font-black text-white text-right">{entry.score}</span>
                                    <span className="col-span-4 truncate opacity-20 text-[7px] font-mono ml-4 group-hover:opacity-40 uppercase tracking-tighter">SIG:{entry.proofHash}</span>
                                </div>
                            )) : (
                                <div className="animate-pulse text-electric-lavender/10 uppercase tracking-[1em] text-center mt-24 text-xs font-black">
                                    Intercepting_Packets...
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
