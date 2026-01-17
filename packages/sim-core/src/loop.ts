export type TickCallback = (dt: number) => void;

export class GameLoop {
    private lastTime: number = 0;
    private running: boolean = false;
    private callback: TickCallback;
    private rafId: number = 0;

    constructor(callback: TickCallback) {
        this.callback = callback;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.tick();
    }

    stop() {
        this.running = false;
        if (typeof cancelAnimationFrame !== 'undefined') {
            cancelAnimationFrame(this.rafId);
        }
    }

    private tick = () => {
        if (!this.running) return;
        const now = performance.now();
        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        // Cap dt to avoid huge jumps
        if (dt < 0.2) {
            this.callback(dt);
        }

        if (typeof requestAnimationFrame !== 'undefined') {
            this.rafId = requestAnimationFrame(this.tick);
        }
    };
}
