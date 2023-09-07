import * as math from './math'
import { drawCircle, drawLine, getCanvasBounds, ctx } from './canvas'

const LEG_LEN = 5

export class Pedal {
    constructor() {
        this.rotation = 0

        this.leftPedal = {}
        this.rightPedal = {}

        this.build()
    }

    build() {
        this.leftPedal.position = [-10, 0]

        this.rightPedal.position = [10, 0]


    }

    render(worldToViewPort, renderConfig) {
        const leftPedalPos = math.rotate(this.leftPedal.position, this.rotation)
        const rightPedalPos = math.rotate(this.rightPedal.position, this.rotation)
        
		drawLine(
			worldToViewPort(leftPedalPos),
			worldToViewPort(rightPedalPos),
			{ thickness: 2 }
		)

        drawLine(
			worldToViewPort(math.add([-LEG_LEN, 0], leftPedalPos)),
			worldToViewPort(math.add([LEG_LEN, 0], leftPedalPos)),
			{ thickness: 4 }
		)


        drawLine(
			worldToViewPort(math.add([-LEG_LEN, 0], rightPedalPos)),
			worldToViewPort(math.add([LEG_LEN, 0], rightPedalPos)),
			{ thickness: 4 }
		)

    }

}