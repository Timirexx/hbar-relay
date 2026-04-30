import React, { useRef, useEffect, useCallback } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const ACCENT_COLOR = '#FF5F1F'; // Signal Orange

const GameCanvas = ({ gameState, onFlip }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();

    const drawSlab = (ctx, x, y, width, height) => {
        // Main Slab
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, width, height);
        
        // Brutalist Border
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

    const drawRunner = (ctx, x, y) => {
        // Signal Runner Silhouette
        ctx.fillStyle = ACCENT_COLOR;
        ctx.beginPath();
        ctx.moveTo(x + 20, y - 30); // Head
        ctx.lineTo(x + 40, y - 30);
        ctx.lineTo(x + 50, y);
        ctx.lineTo(x + 10, y);
        ctx.closePath();
        ctx.fill();
        
        // Sharp legs/lines
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 15, y - 10, 10, 10);
        ctx.strokeRect(x + 35, y - 10, 10, 10);
    };

    const drawObstacle = (ctx, obs) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        
        // Brutalist detailing
        ctx.strokeStyle = ACCENT_COLOR;
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x + 5, obs.y + 5, obs.width - 10, obs.height - 10);
    };

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const state = gameState.current;

        // Clear
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw Obstacles
        state.obstacles.forEach(obs => drawObstacle(ctx, obs));

        // Draw Player (Runner + Slab)
        const runnerX = 100;
        drawSlab(ctx, runnerX, state.runnerY, 60, 20);
        drawRunner(ctx, runnerX, state.runnerY);

        // Draw Score Overlay (minimalist)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.fillText(`SCORE: ${state.score}`, 20, 40);

        if (!state.isActive) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = ACCENT_COLOR;
            ctx.textAlign = 'center';
            ctx.font = 'bold 48px "Courier New", monospace';
            ctx.fillText('SIGNAL LOST', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.font = '18px "Courier New", monospace';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('TRANSACTION REQUIRED TO RELAY', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
        }

        requestRef.current = requestAnimationFrame(render);
    }, [gameState]);

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
        <div className="relative w-full aspect-video border-4 border-white bg-black overflow-hidden cursor-pointer" 
             onClick={onFlip}>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%' }}
                className="block"
            />
            {/* Halftone Overlay handled by CSS in parent */}
            <div className="absolute inset-0 pointer-events-none bg-halftone opacity-20"></div>
        </div>
    );
};

export default GameCanvas;
