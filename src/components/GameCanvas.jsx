import React, { useRef, useEffect, useCallback, useState } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const ACCENT_PRIMARY = '#C084FC'; // Electric Lavender
const ACCENT_SECONDARY = '#A855F7'; // Neon Violet
const BG_COLOR = '#1E1B4B'; // Cyber Indigo

const GameCanvas = ({ gameState, onFlip }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const [binaryString, setBinaryString] = useState("10101010110");
    const glowRef = useRef(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setBinaryString(Math.random().toString(2).substring(2, 12));
            glowRef.current = (glowRef.current + 1) % 100;
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const drawSlab = (ctx, x, y, width, height) => {
        // Neon Pulse Glow
        const glowSize = 10 + Math.sin(Date.now() / 200) * 5;
        ctx.shadowBlur = glowSize;
        ctx.shadowColor = ACCENT_SECONDARY;

        // Gradient Slab
        const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, ACCENT_PRIMARY);
        gradient.addColorStop(1, ACCENT_SECONDARY);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Reset Shadow for other elements
        ctx.shadowBlur = 0;

        // Hatching
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = -height; i < width + height; i += 10) {
            ctx.moveTo(x + i, y);
            ctx.lineTo(x + i + height, y + height);
        }
        ctx.stroke();
        ctx.restore();
    };

    const drawHUD = (ctx, state) => {
        const padding = 15;
        // HUD Vibration effect based on gravity flip
        const vibX = Math.sin(Date.now() / 50) * (state.velocity !== 0 ? 1 : 0.2);
        const vibY = Math.cos(Date.now() / 50) * (state.velocity !== 0 ? 1 : 0.2);
        
        ctx.save();
        ctx.translate(vibX, vibY);

        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textBaseline = 'top';
        ctx.fillStyle = ACCENT_PRIMARY;

        ctx.textAlign = 'left';
        ctx.fillText(`SYSTEM_STATUS: ${state.isActive ? 'ONLINE' : 'STANDBY'}`, padding, padding);
        ctx.fillStyle = '#F5F3FF';
        ctx.fillText(`STREAM: ${binaryString}`, padding, padding + 12);

        ctx.textAlign = 'right';
        ctx.fillStyle = ACCENT_PRIMARY;
        ctx.fillText(`GAS: 1000 tHBAR`, CANVAS_WIDTH - padding, padding);
        ctx.fillStyle = '#F5F3FF';
        ctx.fillText(`DOMAIN: VIOLET_SECTOR`, CANVAS_WIDTH - padding, padding + 12);

        ctx.textAlign = 'left';
        ctx.fillStyle = ACCENT_SECONDARY;
        ctx.fillText(`RELAY_ID: ${import.meta.env.VITE_HCS_TOPIC_ID}`, padding, CANVAS_HEIGHT - padding - 10);

        ctx.textAlign = 'right';
        ctx.fillStyle = ACCENT_SECONDARY;
        ctx.fillText(`VECTORS: ${state.gravityDir > 0 ? 'DOWNLINK' : 'UPLINK'}`, CANVAS_WIDTH - padding, CANVAS_HEIGHT - padding - 10);
        
        ctx.restore();
    };

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const state = gameState.current;

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Cyber Grid
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
        ctx.lineWidth = 1;
        for (let x = 0; x < CANVAS_WIDTH; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
        }
        for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
        }

        // Obstacles (Neon detaling)
        state.obstacles.forEach(obs => {
            ctx.fillStyle = '#F5F3FF';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            ctx.strokeStyle = ACCENT_SECONDARY;
            ctx.lineWidth = 3;
            ctx.strokeRect(obs.x + 2, obs.y + 2, obs.width - 4, obs.height - 4);
        });

        // Player
        const runnerX = 100;
        drawSlab(ctx, runnerX, state.runnerY, 60, 20);
        
        // Runner (Lavender Glow)
        ctx.fillStyle = ACCENT_PRIMARY;
        ctx.fillRect(runnerX + 22, state.runnerY - 32, 16, 32);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(runnerX + 22, state.runnerY - 32, 16, 32);

        drawHUD(ctx, state);

        // Score
        ctx.fillStyle = '#F5F3FF';
        ctx.textAlign = 'center';
        ctx.font = 'black 48px "JetBrains Mono", monospace';
        ctx.shadowBlur = 15;
        ctx.shadowColor = ACCENT_PRIMARY;
        ctx.fillText(state.score.toString().padStart(4, '0'), CANVAS_WIDTH / 2, 50);
        ctx.shadowBlur = 0;

        if (!state.isActive) {
            ctx.fillStyle = 'rgba(30, 27, 75, 0.85)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.textAlign = 'center';
            
            if (state.frame === 0) {
                // Initial Start Screen
                ctx.fillStyle = ACCENT_PRIMARY;
                ctx.font = 'black 32px "JetBrains Mono", monospace';
                ctx.fillText('ENGINE_IDLE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
                
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.strokeRect(CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT / 2 + 10, 200, 40);
                
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 14px "JetBrains Mono", monospace';
                ctx.fillText('CLICK_TO_INITIALIZE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35);
            } else {
                // Game Over Screen
                ctx.fillStyle = ACCENT_PRIMARY;
                ctx.font = 'bold 32px "JetBrains Mono", monospace';
                ctx.fillText('SIGNAL LOST', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
                ctx.font = '12px "JetBrains Mono", monospace';
                ctx.fillStyle = '#F5F3FF';
                ctx.fillText('RE-AUTHORIZE PACKET VIA HBAR TRANSFER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
            }
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
        <div className="relative w-full aspect-video border-4 border-electric-lavender bg-cyber-indigo overflow-hidden cursor-pointer group shadow-[0_0_30px_rgba(168,85,247,0.3)]" 
             onClick={onFlip}>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%' }}
                className="block"
            />
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(168,85,247,0.2)]"></div>
        </div>
    );
};

export default GameCanvas;
