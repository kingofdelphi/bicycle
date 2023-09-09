import * as math from './math'
import { drawCircle, drawLine, getCanvasBounds, ctx } from './canvas'

export class Wheel {
    constructor(radius) {
        this.radius = radius

        this.spokeVertices = []
        this.spokeLinesIndices = []

        this.innerDiscRadius = 4

        this.build()

    }

    build() {
        const numSpokes = 6
        const delta = 2 * Math.PI / numSpokes
        const r = [this.radius, 0]
        const inner = [this.innerDiscRadius, 0]

        const slant = Math.PI / 4
        const offset = -slant / 2
        const rot = Math.PI / 4
        for (let i = 0; i < 2; ++i) {
            // if (i == 1) continue
            for (let off = 0; off < numSpokes; ++off) {
                const angle = off * delta + rot * i

                const curSlant = slant * (i == 0 ? 1 : -1)

                let v1 = math.rotate(inner, angle)
                let v2 = math.rotate(r, angle + curSlant)

                let pos = this.spokeVertices.length

                this.spokeVertices.push(v1)
                this.spokeVertices.push(v2)

                this.spokeLinesIndices.push([pos, pos + 1])

                v1 = math.rotate(inner, angle + offset)
                v2 = math.rotate(r, angle + curSlant + offset)

                pos = this.spokeVertices.length

                this.spokeVertices.push(v1)
                this.spokeVertices.push(v2)

                this.spokeLinesIndices.push([pos, pos + 1])
            }
        }

    }

    render(worldToViewPort, renderConfig) {
        const pos = worldToViewPort([0, 0])
        const viewPortRadius = math.norm(math.subtract(worldToViewPort([this.radius, 0]), pos))



        this.spokeLinesIndices.forEach(indices => {
            const v1 = this.spokeVertices[indices[0]]
            const v2 = this.spokeVertices[indices[1]]
            drawLine(worldToViewPort(v1), worldToViewPort(v2), { color: 'rgba(0, 0, 0, 0.5)' })
        })

        drawCircle(pos, viewPortRadius, { strokeColor: 'black', strokeWidth: 4 })

        drawCircle(pos, this.innerDiscRadius, { fillColor: 'rgb(50, 50, 50)', strokeWidth: 0 })

    }

}