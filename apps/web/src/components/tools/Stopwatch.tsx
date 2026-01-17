import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, GripHorizontal } from 'lucide-react';

export const Stopwatch = () => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            const startTime = Date.now() - time;
            interval = setInterval(() => {
                setTime(Date.now() - startTime);
            }, 10); // 10ms update
        }
        return () => clearInterval(interval);
    }, [isRunning, time]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const parentRect = ref.current?.offsetParent?.getBoundingClientRect();
                if (!parentRect) return;
                const newX = e.clientX - parentRect.left - dragOffset.x;
                const newY = e.clientY - parentRect.top - dragOffset.y;
                setPosition({ x: newX, y: newY });
            }
        };
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10);
        return `${seconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
    };

    return (
        <div
            ref={ref}
            className="absolute bg-gray-800 text-white rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-lg border-4 border-gray-600 select-none z-50"
            style={{ left: position.x, top: position.y }}
        >
            {/* Drag Handle */}
            <div
                className="absolute top-2 w-full flex justify-center cursor-move opacity-50 hover:opacity-100"
                onMouseDown={handleMouseDown}
            >
                <GripHorizontal size={20} />
            </div>

            <div className="text-2xl font-mono font-bold mb-2 tabular-nums tracking-widest text-emerald-400">
                {formatTime(time)}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                >
                    {isRunning ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" className="ml-0.5" />}
                </button>
                <button
                    onClick={() => { setIsRunning(false); setTime(0); }}
                    className="w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition-colors"
                >
                    <RotateCcw size={14} />
                </button>
            </div>
        </div>
    );
};
