"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ProjectileEngine, DoubleSlitEngine, ChargedParticleEngine } from '@repo/sim-core';
import { SimulationCanvas, Annotation } from '@repo/sim-render';
import { MockAIService } from '@repo/ai-mock';
import { Play, Pause, RotateCcw, Ruler, Timer, Activity } from 'lucide-react';
import Link from 'next/link';
import { ChatInterface } from '../../../components/ChatInterface';
import { DraggableRuler } from '../../../components/tools/DraggableRuler';
import { Stopwatch } from '../../../components/tools/Stopwatch';
import { RealTimeGraph } from '../../../components/tools/RealTimeGraph';

export default function SimulationPage() {
    const params = useParams();
    const id = params.id as string;

    const engine = useMemo(() => {
        switch (id) {
            case 'double-slit':
                return new DoubleSlitEngine();
            case 'charged-particle':
                return new ChargedParticleEngine();
            case 'projectile':
            default:
                return new ProjectileEngine();
        }
    }, [id]);

    const [isRunning, setIsRunning] = useState(false);
    const [annotations, setAnnotations] = useState<any[]>([]);

    // Tools State
    const [showRuler, setShowRuler] = useState(false);
    const [showStopwatch, setShowStopwatch] = useState(false);
    const [showGraph, setShowGraph] = useState(false);
    const [graphData, setGraphData] = useState<{ x: number, y: number }[]>([]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && showGraph) {
            interval = setInterval(() => {
                const state = engine.getState();
                let newVal = 0;

                // Decide what to plot based on sim type
                if (state.objects.projectile) {
                    newVal = state.objects.projectile.y;
                } else if (state.objects.particle) {
                    newVal = state.objects.particle.y; // Plot Y position
                } else if (state.objects.waves) {
                    newVal = Math.sin(state.time * 5); // Mock intensity?
                }

                setGraphData(prev => {
                    const next = [...prev, { x: state.time, y: newVal }];
                    if (next.length > 200) next.shift(); // Keep window
                    return next;
                });
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isRunning, showGraph, engine]);

    const togglePlay = () => {
        if (isRunning) {
            engine.stop();
        } else {
            engine.start();
        }
        setIsRunning(!isRunning);
    };

    const reset = () => {
        engine.reset();
        setIsRunning(false);
        setAnnotations([]);
        setGraphData([]);
    };

    // Helper to get parameters for the sidebar based on engine type
    const renderControls = () => {
        const state = engine.getState();
        const p = state.params;

        return Object.keys(p).map(key => (
            <div key={key}>
                <label className="text-sm font-medium block mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                <input
                    type="range"
                    min={key.includes('angle') ? 0 : (key === 'frequency' ? 1 : 0)}
                    max={key.includes('angle') ? 90 : (key === 'frequency' ? 20 : 50)}
                    defaultValue={Number(p[key])}
                    step={0.1}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    onChange={(e) => engine.setParam(key, parseFloat(e.target.value))}
                />
                <div className="text-xs text-gray-400 mt-1">{p[key]}</div>
            </div>
        ));
    };

    const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        // Set initial size
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex flex-col h-screen bg-[#f5f5f7] dark:bg-black overflow-hidden relative">
            {/* Full Screen Canvas Container */}
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-slate-900">
                <SimulationCanvas
                    engine={engine}
                    width={windowSize.width}
                    height={windowSize.height}
                    className="w-full h-full object-cover"
                    annotations={annotations}
                />
            </div>

            {/* Header Overlay */}
            <header className="absolute top-0 left-0 right-0 h-16 flex items-center px-6 z-20 pointer-events-none">
                <div className="flex items-center bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg pointer-events-auto">
                    <Link href="/" className="font-semibold text-sm hover:text-blue-500 transition-colors mr-3">
                        ← Back
                    </Link>
                    <span className="w-px h-4 bg-slate-300 mx-2"></span>
                    <h1 className="font-bold text-sm capitalize">{id.replace('-', ' ')} Simulation</h1>
                </div>

                {/* Tools Toolbar Centered */}
                <div className="mx-auto flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg pointer-events-auto">
                    <button
                        onClick={() => setShowRuler(!showRuler)}
                        className={`p-2 rounded-full transition-colors ${showRuler ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Toggle Ruler"
                    >
                        <Ruler size={20} />
                    </button>
                    <button
                        onClick={() => setShowStopwatch(!showStopwatch)}
                        className={`p-2 rounded-full transition-colors ${showStopwatch ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Toggle Stopwatch"
                    >
                        <Timer size={20} />
                    </button>
                    <button
                        onClick={() => setShowGraph(!showGraph)}
                        className={`p-2 rounded-full transition-colors ${showGraph ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Toggle Graph"
                    >
                        <Activity size={20} />
                    </button>
                </div>

                {/* Spacer balance */}
                <div className="w-[200px]"></div>
            </header>

            {/* Floating Control Panel */}
            <aside className="absolute top-20 right-6 w-80 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl border border-white/20 z-20 max-h-[calc(100vh-140px)] flex flex-col overflow-hidden transition-all duration-300">
                <div className="p-4 border-b border-slate-200/50 bg-slate-50/50">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Controls</h2>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {renderControls()}
                </div>

                {/* Embedded Chat */}
                <div className="h-64 border-t border-slate-200/50 bg-white/50">
                    <ChatInterface
                        engineState={engine.getState()}
                        onAnnotationsUpdate={setAnnotations}
                    />
                </div>
            </aside>

            {/* Play/Reset HUD */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-white/20 text-slate-700">
                <button onClick={reset} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                    <RotateCcw size={24} />
                </button>
                <button
                    onClick={togglePlay}
                    className={`w-16 h-16 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${isRunning ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}
                >
                    {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>
            </div>

            {/* Tools Layer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                <div className="pointer-events-auto contents">
                    {showRuler && <DraggableRuler />}
                    {showStopwatch && <Stopwatch />}
                </div>
            </div>

            {/* Graph Overlay */}
            {showGraph && (
                <div className="absolute bottom-32 right-6 z-20 w-80 opacity-90 hover:opacity-100 transition-opacity">
                    <RealTimeGraph
                        data={graphData}
                        width={300}
                        height={200}
                        labelX="Time"
                        labelY="Position (y)"
                    />
                </div>
            )}
        </div>
    );
}
