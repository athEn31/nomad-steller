import { SimulationState } from '@repo/sim-core';

export interface Annotation {
    type: 'arrow' | 'highlight' | 'label';
    text?: string;
    x: number;
    y: number;
    dx?: number; // for arrows
    dy?: number;
    color?: string;
}

export interface AIResponse {
    explanation: string;
    annotations: Annotation[];
}

export const MockAIService = {
    async ask(question: string, context: SimulationState): Promise<AIResponse> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Basic heuristic response for Projectile Demo
        if (question.toLowerCase().includes('parabola') || question.toLowerCase().includes('curve')) {
            const p = context.objects.projectile;
            return {
                explanation: "Gravity acts downwards constantly, while horizontal velocity remains constant (ignoring drag). This combination creates a parabolic curve.",
                annotations: [
                    {
                        type: 'arrow',
                        text: 'Gravity (-g)',
                        x: p ? p.x : 10,
                        y: p ? p.y : 10,
                        dx: 0,
                        dy: -5, // Downward arrow
                        color: '#ef4444' // Red
                    },
                    {
                        type: 'arrow',
                        text: 'Velocity (vx)',
                        x: p ? p.x : 10,
                        y: p ? p.y : 10,
                        dx: 5,
                        dy: 0,
                        color: '#22c55e' // Green
                    }
                ]
            };
        }

        return {
            explanation: "I can help explain the physics! Try asking about the shape of the path or the forces involved.",
            annotations: []
        };
    }
};
