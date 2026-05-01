import React, { useState, useEffect, useCallback } from 'react';
import { useHedera } from './hooks/useHedera';
import { useGameLoop } from './hooks/useGameLoop';
import GameCanvas from './components/GameCanvas';
import TerminalUI from './components/TerminalUI';
import WalletConnectNode from './components/WalletConnectNode';
import LeaderboardModal from './components/LeaderboardModal';
import { Box, Zap } from 'lucide-react';

// Reown AppKit / Wagmi Imports
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { hederaTestnet } from '@wagmi/core/chains';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Setup QueryClient
const queryClient = new QueryClient();

// 2. Setup Project ID
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'f915729e246835150827299a941584c0';

// 3. Setup Wagmi Adapter
const networks = [hederaTestnet];
const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks
});

// 4. Create AppKit
createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    features: {
        analytics: true
    },
    themeMode: 'dark',
    themeVariables: {
        '--w3m-accent': '#A855F7',
        '--w3m-border-radius-master': '24px'
    }
});

function AppContent() {
    const { 
        initiateEntryFee, 
        reportScore, 
        claimDailyStars,
        fetchLeaderboard 
    } = useHedera();

    const [gameScore, setGameScore] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isPaying, setIsPaying] = useState(false);
    const [starCount, setStarCount] = useState(0);
    const [isBooting, setIsBooting] = useState(true);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsBooting(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const savedStars = localStorage.getItem('star_count') || "0";
        setStarCount(parseInt(savedStars));
    }, []);

    const refreshLeaderboard = useCallback(async () => {
        const data = await fetchLeaderboard();
        setLeaderboard(data);
    }, [fetchLeaderboard]);

    useEffect(() => {
        refreshLeaderboard();
        const interval = setInterval(refreshLeaderboard, 15000);
        return () => clearInterval(interval);
    }, [refreshLeaderboard]);

    const handleGameOver = useCallback((finalScore) => {
        if (finalScore > 0) {
            reportScore(finalScore).then(() => {
                refreshLeaderboard();
            });
        }
    }, [reportScore, refreshLeaderboard]);

    const handleScoreUpdate = useCallback((score) => {
        setGameScore(score);
    }, []);

    const { update, flipGravity, resetGame, gameState } = useGameLoop(handleGameOver, handleScoreUpdate);

    const handleStartGame = async () => {
        setGameScore(0);
        resetGame();
    };

    const handleClaim = async () => {
        try {
            const success = await claimDailyStars();
            if (success) {
                const newCount = starCount + 50;
                setStarCount(newCount);
                localStorage.setItem('star_count', newCount.toString());
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleCanvasClick = () => {
        if (!gameState.current.isActive) {
            handleStartGame();
        } else {
            flipGravity();
        }
    };

    useEffect(() => {
        let frameId;
        const tick = () => {
            update();
            frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [update]);

    if (isBooting) {
        return (
            <div className="fixed inset-0 bg-base-black flex items-center justify-center z-[500]">
                <div className="text-light-purple font-black tracking-[0.5em] animate-pulse">HBAR_RELAY_v2.1_REBOOTING...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-black text-white p-4 md:p-8 font-modern relative overflow-hidden">
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-dark-purple/20 blur-[150px] rounded-full -z-10"></div>
            
            <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-8 relative z-20">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-light-purple flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                        <Box size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-white">HBAR_RELAY</h1>
                        <p className="text-[10px] text-light-purple font-bold tracking-widest uppercase opacity-60">DUAL_WALLET_PROTOCOL_v2</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsLeaderboardOpen(true)}
                        className="bg-dark-purple/40 border border-light-purple/20 px-6 py-3 rounded-2xl text-xs font-bold hover:border-light-purple/60 transition-all"
                    >
                        🏆 LEADERBOARD
                    </button>
                    <WalletConnectNode />
                </div>
            </header>

            <main className="max-w-7xl mx-auto relative z-20">
                <GameCanvas gameState={gameState} onFlip={handleCanvasClick} />
                <TerminalUI 
                    score={gameScore}
                    onStart={handleStartGame}
                    onClaimStars={handleClaim}
                    starCount={starCount}
                    leaderboard={leaderboard}
                />
            </main>

            <LeaderboardModal 
                isOpen={isLeaderboardOpen} 
                onClose={() => setIsLeaderboardOpen(false)} 
                leaderboard={leaderboard}
            />
        </div>
    );
}

// Wrapper for Wagmi and Query Providers
export default function App() {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <AppContent />
            </QueryClientProvider>
        </WagmiProvider>
    );
}
