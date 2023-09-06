import * as math from './math'
import { drawCircle, drawLine, getCanvasBounds, ctx } from './canvas'

export class BicycleFrame {
    constructor() {
        /*
          J--E--K   H--F--I
              \        \
               C--------D
               /\      / \
              /  \    /   \
             /    \  /     \
            B------A        G

        */

        this.vertices = {
            A: [0, 0],
            B: [0, 0],
            C: [0, 0],
            D: [0, 0],
            E: [0, 0],
            F: [0, 0],
            G: [0, 0],
            H: [0, 0],
            I: [0, 0],
            J: [0, 0],
            K: [0, 0],
        }

        this.linesIndices = [
            'AB',
            'BC',
            'AC',
            'CE',
            'CD',
            'AD',
            'FD',
            'DG',
            'FH',
            'FI',
            'JE',
            'EK'
        ]

        this.jointThickness = {
           FH: 4,
           FI: 4,
           JE: 4,
           EK: 4
        }

        this.build()
    }

    setPosition(frameVertices) {
        Object.assign(this.vertices, frameVertices)
    }

    build() {
      
    }

    render(worldToViewPort, renderConfig) {

        this.linesIndices.forEach(indices => {
            const v1 = this.vertices[indices[0]]
            const v2 = this.vertices[indices[1]]
            drawLine(worldToViewPort(v1), worldToViewPort(v2), { thickness: this.jointThickness[indices] || 2})
        })
    }

}