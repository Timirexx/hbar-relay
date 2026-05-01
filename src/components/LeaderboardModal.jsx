import React from 'react';
import { X, Trophy, Globe, Zap, MapPin } from 'lucide-react';

const LeaderboardModal = ({ isOpen, onClose, accountId, leaderboard = [] }) => {
    if (!isOpen) return null;

    // Mock data for display
    const displayData = Array.from({ length: 10 }).map((_, i) => ({
        rank: i + 1,
        wallet: i % 2 === 0 ? `0x${Math.random().toString(16).slice(2, 10)}...` : `0.0.${Math.floor(Math.random() * 100000)}`,
        relayed: (Math.random() * 5).toFixed(1) + "M",
        sessions: Math.floor(Math.random() * 1000),
        node: "Hub-Alpha"
    }));

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop Dimmer */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="relative w-full max-w-4xl bg-gradient-to-br from-[#2D1B4E]/95 to-[#140A23]/98 backdrop-blur-md rounded-[32px] border-t border-l border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
                
                {/* Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-2 bg-light-purple blur-2xl opacity-30"></div>

                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white/60 hover:text-white border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] transition-all hover:scale-110 active:scale-95"
                >
                    <X size={20} />
                </button>

                <div className="p-10">
                    <div className="flex items-center gap-4 mb-8">
                        <Trophy className="text-light-purple drop-shadow-[0_0_8px_#A855F7]" size={32} />
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(168,85,247,0.5)]">
                            Global_HBAR_Relay_Leaderboard
                        </h2>
                    </div>

                    {/* Table Headers */}
                    <div className="grid grid-cols-12 gap-4 px-6 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-light-purple opacity-40">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-4">Wallet_ID</div>
                        <div className="col-span-3 text-right">Relayed_HBAR</div>
                        <div className="col-span-2 text-right">Sessions</div>
                        <div className="col-span-2 text-right">Node</div>
                    </div>

                    {/* Rows */}
                    <div className="space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar pr-4">
                        {displayData.map((row, i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 p-4 rounded-xl bg-black/20 shadow-carved hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(168,85,247,0.1)] transition-all group">
                                <div className="col-span-1 font-black text-white/40 group-hover:text-light-purple">#{row.rank}</div>
                                <div className="col-span-4 font-bold text-sm truncate">{row.wallet}</div>
                                <div className="col-span-3 text-right font-black text-white">{row.relayed}</div>
                                <div className="col-span-2 text-right opacity-40">{row.sessions}</div>
                                <div className="col-span-2 text-right text-[10px] font-bold opacity-60">{row.node}</div>
                            </div>
                        ))}

                        {/* PLAYER HIGHLIGHT (RANK 42) */}
                        <div className="grid grid-cols-12 gap-4 p-5 rounded-xl bg-[#2D1B4E] glow-border-purple translate-z-10 shadow-xl group">
                            <div className="col-span-1 font-black text-white">#42</div>
                            <div className="col-span-4 font-black text-white flex items-center gap-2">
                                YOU [{accountId || '0.0.730101'}]
                            </div>
                            <div className="col-span-3 text-right font-black text-white">1.2M</div>
                            <div className="col-span-2 text-right font-black text-white">842</div>
                            <div className="col-span-2 text-right font-black text-white">LOCAL_NODE</div>
                        </div>
                    </div>
                </div>

                {/* Footer Decor */}
                <div className="bg-black/20 p-4 text-[8px] font-bold text-center opacity-20 tracking-[1em] uppercase">
                    Consensus_Data_Stream_Active
                </div>
            </div>
        </div>
    );
};

export default LeaderboardModal;
