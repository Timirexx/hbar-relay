import React, { useState, useEffect, useCallback } from 'react';
import { useHedera } from './hooks/useHedera';
import { useGameLoop } from './hooks/useGameLoop';
import GameCanvas from './components/GameCanvas';
import TerminalUI from './components/TerminalUI';
import WalletConnect from './components/WalletConnect';
import { Zap, Activity } from 'lucide-react';

function App() {
    const { 
        connected, 
        accountId, 
        connect, 
        disconnect, 
        initiateEntryFee, 
        reportScore, 
        claimDailyStars,
        fetchLeaderboard,
        isConnecting 
    } = useHedera();

    const [gameScore, setGameScore] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isPaying, setIsPaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [starCount, setStarCount] = useState(0);

    // Initial load for star count from localStorage (simulated HTS cache)
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
        const interval = setInterval(refreshLeaderboard, 15000); // 15s refresh for higher fidelity
        return () => clearInterval(interval);
    }, [refreshLeaderboard]);

    const handleGameOver = useCallback((finalScore) => {
        setIsGameOver(true);
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
        if (!connected) return;
        setIsPaying(true);
        try {
            await initiateEntryFee();
            setIsGameOver(false);
            setGameScore(0);
            resetGame();
        } catch (error) {
            console.error("Payment failed", error);
        } finally {
            setIsPaying(false);
        }
    };

    const handleClaim = async () => {
        try {
            const success = await claimDailyStars();
            if (success) {
                const newCount = starCount + 50;
                setStarCount(newCount);
                localStorage.setItem('star_count', newCount.toString());
                localStorage.setItem('last_star_claim', Date.now().toString());
            }
        } catch (error) {
            console.error(error.message);
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

    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                flipGravity();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [flipGravity]);

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 font-mono relative crt-overlay overflow-hidden">
            {/* Grain Texture Layer */}
            <div className="fixed inset-0 bg-grain pointer-events-none z-[100]"></div>
            
            {/* Header */}
            <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 relative z-20">
                <div className="flex items-center gap-6">
                    <div className="bg-signal-orange p-4 border-4 border-white shadow-[6px_6px_0px_#FFFFFF] -rotate-2">
                        <Zap size={40} className="text-black" fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
                            HBAR_RELAY
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Activity size={14} className="text-signal-orange animate-pulse" />
                            <p className="text-[10px] text-white opacity-40 font-mono tracking-[0.3em] uppercase">
                                Signal_Runner_Protocol // v1.0.8_High_Fidelity
                            </p>
                        </div>
                    </div>
                </div>

                <WalletConnect 
                    connected={connected}
                    accountId={accountId}
                    onConnect={connect}
                    onDisconnect={disconnect}
                    isConnecting={isConnecting}
                />
            </header>

            {/* Main Area */}
            <main className="max-w-7xl mx-auto relative z-20">
                <div className="relative group">
                    {/* Industrial Frame Decor */}
                    <div className="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 border-signal-orange"></div>
                    <div className="absolute -top-4 -right-4 w-8 h-8 border-t-4 border-r-4 border-signal-orange"></div>
                    <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-4 border-l-4 border-signal-orange"></div>
                    <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-4 border-r-4 border-signal-orange"></div>

                    <GameCanvas 
                        gameState={gameState} 
                        onFlip={flipGravity} 
                    />
                </div>

                <TerminalUI 
                    score={gameScore}
                    onStart={handleStartGame}
                    onClaimStars={handleClaim}
                    connected={connected}
                    isPaying={isPaying}
                    leaderboard={leaderboard}
                    starCount={starCount}
                />
            </main>

            <footer className="max-w-7xl mx-auto mt-20 flex justify-between items-end opacity-20 text-[9px] uppercase font-mono tracking-widest border-t border-white/10 pt-4">
                <div>[ SCAN_SECTOR: 0xFF12 // MIRROR_SYNC: OK ]</div>
                <div className="text-right">
                    MONOLITH_SLAB_IND_RELAY<br />
                    TRUSTLESS_DATA_EXTRACTION_ACTIVE
                </div>
            </footer>
        </div>
    );
}

export default App;
