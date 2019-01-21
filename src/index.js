
import './styles.css';
import * as paper from 'paper';
import Demo from './demo';
import Test from './collisiontest';
import ViewController from './ViewController';

const root = document.getElementById('canvas-wrapper');
const w = root.clientWidth;
const h = root.clientHeight;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = w;
canvas.height = h;

class Main {
	init(world) {
		paper.setup(canvas);
		this.viewController = new ViewController();
		this.viewController.init();
		world.postInit(this.viewController);

		paper.view.onFrame = (event) => {
			// Get a reference to the canvas renderObject
			// Create an empty project and a view for the canvas:
			world.preUpdateCallback(this.viewController);
			this.updateGame(event);
		};
	}

	updateGame(event) {
		this.viewController.update(event.delta);
	}
}

const main = new Main();

const mode = 'demo';

let world;
if (mode == 'demo') {
	world = new Demo();
} else {
	world = new Test();
}

main.init(world);

