export type Vec = [number, number]
export type Vec3 = [number, number, number]

export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]]
export const subtract = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]]
export const multiply = (a: Vec, b: number): Vec => [a[0] * b, a[1] * b]
export const divide = (a: Vec, b: number): Vec => [a[0] / b, a[1] / b]
export const norm = (a: Vec): number => Math.hypot(a[0], a[1])
export const dot = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1]
export const sqrt = (a: number): number => Math.sqrt(a)
export const distance = (a: Vec, b: Vec): number => Math.hypot(a[0] - b[0], a[1] - b[1])

export const min = (a: number, b: number): number => Math.min(a, b)
export const max = (a: number, b: number): number => Math.max(a, b)
export const abs = (a: number): number => Math.abs(a)
export const atan2 = (a: number, b: number): number => Math.atan2(a, b)

// a0 a1 a2
// b0 b1 b2
export const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], -a[0] * b[2] + a[2] * b[0], a[0] * b[1] - a[1] * b[0]]

export const clamp = (value: number, lower_bound: number, upper_bound: number): number => Math.min(Math.max(value, lower_bound), upper_bound)

export const rotate = (a: Vec, angle: number): Vec => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [cos * a[0] - sin * a[1], sin * a[0] + cos * a[1]]
}
