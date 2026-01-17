import React, { useRef, useEffect } from 'react';
import { SimulationState } from '@repo/sim-core';

interface RealTimeGraphProps {
    data: { x: number; y: number }[];
    labelX?: string;
    labelY?: string;
    color?: string;
    width?: number;
    height?: number;
}

export const RealTimeGraph: React.FC<RealTimeGraphProps> = ({
    data,
    labelX = 'Time',
    labelY = 'Value',
    color = '#3b82f6',
    width = 300,
    height = 200
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);

        // Grid & Axis
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Grid lines... simplified
        ctx.moveTo(30, 0); ctx.lineTo(30, height - 20); // Y axis
        ctx.moveTo(30, height - 20); ctx.lineTo(width, height - 20); // X axis
        ctx.stroke();

        // Texts
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Inter';
        ctx.fillText(labelY, 5, 15);
        ctx.fillText(labelX, width - 30, height - 5);

        if (data.length < 2) return;

        // Scale
        const maxX = Math.max(...data.map(p => p.x), 10); // Min 10s window
        const minY = Math.min(...data.map(p => p.y), 0);
        const maxY = Math.max(...data.map(p => p.y), 10);
        const rangeY = maxY - minY || 1;
        const rangeX = maxX;

        const mapX = (x: number) => 30 + (x / rangeX) * (width - 40);
        const mapY = (y: number) => (height - 20) - ((y - minY) / rangeY) * (height - 30);

        // Plot
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mapX(data[0].x), mapY(data[0].y));

        // Optimization: Don't draw every single point if too many
        const step = Math.ceil(data.length / 500);
        for (let i = 1; i < data.length; i += step) {
            ctx.lineTo(mapX(data[i].x), mapY(data[i].y));
        }
        ctx.stroke();

    }, [data, width, height, color, labelX, labelY]);

    return (
        <div className="bg-white rounded-lg shadow border border-slate-200 p-2">
            <canvas ref={canvasRef} width={width} height={height} />
        </div>
    );
};
