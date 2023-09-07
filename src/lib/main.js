
import Bicycle from './bicycle';
import Test from './collisiontest';
import ViewController from './view_controller';
import { clearCanvas, ctx, getCanvasBounds } from './canvas';

const root = document.getElementById('canvas-wrapper');
const w = root.clientWidth;
const h = root.clientHeight;

canvas.width = w;
canvas.height = h;

document.getElementById('pull').checked = true
const fpsElem = document.getElementById('fps')

class Main {
	init(world) {
		this.viewController = new ViewController();
		this.viewController.init();
		world.postInit(this.viewController);
		let last

		const NUM_FRAMES = 20

		let frames = new Array(NUM_FRAMES).fill(0)

		let restartClock = true

		window.onfocus = function() {
			restartClock = true
		}

		const onFrame = (timestamp) => {
			// Get a reference to the canvas renderObject
			// Create an empty project and a view for the canvas:
			if (last == null || restartClock) {
				last = timestamp / 1000
				restartClock = false
			}
			const current = timestamp / 1000
			const elapsed = current - last
			const event = { delta: elapsed }
			last = current
			world.preUpdateCallback(event)
			this.updateGame(event)

			for (let i = 0; i + 1 < NUM_FRAMES; ++i) {
				frames[i] = frames[i + 1]
			}

			frames[NUM_FRAMES - 1] = elapsed
			
			let totTime = 0
			for (let i = 0; i < NUM_FRAMES; ++i) {
				totTime += frames[i]
			}
			const fps = Math.floor(NUM_FRAMES / (totTime == 0 ? 1 : totTime))

			ctx.fillStyle = 'red'
			ctx.font = "30px Arial";

			ctx.fillText(`FPS: ${fps}`, getCanvasBounds()[0] - 200, 50)
			window.requestAnimationFrame(onFrame)
		}
		window.requestAnimationFrame(onFrame)
	}

	updateGame(event) {
		clearCanvas()
		this.viewController.update(event.delta)
	}
}

const main = new Main();

const mode = 'bicycle';

let world;
if (mode === 'bicycle') {
	world = new Bicycle();
} else {
	world = new Test();
}

main.init(world);

