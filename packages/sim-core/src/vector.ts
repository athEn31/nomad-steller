export class Vector2 {
    constructor(public x: number = 0, public y: number = 0) { }

    add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    sub(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    scale(s: number): Vector2 {
        return new Vector2(this.x * s, this.y * s);
    }

    mag(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize(): Vector2 {
        const m = this.mag();
        return m === 0 ? new Vector2() : this.scale(1 / m);
    }

    distanceTo(v: Vector2): number {
        return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
    }

    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }
}
