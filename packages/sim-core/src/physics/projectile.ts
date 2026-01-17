import { Vector2 } from '../vector';
import { Engine, SimulationState } from '../types';

export interface ProjectileParams {
    gravity: number; // m/s^2
    velocity: number; // m/s
    angle: number; // degrees
    height: number; // m
    mass: number; // kg
    drag: number; // coefficient
}

export class ProjectileEngine implements Engine {
    private state: SimulationState;
    private position: Vector2;
    private velocity: Vector2;

    constructor() {
        this.state = {
            time: 0,
            running: false,
            params: {
                gravity: 9.81,
                velocity: 15,
                angle: 45,
                height: 0,
                mass: 1,
                drag: 0
            },
            objects: {}
        };
        this.position = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
    }

    reset() {
        this.state.time = 0;
        this.state.running = false;
        this.position = new Vector2(0, this.state.params.height as number);

        const v = this.state.params.velocity as number;
        const angle = (this.state.params.angle as number) * (Math.PI / 180);
        this.velocity = new Vector2(Math.cos(angle) * v, Math.sin(angle) * v);

        this.updateStateObjects();
    }

    update(dt: number) {
        if (!this.state.running) return;

        this.state.time += dt;

        const g = new Vector2(0, -1 * (this.state.params.gravity as number));

        // Euler integration
        // v = u + at
        this.velocity = this.velocity.add(g.scale(dt));

        // s = s + vt
        this.position = this.position.add(this.velocity.scale(dt));

        // Ground collision
        if (this.position.y < 0) {
            this.position.y = 0;
            this.state.running = false;
        }

        this.updateStateObjects();
    }

    private updateStateObjects() {
        this.state.objects = {
            projectile: {
                x: this.position.x,
                y: this.position.y,
                vx: this.velocity.x,
                vy: this.velocity.y
            }
        };
    }

    getState() {
        return this.state;
    }

    setParam(key: string, value: number) {
        this.state.params[key] = value;
        if (!this.state.running) {
            this.reset();
        }
    }

    start() {
        if (this.state.time > 0 && this.position.y <= 0) {
            this.reset();
        }
        this.state.running = true;
    }

    stop() {
        this.state.running = false;
    }

    setObjectPos(id: string, x: number, y: number) {
        if (id === 'projectile') {
            this.position.x = x;
            this.position.y = y;
            // Also update height param for consistency on reset
            this.state.params.height = y;
            this.updateStateObjects();
        }
    }
}
