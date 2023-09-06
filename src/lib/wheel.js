import * as math from './math'
import { drawCircle, drawLine, getCanvasBounds, ctx } from './canvas'

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

            const inner = 5
            
            const v1 = math.rotate(r, angle)
            const v2 = math.rotate(r, angle + Math.PI)

            this.spokeVertices.push(v1)
            this.spokeVertices.push(v2)

            this.spokeLinesIndices.push([off * 2, off * 2 + 1])
        }
    }

    render(worldToViewPort, renderConfig) {
        const pos = worldToViewPort([0, 0])
        const viewPortRadius = math.norm(math.subtract(worldToViewPort([this.radius, 0]), pos))
        drawCircle(pos, viewPortRadius, renderConfig)

        this.spokeLinesIndices.forEach(indices => {
            const v1 = this.spokeVertices[indices[0]]
            const v2 = this.spokeVertices[indices[1]]
            drawLine(worldToViewPort(v1), worldToViewPort(v2), renderConfig)
        })
    }

}