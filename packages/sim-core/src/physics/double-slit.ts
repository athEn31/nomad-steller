import { Engine, SimulationState } from '../types';

export interface DoubleSlitParams {
    frequency: number; // Hz
    slitDistance: number; // mm
    slitWidth: number; // mm
    intensity: number;
}

export class DoubleSlitEngine implements Engine {
    private state: SimulationState;

    constructor() {
        this.state = {
            time: 0,
            running: false,
            params: {
                frequency: 5,
                slitDistance: 2,
                slitWidth: 0.5,
                intensity: 1
            },
            objects: {}
        };
        this.updateStateObjects();
    }

    reset() {
        this.state.time = 0;
        this.state.running = false;
        this.updateStateObjects();
    }

    update(dt: number) {
        if (!this.state.running) return;
        this.state.time += dt;
        this.updateStateObjects();
    }

    private updateStateObjects() {
        this.state.objects = {
            waves: {
                source1: { x: -this.state.params.slitDistance as number / 2, y: 0 },
                source2: { x: this.state.params.slitDistance as number / 2, y: 0 },
                frequency: this.state.params.frequency,
                time: this.state.time
            }
        };
    }

    getState() {
        return this.state;
    }

    setParam(key: string, value: number) {
        this.state.params[key] = value;
        this.reset();
    }

    start() {
        this.state.running = true;
    }

    stop() {
        this.state.running = false;
    }
}
