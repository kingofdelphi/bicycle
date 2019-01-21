
import keys from './keys';

import './styles.css';
import * as paper from 'paper';
import ViewController from './ViewController';
import mouseHandler from './mousehandler';

const root = document.getElementById('canvas-wrapper');
const w = root.clientWidth;
const h = root.clientHeight;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = w;
canvas.height = h;

let FLOOR = canvas.height;

paper.setup(canvas);

let viewController = new ViewController();
viewController.init();
mouseHandler(viewController);

let K = 20;

let wheel = null;
let vehicleXvel = 0;
const updateGame = (event) => {
	if (keys['d']) {
		if (wheel != null) {
			vehicleXvel += 3 * dt;
		}
	}
	if (keys['a']) {
		if (wheel != null) {
			vehicleXvel -= 3 * dt;
		}
	}
	vehicleXvel *= 0.99;
	if (wheel != null) {
		balls[wheel].position[0] += vehicleXvel;
	}

	viewController.update(event.delta);
	//balls.filter(d => d.rigid == true).forEach((ball, i) => {
	//	// if (math.norm(ball.vel) <= 0) return;
	//	while (1) {
	//		let coll = false;
	//		joints.forEach(joint => {
	//			const { v1, v2 } = joint;
	//			let c = lineCircleCollision(balls[v1].position, balls[v2].position, ball.position, ball.vel, ball.renderObj.bounds.width / 2);
	//			if (!c) return;
	//			ball.position = math.add(ball.position, math.multiply(c.axis, c.penetration));
	//		});
	//		if (!coll) break;
	//	}
	//});


};

const buildCloth = () => {
	let x = w / 2;
	let y = h / 2;
	let ww = 10;
	let l = balls.length;
	let C = 10;
	for (let i = 0; i < C; ++i) {
		for (let j = 0; j < C; ++j) {
			let pos = [x + j * ww, y + i * ww];
			addNewVertex(pos, i == 0);
			let k = l + i * C + j;
			if (j) addNewJoint(k - 1, k);
			if (i) {
				addNewJoint(k - C, k);
				// if (j) addNewJoint(k - C - 1, k);
				// if (j + 1 < C) addNewJoint(k - C + 1, k);
			}
		}
	}
};

// buildCloth();

paper.view.onFrame = (event) => {
	// Get a reference to the canvas renderObject
	// Create an empty project and a view for the canvas:
	updateGame(event);
};

