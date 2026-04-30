import React, { useRef, useEffect, useCallback, useState } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const ACCENT_COLOR = '#FF5F1F'; // Signal Orange

const GameCanvas = ({ gameState, onFlip }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const [binaryString, setBinaryString] = useState("10101010110");

    // Binary update for HUD
    useEffect(() => {
        const interval = setInterval(() => {
            setBinaryString(Math.random().toString(2).substring(2, 12));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const drawSlab = (ctx, x, y, width, height) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        // Hatching (Rebar)
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        for (let i = -height; i < width + height; i += 10) {
            ctx.moveTo(x + i, y);
            ctx.lineTo(x + i + height, y + height);
        }
        ctx.stroke();
        ctx.restore();
    };

    const drawHUD = (ctx, state) => {
        const padding = 15;
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textBaseline = 'top';
        ctx.fillStyle = ACCENT_COLOR;

        // TOP-LEFT: SYSTEM_STATUS
        ctx.textAlign = 'left';
        ctx.fillText(`SYSTEM_STATUS: ${state.isActive ? 'ACTIVE' : 'IDLE'}`, padding, padding);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`BIN_STR: ${binaryString}`, padding, padding + 12);

        // TOP-RIGHT: GAS_FEE
        ctx.textAlign = 'right';
        ctx.fillStyle = ACCENT_COLOR;
        ctx.fillText(`GAS_FEE: 1000 tHBAR`, CANVAS_WIDTH - padding, padding);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`NET: HEDERA_TESTNET`, CANVAS_WIDTH - padding, padding + 12);

        // BOTTOM-LEFT: RELAY_ID
        ctx.textAlign = 'left';
        ctx.fillStyle = ACCENT_COLOR;
        ctx.fillText(`RELAY_ID: ${import.meta.env.VITE_HCS_TOPIC_ID}`, padding, CANVAS_HEIGHT - padding - 10);

        // BOTTOM-RIGHT: ALTITUDE_LOCK
        ctx.textAlign = 'right';
        ctx.fillStyle = ACCENT_COLOR;
        ctx.fillText(`ALTITUDE_LOCK: ${state.gravityDir > 0 ? 'GROUND' : 'CEILING'}`, CANVAS_WIDTH - padding, CANVAS_HEIGHT - padding - 10);
    };

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const state = gameState.current;

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Grid Background (Subtle)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < CANVAS_WIDTH; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }

        // Draw Obstacles
        state.obstacles.forEach(obs => {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            ctx.strokeStyle = ACCENT_COLOR;
            ctx.lineWidth = 2;
            ctx.strokeRect(obs.x + 4, obs.y + 4, obs.width - 8, obs.height - 8);
        });

        // Draw Player
        const runnerX = 100;
        drawSlab(ctx, runnerX, state.runnerY, 60, 20);
        
        // Runner Silhouette
        ctx.fillStyle = ACCENT_COLOR;
        ctx.fillRect(runnerX + 20, state.runnerY - 30, 20, 30);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(runnerX + 20, state.runnerY - 30, 20, 30);

        // Draw HUD
        drawHUD(ctx, state);

        // Score Overlay
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.font = 'black 48px "JetBrains Mono", monospace';
        ctx.fillText(state.score.toString().padStart(4, '0'), CANVAS_WIDTH / 2, 40);

        if (!state.isActive && state.frame > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = ACCENT_COLOR;
            ctx.textAlign = 'center';
            ctx.font = 'bold 32px "JetBrains Mono", monospace';
            ctx.fillText('SIGNAL LOST', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.font = '12px "JetBrains Mono", monospace';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('ENCRYPTED PACKET TRANSMISSION REQUIRED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
        }

        requestRef.current = requestAnimationFrame(render);
    }, [gameState, binaryString]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        requestRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(requestRef.current);
    }, [render]);

    return (
        <div className="relative w-full aspect-video border-4 border-white bg-black overflow-hidden cursor-pointer group" 
             onClick={onFlip}>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%' }}
                className="block"
            />
            {/* Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
        </div>
    );
};

export default GameCanvas;
