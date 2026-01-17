import React, { useRef, useEffect } from 'react';
import { Engine } from '@repo/sim-core';

export interface Annotation {
    type: 'arrow' | 'highlight' | 'label';
    text?: string;
    x: number;
    y: number;
    dx?: number;
    dy?: number;
    color?: string;
}

interface SimulationCanvasProps {
    engine: Engine;
    width?: number;
    height?: number;
    className?: string;
    annotations?: Annotation[];
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ engine, width = 800, height = 600, className, annotations = [] }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = React.useState<string | null>(null);
    const [hoveredObject, setHoveredObject] = React.useState<string | null>(null);
    const [images, setImages] = React.useState<Record<string, HTMLImageElement | null>>({});

    useEffect(() => {
        const loadImg = (src: string) => {
            const img = new Image();
            img.src = src;
            return img;
        };

        // We load them but don't wait strictly; React update will trigger re-render
        const loaded = {
            bg: loadImg('/assets/background.png'),
            bg_lab: loadImg('/assets/background_lab.png'),
            bg_optic: loadImg('/assets/background_optic.png'),
            cannon: loadImg('/assets/cannon.png'),
            stand: loadImg('/assets/cannon_stand.png'),
            target: loadImg('/assets/target.png')
        };

        // Wait for onload to force re-render if needed, but for simplicity just setting state
        // Ideally we attach .onload handlers
        let count = 0;
        const check = () => {
            count++;
            if (count === 6) setImages(loaded);
        };
        Object.values(loaded).forEach(img => img.onload = check);

    }, []); // Run once

    // Coordinate Conversion Helpers
    // These need to match the render logic
    const worldToScreen = (x: number, y: number, type: 'projectile' | 'particle' | 'generic') => {
        if (type === 'projectile') {
            const scale = 20;
            return { x: x * scale + 50, y: height - (y * scale + 50) };
        } else if (type === 'particle') {
            const scale = 40;
            const cx = width / 2;
            const cy = height / 2;
            return { x: cx + x * scale, y: cy - y * scale };
        }
        return { x, y };
    };

    const screenToWorld = (sx: number, sy: number, type: 'projectile' | 'particle' | 'generic') => {
        if (type === 'projectile') {
            const scale = 20;
            return { x: (sx - 50) / scale, y: (height - sy - 50) / scale };
        } else if (type === 'particle') {
            const scale = 40;
            const cx = width / 2;
            const cy = height / 2;
            return { x: (sx - cx) / scale, y: (cy - sy) / scale };
        }
        return { x: sx, y: sy };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Hit functionality
        const state = engine.getState();
        const objects = state.objects;

        // Check Projectile
        if (objects.projectile) {
            const pos = worldToScreen(objects.projectile.x, objects.projectile.y, 'projectile');
            const dist = Math.hypot(pos.x - x, pos.y - y);
            if (dist < 20) {
                setIsDragging('projectile');
                return;
            }
        }

        // Check Particle
        if (objects.particle) {
            const pos = worldToScreen(objects.particle.x, objects.particle.y, 'particle');
            const dist = Math.hypot(pos.x - x, pos.y - y);
            if (dist < 20) {
                setIsDragging('particle');
                return;
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isDragging && engine.setObjectPos) {
            let type: 'projectile' | 'particle' = 'projectile';
            if (isDragging === 'particle') type = 'particle';

            const worldPos = screenToWorld(x, y, type);

            // Constraints
            if (type === 'projectile') {
                // Keep above ground
                if (worldPos.y < 0) worldPos.y = 0;
            }

            engine.setObjectPos(isDragging, worldPos.x, worldPos.y);
            return;
        }

        // Hover effect
        const state = engine.getState();
        const objects = state.objects;
        let foundHover = null;

        if (objects.projectile) {
            const pos = worldToScreen(objects.projectile.x, objects.projectile.y, 'projectile');
            if (Math.hypot(pos.x - x, pos.y - y) < 20) foundHover = 'projectile';
        }
        if (objects.particle && !foundHover) {
            const pos = worldToScreen(objects.particle.x, objects.particle.y, 'particle');
            if (Math.hypot(pos.x - x, pos.y - y) < 20) foundHover = 'particle';
        }

        setHoveredObject(foundHover);
    };

    const handleMouseUp = () => {
        setIsDragging(null);
    };


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let lastTime = performance.now();

        const render = () => {
            // Clear
            ctx.clearRect(0, 0, width, height);

            const now = performance.now();
            const dt = Math.min((now - lastTime) / 1000, 0.1); // Cap dt at 0.1s
            lastTime = now;

            // Update Physics - Only if NOT dragging (pause physics while dragging to avoid fighting)
            if (!isDragging) {
                engine.update(dt);
            }

            // Get state
            const state = engine.getState();

            // Basic debug render
            ctx.font = '14px Inter, system-ui, sans-serif';
            ctx.fillStyle = '#64748b'; // Slate 500
            ctx.fillText(`Time: ${state.time.toFixed(2)}`, 20, 30);

            if (state.running) {
                ctx.fillStyle = '#22c55e'; // Green 500
                ctx.beginPath();
                ctx.arc(10, 25, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Custom Rendering for specific objects
            const objects = state.objects;

            // Render Background (Dynamic Switching)
            let currentBg = images.bg;
            if (objects.particle) currentBg = images.bg_lab;
            if (objects.waves) currentBg = images.bg_optic;

            if (currentBg) {
                ctx.drawImage(currentBg, 0, 0, width, height);
            }

            // 1. Projectile & Cannon
            if (objects.projectile) {
                const p = objects.projectile;
                const scale = 20; // 20px per meter
                const canvasX = p.x * scale + 50;
                const canvasY = height - (p.y * scale + 100); // 100px base offset

                // Draw Cannon Stand
                if (images.stand) {
                    ctx.drawImage(images.stand, 10, height - 120, 80, 80);
                }

                // Draw Cannon Barrel (Rotated)
                if (images.cannon) {
                    const angleRad = (state.params.angle as number || 45) * (Math.PI / 180);
                    const pivotX = 50;
                    const pivotY = height - 90;

                    ctx.save();
                    ctx.translate(pivotX, pivotY);
                    ctx.rotate(-angleRad); // Canvas y is inverted
                    ctx.drawImage(images.cannon, -10, -15, 80, 30);
                    ctx.restore();
                }

                // Draw Projectile
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(canvasX, canvasY, 8, 0, Math.PI * 2);
                ctx.fill();

                // Highlight if hovered
                if (hoveredObject === 'projectile' || isDragging === 'projectile') {
                    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
                    ctx.lineWidth = 4;
                    ctx.stroke();
                }

                // Draw Target (Mock postion for now, real app would have target logic)
                if (images.target) {
                    ctx.drawImage(images.target, 600, height - 120, 60, 60);
                }
            }

            // 2. Charged Particle
            if (objects.particle) {
                const p = objects.particle;
                // Center origin
                const scale = 40;
                const cx = width / 2;
                const cy = height / 2;
                const canvasX = cx + p.x * scale;
                const canvasY = cy - p.y * scale;

                // Draw Particle
                ctx.fillStyle = p.charge > 0 ? '#ef4444' : '#3b82f6'; // Red (+), Blue (-)
                ctx.beginPath();
                ctx.arc(canvasX, canvasY, 10, 0, Math.PI * 2);
                ctx.fill();

                if (hoveredObject === 'particle' || isDragging === 'particle') {
                    ctx.strokeStyle = p.charge > 0 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)';
                    ctx.lineWidth = 4;
                    ctx.stroke();
                }

                // Draw Velocity Vector
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(canvasX, canvasY);
                ctx.lineTo(canvasX + p.vx * 2, canvasY - p.vy * 2);
                ctx.stroke();
            }

            // 3. Double Slit / Waves
            if (objects.waves) {
                const w = objects.waves;
                // Visualize interference pattern
                // We'll draw 3 sources: 2 slits effectively act as sources
                const cx = width / 2;
                const cy = height / 2;
                const scale = 100;

                // Slit positions relative to center
                const s1x = cx + w.source1.x * scale;
                const s2x = cx + w.source2.x * scale;
                const sy = cy;

                // Draw Slits
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(cx - 200, sy - 2, 400, 4);
                ctx.fillStyle = '#ffffff';
                ctx.clearRect(s1x - 5, sy - 5, 10, 10);
                ctx.clearRect(s2x - 5, sy - 5, 10, 10);

                // Draw Wavefronts (simplified visual)
                ctx.lineWidth = 1;
                const time = w.time;
                const freq = w.frequency;

                // Draw expanding circles from slits
                for (let i = 0; i < 20; i++) {
                    const radius = ((time * 50) + (i * 40)) % 800;
                    const alpha = Math.max(0, 1 - radius / 600);

                    ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(s1x, sy, radius, 0, Math.PI, true); // Top half
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(s2x, sy, radius, 0, Math.PI, true);
                    ctx.stroke();
                }
            }

            // Render Annotations
            if (annotations && annotations.length > 0) {
                annotations.forEach(ann => {
                    const s = 20;
                    const ax = ann.x * s + 50; // Use same transform as projectile
                    const ay = height - (ann.y * s + 50);

                    ctx.fillStyle = ann.color || '#ef4444';
                    ctx.strokeStyle = ann.color || '#ef4444';
                    ctx.lineWidth = 2;
                    ctx.font = 'bold 14px Inter, system-ui';

                    if (ann.type === 'arrow') {
                        const tox = ax + (ann.dx || 0) * s;
                        const toy = ay - (ann.dy || 0) * s; // Invert y for canvas

                        ctx.beginPath();
                        ctx.moveTo(ax, ay);
                        ctx.lineTo(tox, toy);
                        ctx.stroke();

                        // Simple arrowhead (approx)
                        const angle = Math.atan2(toy - ay, tox - ax);
                        const headLen = 10;
                        ctx.beginPath();
                        ctx.moveTo(tox, toy);
                        ctx.lineTo(tox - headLen * Math.cos(angle - Math.PI / 6), toy - headLen * Math.sin(angle - Math.PI / 6));
                        ctx.lineTo(tox - headLen * Math.cos(angle + Math.PI / 6), toy - headLen * Math.sin(angle + Math.PI / 6));
                        ctx.fill();

                        if (ann.text) {
                            ctx.fillStyle = '#1e293b';
                            ctx.fillText(ann.text, tox + 10, toy);
                        }
                    }
                });
            }

            animId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animId);
    }, [engine, width, height, annotations, isDragging, hoveredObject]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`bg-white rounded-xl shadow-sm border border-slate-200 touch-none ${hoveredObject ? 'cursor-grab active:cursor-grabbing' : ''} ${className || ''}`}
        />
    );
};
