import { Vector2 } from '../vector';
import { Engine, SimulationState } from '../types';

export interface ChargedParticleParams {
    charge: number; // C
    mass: number; // kg
    magneticField: number; // Tesla (Z-axis)
    electricField: number; // N/C (X-axis)
    velocity: number; // m/s
}

export class ChargedParticleEngine implements Engine {
    private state: SimulationState;
    private position: Vector2;
    private velocity: Vector2;

    constructor() {
        this.state = {
            time: 0,
            running: false,
            params: {
                charge: 1,
                mass: 1,
                magneticField: 0,
                electricField: 0,
                velocity: 10
            },
            objects: {}
        };
        this.position = new Vector2(0, 0);
        this.velocity = new Vector2(10, 0);
        this.updateStateObjects();
    }

    reset() {
        this.state.time = 0;
        this.state.running = false;
        this.position = new Vector2(0, 0);
        this.velocity = new Vector2(this.state.params.velocity as number, 0);
        this.updateStateObjects();
    }

    update(dt: number) {
        if (!this.state.running) return;

        this.state.time += dt;

        const q = this.state.params.charge as number;
        const m = this.state.params.mass as number;
        const B = this.state.params.magneticField as number; // B_z
        const E = this.state.params.electricField as number; // E_x

        // F = q(E + v x B)
        // v x B = (vy*0 - 0*B, 0*0 - vx*0, vx*B - vy*0) ??? No.
        // B is in Z direction (0, 0, B). v = (vx, vy, 0)
        // v x B = (vy*B - 0, 0 - vx*B, 0)
        // Fx = q(Ex + vy*B)
        // Fy = q(-vx*B)

        const Fx = q * (E + this.velocity.y * B);
        const Fy = q * (-this.velocity.x * B);

        const ax = Fx / m;
        const ay = Fy / m;

        // Euler integration
        this.velocity.x += ax * dt;
        this.velocity.y += ay * dt;

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        this.updateStateObjects();
    }

    private updateStateObjects() {
        this.state.objects = {
            particle: {
                x: this.position.x,
                y: this.position.y,
                vx: this.velocity.x,
                vy: this.velocity.y,
                charge: this.state.params.charge
            }
        };
    }

    getState() {
        return this.state;
    }

    setParam(key: string, value: number) {
        this.state.params[key] = value;
        if (key === 'velocity' && !this.state.running) {
            this.velocity = new Vector2(value, 0);
        }
        if (!this.state.running) {
            this.reset();
        }
    }

    start() {
        this.state.running = true;
    }

    stop() {
        this.state.running = false;
    }

    setObjectPos(id: string, x: number, y: number) {
        if (id === 'particle') {
            this.position.x = x;
            this.position.y = y;
            this.updateStateObjects();
        }
    }
}
