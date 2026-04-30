import { useCallback, useRef } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const SLAB_WIDTH = 60;
const SLAB_HEIGHT = 20;
const GRAVITY = 0.6;
const JUMP_FORCE = -10;
const OBSTACLE_SPEED = 5;
const SPAWN_RATE = 100; // frames

export const useGameLoop = (onGameOver, onScoreUpdate) => {
    const gameState = useRef({
        runnerY: CANVAS_HEIGHT / 2,
        velocity: 0,
        gravityDir: 1, // 1 for down, -1 for up
        obstacles: [],
        score: 0,
        frame: 0,
        isActive: false
    });

    const resetGame = useCallback(() => {
        gameState.current = {
            runnerY: CANVAS_HEIGHT / 2,
            velocity: 0,
            gravityDir: 1,
            obstacles: [],
            score: 0,
            frame: 0,
            isActive: true
        };
    }, []);

    const flipGravity = useCallback(() => {
        if (!gameState.current.isActive) return;
        gameState.current.gravityDir *= -1;
        // Add a little boost when flipping to feel responsive
        gameState.current.velocity = gameState.current.gravityDir * 2;
    }, []);

    const update = useCallback(() => {
        const state = gameState.current;
        if (!state.isActive) return state;

        state.frame++;

        // Physics
        state.velocity += GRAVITY * state.gravityDir;
        state.runnerY += state.velocity;

        // Ceiling/Floor boundaries
        if (state.runnerY < 0) {
            state.runnerY = 0;
            state.velocity = 0;
        } else if (state.runnerY > CANVAS_HEIGHT - SLAB_HEIGHT) {
            state.runnerY = CANVAS_HEIGHT - SLAB_HEIGHT;
            state.velocity = 0;
        }

        // Obstacle Spawning
        if (state.frame % SPAWN_RATE === 0) {
            const isTop = Math.random() > 0.5;
            state.obstacles.push({
                x: CANVAS_WIDTH,
                y: isTop ? 0 : CANVAS_HEIGHT - 60,
                width: 30,
                height: 60,
                passed: false
            });
        }

        // Obstacle Movement & Collision
        for (let i = state.obstacles.length - 1; i >= 0; i--) {
            const obs = state.obstacles[i];
            obs.x -= OBSTACLE_SPEED + (state.score / 100); // Speed ramps up

            // Collision Detection (AABB)
            const runnerX = 100; // Fixed X position for runner
            if (
                runnerX < obs.x + obs.width &&
                runnerX + SLAB_WIDTH > obs.x &&
                state.runnerY < obs.y + obs.height &&
                state.runnerY + SLAB_HEIGHT > obs.y
            ) {
                state.isActive = false;
                onGameOver(state.score);
            }

            // Score update
            if (!obs.passed && obs.x < runnerX) {
                obs.passed = true;
                state.score += 10;
                onScoreUpdate(state.score);
            }

            // Cleanup
            if (obs.x + obs.width < 0) {
                state.obstacles.splice(i, 1);
            }
        }

        return state;
    }, [onGameOver, onScoreUpdate]);

    return {
        update,
        flipGravity,
        resetGame,
        gameState
    };
};
