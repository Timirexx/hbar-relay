import React, { useRef, useEffect, useCallback } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const COLOR_HIGHLIGHT = '#A855F7';

const GameCanvas = ({ gameState, onFlip }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();

    const drawHUD = (ctx, state) => {
        const padding = 20;
        ctx.font = '900 10px "Plus Jakarta Sans", sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillStyle = COLOR_HIGHLIGHT;
        ctx.shadowBlur = 5;
        ctx.shadowColor = COLOR_HIGHLIGHT;

        ctx.textAlign = 'left';
        ctx.fillText(`STATUS: ${state.isActive ? 'OPERATIONAL' : 'IDLE'}`, padding, padding);
        
        ctx.textAlign = 'right';
        ctx.fillText(`HBAR_RELAY_v2.0`, CANVAS_WIDTH - padding, padding);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`VECTOR: ${state.gravityDir > 0 ? 'LEVEL_0' : 'LEVEL_1'}`, padding, CANVAS_HEIGHT - padding - 10);
        
        ctx.shadowBlur = 0;
    };

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const state = gameState.current;

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Grid Depth
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.05)';
        for (let x = 0; x < CANVAS_WIDTH; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
        }

        // Obstacles
        state.obstacles.forEach(obs => {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8);
            ctx.fill();
        });

        // Player
        const runnerX = 100;
        const gradient = ctx.createLinearGradient(runnerX, state.runnerY, runnerX + 60, state.runnerY + 16);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(1, COLOR_HIGHLIGHT);
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = COLOR_HIGHLIGHT;
        ctx.beginPath();
        ctx.roundRect(runnerX, state.runnerY, 60, 16, 8);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Player Core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(runnerX + 22, state.runnerY - 30, 16, 24, 4);
        ctx.fill();

        drawHUD(ctx, state);

        // Large Score
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.font = '900 72px "Plus Jakarta Sans", sans-serif';
        ctx.shadowBlur = 20;
        ctx.shadowColor = COLOR_HIGHLIGHT;
        ctx.fillText(state.score.toString(), CANVAS_WIDTH / 2, 80);
        ctx.shadowBlur = 0;

        if (!state.isActive) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.textAlign = 'center';
            ctx.fillStyle = COLOR_HIGHLIGHT;
            ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
            ctx.fillText(state.frame === 0 ? 'SYSTEM_IDLE' : 'RELAY_FAILURE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
            ctx.fillText(state.frame === 0 ? 'CLICK_TO_INITIALIZE_CORE' : 'TAP_TO_REBOOT_RELAY', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
        }

        requestRef.current = requestAnimationFrame(render);
    }, [gameState]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(requestRef.current);
    }, [render]);

    return (
        <div className="relative w-full aspect-video rounded-[32px] glass-3d border-2 border-white/5 overflow-hidden cursor-pointer shadow-2xl float-ui" 
             onClick={onFlip}>
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full h-full block"
            />
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"></div>
        </div>
    );
};

export default GameCanvas;
