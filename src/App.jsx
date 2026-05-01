import React, { useState, useEffect, useCallback } from 'react';
import { useHedera } from './hooks/useHedera';
import { useGameLoop } from './hooks/useGameLoop';
import GameCanvas from './components/GameCanvas';
import TerminalUI from './components/TerminalUI';
import WalletConnectNode from './components/WalletConnectNode';
import LeaderboardModal from './components/LeaderboardModal';
import WalletChoiceModal from './components/WalletChoiceModal';
import { Box } from 'lucide-react';
import { useDualWallet } from './hooks/useDualWallet';
import { Web3Provider } from './providers/Web3Provider';

function AppContent() {
    const { fetchLeaderboard } = useHedera();
    const { 
        isConnected, 
        walletType, 
        payEntryFee, 
        submitScore, 
        claimStars,
        openWalletModal,
        connectNative
    } = useDualWallet();

    const [gameScore, setGameScore] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [starCount, setStarCount] = useState(0);
    const [isBooting, setIsBooting] = useState(true);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
    const [isPaying, setIsPaying] = useState(false);

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
        if (data) setLeaderboard(data);
    }, [fetchLeaderboard]);

    useEffect(() => {
        refreshLeaderboard();
        const interval = setInterval(refreshLeaderboard, 15000);
        return () => clearInterval(interval);
    }, [refreshLeaderboard]);

    const handleGameOver = useCallback(async (finalScore) => {
        if (finalScore > 0) {
            await submitScore(finalScore);
            refreshLeaderboard();
        }
    }, [submitScore, refreshLeaderboard]);

    const handleScoreUpdate = useCallback((score) => setGameScore(score), []);

    const { update, flipGravity, resetGame, gameState } = useGameLoop(handleGameOver, handleScoreUpdate);

    const handleStartGame = async () => {
        if (!isConnected) {
            setIsChoiceModalOpen(true);
            return;
        }

        try {
            setIsPaying(true);
            await payEntryFee();
            setGameScore(0);
            resetGame();
        } catch (error) {
            console.error("Payment failed:", error);
            alert("Entry Fee Transaction Required to Relay.");
        } finally {
            setIsPaying(false);
        }
    };

    const handleClaim = async () => {
        try {
            const success = await claimStars();
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
            <div className="fixed inset-0 bg-[#000000] flex items-center justify-center z-[10000]">
                <div className="text-[#C084FC] font-black tracking-[0.5em] animate-pulse uppercase">
                    Initializing_Uplink_v3.1
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#000000] text-white p-4 md:p-8 font-sans relative overflow-hidden">
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[#2D1B4E]/20 blur-[150px] rounded-full -z-10"></div>
            
            <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-8 relative z-50">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#C084FC] flex items-center justify-center shadow-[0_0_30px_rgba(192,132,252,0.5)]">
                        <Box size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-white">HBAR_RELAY</h1>
                        <p className="text-[10px] text-[#C084FC] font-bold tracking-widest uppercase opacity-60">TRANSACTIONAL_UPLINK_v3.1</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsLeaderboardOpen(true)}
                        className="bg-[#2D1B4E]/40 border border-[#C084FC]/20 px-6 py-3 rounded-2xl text-xs font-bold hover:border-[#C084FC]/60 transition-all"
                    >
                        🏆 LEADERBOARD
                    </button>
                    <WalletConnectNode onOpenChoice={() => setIsChoiceModalOpen(true)} />
                </div>
            </header>

            <main className="max-w-7xl mx-auto relative z-10">
                <GameCanvas gameState={gameState} onFlip={handleCanvasClick} />
                <TerminalUI 
                    score={gameScore}
                    onStart={handleStartGame}
                    onClaimStars={handleClaim}
                    starCount={starCount}
                    leaderboard={leaderboard}
                    connected={isConnected}
                    isPaying={isPaying}
                />
            </main>

            <LeaderboardModal 
                isOpen={isLeaderboardOpen} 
                onClose={() => setIsLeaderboardOpen(false)} 
                leaderboard={leaderboard}
            />

            <WalletChoiceModal 
                isOpen={isChoiceModalOpen}
                onClose={() => setIsChoiceModalOpen(false)}
                onSelectEVM={() => openWalletModal()}
                onSelectNative={connectNative}
            />
        </div>
    );
}

export default function App() {
    return (
        <Web3Provider>
            <AppContent />
        </Web3Provider>
    );
}
