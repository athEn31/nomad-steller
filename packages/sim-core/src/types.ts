

export interface SimulationConfig {
    id: string;
    name: string;
    defaultParams: Record<string, number | boolean>;
}

export interface SimulationState {
    time: number;
    running: boolean;
    params: Record<string, number | boolean>;
    objects: Record<string, any>;
}

export interface Engine {
    update(dt: number): void;
    reset(): void;
    getState(): SimulationState;
    setObjectPos?(id: string, x: number, y: number): void;
}
