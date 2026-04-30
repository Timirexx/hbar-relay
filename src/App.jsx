import React, { useState, useEffect, useCallback } from 'react';
import { useHedera } from './hooks/useHedera';
import { useGameLoop } from './hooks/useGameLoop';
import GameCanvas from './components/GameCanvas';
import TerminalUI from './components/TerminalUI';
import WalletConnect from './components/WalletConnect';
import { Zap, Activity, Cpu, Shield } from 'lucide-react';

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
    const [isBooting, setIsBooting] = useState(true);
    const [bootLogs, setBootLogs] = useState([]);

    // Boot Sequence Simulation
    useEffect(() => {
        const logs = [
            "> INITIALIZING_VIOLET_CORE...",
            "> SYNCING_HEDERA_NETWORK_TESTNET...",
            "> LOADING_MIRROR_NODE_INTERFACE...",
            "> CHECKING_WALLET_PAIRING_STATUS...",
            "> READY_FOR_UPLINK."
        ];
        let i = 0;
        const interval = setInterval(() => {
            if (i < logs.length) {
                setBootLogs(prev => [...prev, logs[i]]);
                i++;
            } else {
                clearInterval(interval);
                setTimeout(() => setIsBooting(false), 800);
            }
        }, 400);
        return () => clearInterval(interval);
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

    if (isBooting) {
        return (
            <div className="boot-screen crt-overlay">
                <div className="max-w-md mx-auto mt-20 space-y-2">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 border-2 border-electric-lavender flex items-center justify-center animate-spin">
                            <Cpu size={16} />
                        </div>
                        <span className="font-black italic text-xl">HBAR_RELAY_BOOT_v1.2.4</span>
                    </div>
                    {bootLogs.map((log, idx) => (
                        <div key={idx} className="opacity-80">
                            {log}
                        </div>
                    ))}
                    <div className="w-full h-1 bg-white/10 mt-4 overflow-hidden">
                        <div className="h-full bg-electric-lavender animate-[data-scroll_2s_linear_infinite]" style={{width: '60%'}}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cyber-indigo text-soft-lilac p-4 md:p-8 font-mono relative crt-overlay overflow-hidden bg-data-stream">
            {/* Grain Texture Layer */}
            <div className="fixed inset-0 bg-grain pointer-events-none z-[100]"></div>
            
            {/* Header */}
            <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 relative z-20">
                <div className="flex items-center gap-6 group">
                    <div className="bg-electric-lavender p-4 border-4 border-white shadow-[6px_6px_0px_#A855F7] -rotate-1 relative transition-transform group-hover:rotate-0">
                        <Zap size={40} className="text-cyber-indigo" fill="currentColor" />
                        <div className="hardware-corner hardware-corner-tl !-top-2 !-left-2"></div>
                        <div className="hardware-corner hardware-corner-br !-bottom-2 !-right-2"></div>
                    </div>
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-white drop-shadow-[0_0_15px_#A855F7] text-glitch">
                            HBAR_RELAY
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="led-blink"></div>
                            <p className="text-[10px] text-electric-lavender opacity-60 font-mono tracking-[0.3em] uppercase">
                                Signal_Runner_Protocol // SECURE_NODE: {accountId || "DISCONNECTED"}
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
                <div className="relative group brutalist-card p-0 overflow-hidden border-none shadow-none">
                    {/* Hardware Frame Brackets */}
                    <div className="hardware-corner hardware-corner-tl"></div>
                    <div className="hardware-corner hardware-corner-tr"></div>
                    <div className="hardware-corner hardware-corner-bl"></div>
                    <div className="hardware-corner hardware-corner-br"></div>
                    
                    {/* Industrial Labels */}
                    <div className="absolute top-2 left-10 text-[8px] text-electric-lavender opacity-50 uppercase flex items-center gap-2">
                        <Shield size={10} /> Data_Shield_Active
                    </div>
                    <div className="absolute bottom-2 right-10 text-[8px] text-electric-lavender opacity-50 uppercase">
                        Relay_Slab_Unit: 0x88
                    </div>

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

            <footer className="max-w-7xl mx-auto mt-20 flex justify-between items-end opacity-20 text-[9px] uppercase font-mono tracking-widest border-t-2 border-electric-lavender/30 pt-4 text-electric-lavender">
                <div className="flex items-center gap-4">
                    <span>[ SCAN_00 ]</span>
                    <span>[ SYNC_ENCRYPTED ]</span>
                </div>
                <div className="text-right">
                    VIOLET_RELAY_INTERFACE_SYSTEM<br />
                    DATA_EXTRACT_PROTOCOL_v1.2.4_READY
                </div>
            </footer>
        </div>
    );
}

export default App;
