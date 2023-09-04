
import Bicycle from './bicycle';
import Test from './collisiontest';
import ViewController from './ViewController';
import { clearCanvas, drawCircle } from './canvas';

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
			window.requestAnimationFrame(onFrame)
		}
		window.requestAnimationFrame(onFrame)
	}

	updateGame(event) {
		const fps = '' + Math.round(1 / event.delta)
		fpsElem.innerHTML = fps
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

