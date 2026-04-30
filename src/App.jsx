import React, { useState, useEffect, useCallback } from 'react';
import { useHedera } from './hooks/useHedera';
import { useGameLoop } from './hooks/useGameLoop';
import GameCanvas from './components/GameCanvas';
import TerminalUI from './components/TerminalUI';
import WalletConnect from './components/WalletConnect';
import { Zap } from 'lucide-react';

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

    // Leaderboard refresh
    const refreshLeaderboard = useCallback(async () => {
        const data = await fetchLeaderboard();
        setLeaderboard(data);
    }, [fetchLeaderboard]);

    useEffect(() => {
        refreshLeaderboard();
        const interval = setInterval(refreshLeaderboard, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, [refreshLeaderboard]);

    const handleGameOver = useCallback((finalScore) => {
        setIsGameOver(true);
        // Report to HCS
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
            alert("Payment Required to Relay: " + error.message);
        } finally {
            setIsPaying(false);
        }
    };

    const handleClaim = async () => {
        try {
            const success = await claimDailyStars();
            if (success) {
                localStorage.setItem('last_star_claim', Date.now().toString());
                alert("50 STARS CLAIMED ON-CHAIN");
            }
        } catch (error) {
            alert(error.message);
        }
    };

    // Game loop tick handled by Canvas, but we could trigger physics here if we wanted
    // However, GameCanvas uses requestAnimationFrame with gameState.current
    useEffect(() => {
        let frameId;
        const tick = () => {
            update();
            frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [update]);

    // Keyboard Listener
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
        <div className="min-h-screen bg-black text-white p-4 md:p-8 font-mono relative overflow-hidden">
            {/* Background Texture */}
            <div className="fixed inset-0 bg-halftone opacity-5 pointer-events-none"></div>

            {/* Header */}
            <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-signal-orange p-3 border-4 border-white rotate-3">
                        <Zap size={32} className="text-black" fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter">
                            HBAR RELAY
                        </h1>
                        <p className="text-xs text-signal-orange font-bold uppercase tracking-widest">
                            Signal Runner Protocol // TestNet_v1
                        </p>
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

            {/* Main Game Area */}
            <main className="max-w-6xl mx-auto relative z-10">
                <GameCanvas 
                    gameState={gameState} 
                    onFlip={flipGravity} 
                />

                <TerminalUI 
                    score={gameScore}
                    onStart={handleStartGame}
                    onClaimStars={handleClaim}
                    connected={connected}
                    isPaying={isPaying}
                    leaderboard={leaderboard}
                />
            </main>

            {/* Footer Decals */}
            <footer className="max-w-6xl mx-auto mt-12 flex justify-between items-end opacity-20 text-[10px] uppercase font-bold tracking-widest">
                <div>[ SCANNING_SECTOR_00 ]</div>
                <div className="text-right">
                    PROPERTY OF THE MONOLITH SLAB<br />
                    UNAUTHORIZED ACCESS WILL BE RELAYED
                </div>
            </footer>
        </div>
    );
}

export default App;
