import * as math from './math'

export class Wheel {
    constructor(radius) {
        this.radius = radius

        this.spokeVertices = []
        this.spokeLinesIndices = []

        this.build()
    }

    build() {
        const numSpokes = 8
        const delta = 2 * Math.PI / numSpokes
        const r = [this.radius, 0]

        for (let off = 0; off < numSpokes; ++off) {
            const angle = off * delta
            
            const v1 = math.rotate(r, angle)
            const v2 = math.rotate(r, angle + Math.PI)

            this.spokeVertices.push(v1)
            this.spokeVertices.push(v2)

            this.spokeLinesIndices.push([off * 2, off * 2 + 1])
        }
    }

}