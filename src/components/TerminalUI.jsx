import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Clock, ShieldCheck } from 'lucide-react';

const TerminalUI = ({ 
    score, 
    onStart, 
    onClaimStars, 
    connected, 
    isPaying, 
    leaderboard = [] 
}) => {
    const [cooldown, setCooldown] = useState(0);

    // Simulated 24h cooldown check
    useEffect(() => {
        const lastClaim = localStorage.getItem('last_star_claim');
        if (lastClaim) {
            const diff = Date.now() - parseInt(lastClaim);
            const remaining = Math.max(0, 24 * 60 * 60 * 1000 - diff);
            setCooldown(remaining);
        }
    }, []);

    const formatCooldown = (ms) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}H ${minutes}M`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Action Panel */}
            <div className="brutalist-card md:col-span-1 flex flex-col gap-4">
                <div className="text-signal-orange font-bold text-xl flex items-center gap-2">
                    <Zap size={20} /> MISSION CONTROL
                </div>
                
                <div className="space-y-4">
                    <button 
                        onClick={onStart}
                        disabled={!connected || isPaying}
                        className="w-full brutalist-button bg-signal-orange text-black py-4 text-xl"
                    >
                        {isPaying ? 'PAYING...' : 'START RUN [1000 tH]'}
                    </button>

                    <button 
                        onClick={onClaimStars}
                        disabled={!connected || cooldown > 0}
                        className="w-full brutalist-button bg-white text-black py-2 text-sm flex items-center justify-center gap-2"
                    >
                        <Zap size={16} /> 
                        {cooldown > 0 ? `LOCKED: ${formatCooldown(cooldown)}` : 'CLAIM DAILY 50 STARS'}
                    </button>
                </div>

                <div className="mt-auto pt-4 border-t-2 border-white/20 text-[10px] opacity-50 font-mono">
                    HBAR_RELAY_v1.0.4_TESTNET
                    <br />
                    PROOFS: SHA-256_ACTIVE
                </div>
            </div>

            {/* Stats & Info */}
            <div className="brutalist-card md:col-span-1">
                <div className="text-white font-bold text-xl flex items-center gap-2 mb-4">
                    <ShieldCheck size={20} /> NETWORK STATS
                </div>
                <div className="space-y-2 font-mono text-sm">
                    <div className="flex justify-between">
                        <span>LATEST SCORE:</span>
                        <span className="text-signal-orange">{score}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>RELAY STATUS:</span>
                        <span className={connected ? "text-green-500" : "text-red-500"}>
                            {connected ? "ENCRYPTED" : "OFFLINE"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>HCS TOPIC:</span>
                        <span className="truncate ml-4">{import.meta.env.VITE_HCS_TOPIC_ID}</span>
                    </div>
                </div>
                
                <div className="mt-6 p-2 border-2 border-white/10 bg-white/5 text-[10px]">
                    SYSTEM_LOG: <br />
                    {connected ? "> WALLET_CONNECTED_HEDERA" : "> WAITING_FOR_PAIRING"} <br />
                    {isPaying ? "> TRANSACTION_IN_FLIGHT..." : "> READY_FOR_RELAY"}
                </div>
            </div>

            {/* Leaderboard */}
            <div className="brutalist-card md:col-span-1 overflow-hidden">
                <div className="text-white font-bold text-xl flex items-center gap-2 mb-4">
                    <Trophy size={20} /> LEADERBOARD (HCS)
                </div>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                    {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                        <div key={i} className="flex justify-between text-xs font-mono border-b border-white/10 pb-1">
                            <span className="truncate w-24">{entry.player}</span>
                            <span className="text-signal-orange">{entry.score}</span>
                        </div>
                    )) : (
                        <div className="text-white/30 text-xs italic">SCANNING MIRROR NODE...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TerminalUI;
