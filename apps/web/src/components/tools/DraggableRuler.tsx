import React, { useState, useRef, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

export const DraggableRuler = () => {
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [rotation, setRotation] = useState(0); // degrees
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const rulerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        const rect = rulerRef.current?.getBoundingClientRect();
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
                // Determine the new position relative to the parent container
                const parentRect = rulerRef.current?.offsetParent?.getBoundingClientRect();
                if (!parentRect) return;

                const newX = e.clientX - parentRect.left - dragOffset.x;
                const newY = e.clientY - parentRect.top - dragOffset.y;
                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    // Ticks generation
    const ticks = [];
    const lengthCm = 20;
    const pixelsPerCm = 37.8; // Approximate

    for (let i = 0; i <= lengthCm; i++) {
        ticks.push(
            <div key={i} className="absolute bottom-0 h-4 border-l border-slate-600" style={{ left: `${i * pixelsPerCm}px` }}>
                <span className="absolute -top-4 -left-1 text-[10px] font-medium text-slate-600 select-none">{i}</span>
            </div>
        );
        // Half ticks
        if (i < lengthCm) {
            ticks.push(
                <div key={`half-${i}`} className="absolute bottom-0 h-2 border-l border-slate-400" style={{ left: `${(i + 0.5) * pixelsPerCm}px` }} />
            );
        }
    }

    return (
        <div
            ref={rulerRef}
            className="absolute bg-yellow-100/90 border border-yellow-300 shadow-md rounded overflow-visible cursor-move select-none z-50 flex items-center"
            style={{
                left: position.x,
                top: position.y,
                width: `${lengthCm * pixelsPerCm + 20}px`,
                height: '50px',
                transform: `rotate(${rotation}deg)`,
                transformOrigin: '10px 50%',
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="absolute top-0 right-0 p-1 cursor-grab active:cursor-grabbing group"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    // implementing rotation logic here would be complex for a quick component, 
                    // maybe just click to rotate 90?
                    setRotation(r => (r + 90) % 360);
                }}
            >
                <div className="text-[10px] text-slate-400 font-bold bg-white/50 px-1 rounded hover:bg-white">Rotate</div>
            </div>

            <div className="w-full h-full relative border-b border-slate-400">
                {ticks}
            </div>

            {/* Grip */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                <GripVertical size={16} />
            </div>
        </div>
    );
};
