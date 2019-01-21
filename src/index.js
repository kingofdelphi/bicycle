
import keys from './keys';

import './styles.css';
import * as paper from 'paper';
import { Point, Path, Size } from 'paper';
import * as math from 'mathjs';
import Engine from './engine';

const root = document.getElementById('canvas-wrapper');
const w = root.clientWidth;
const h = root.clientHeight;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = w;
canvas.height = h;

const createBallObj = (position, color = 'black', radius = 4) => {
	let myCircle = new Path.Circle(position, radius);
	myCircle.fillColor = color;	
	return myCircle;
};

const createSegment = () => {
	let myPath = new Path({
		segments: [[0, 0], [0, 0]]
	});
	myPath.strokeColor = 'black';
	myPath.strokeWidth = 2;
	return myPath;
};

let FLOOR = canvas.height;

let engine = new Engine();

paper.setup(canvas);

let createCircle = (position, color = 'grey') => {
	let node = engine.addNode(position, false, true);
	let ball = createBallObj(position, color, 20);
	ball = {
		renderObj: ball, 
		node,
		color
	};
	node.setData(ball);
	return node;
};

let circ = createCircle([30, 30]);

let createBall = (position, pinned = false) => {
	let node = engine.addNode(position, pinned, true);
	let color = pinned ? 'green' : 'black';
	let ball = createBallObj(position, color);
	ball = {
		renderObj: ball, 
		node,
		color
	};
	node.setData(ball);
	return node;
};

let K = 20;

const addNewJoint = (v1, v2) => {
	let joint = engine.connectJoint(v1, v2);
	let jointInfo = {
		renderObj: createSegment(),
		joint,
	};
	joint.setData(jointInfo);
	return joint;
};

let createJoints = () => {
	let idx = engine.getNodes().length;
	let ballsAdded = [];
	for (let i = 0; i < K; ++i) {
		let position = [100, 70 + i * 20];
		let ball = createBall(position, i == 0 || i == K - 1);
		ballsAdded.push(ball);
	}
	for (let i = 1; i < K; ++i) {
		addNewJoint(ballsAdded[i - 1], ballsAdded[i]);
	}
	let lastNode = ballsAdded.slice(-1)[0];
	lastNode.setPosition([300, 170]);
};

createJoints();

const rotate = (vec, angle) => {
	let cs = Math.cos(angle);
	let si = Math.sin(angle);
	let rot_mat = [
		[cs, -si],
		[si, cs]
	];
	let c = math;
	return math.multiply(rot_mat, vec);
};

let wheel = null;
let vehicleXvel = 0;
const updateGame = (event) => {
	let dt = event.delta;
	let gravity = 10.9;
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

	engine.update(event.delta);

	engine.getNodes().forEach(node => {
		const renderInfo = node.getData();
		var pos = node.getPosition();
		renderInfo.renderObj.position.x = pos[0];
		renderInfo.renderObj.position.y = pos[1];
	});

	const vecToPoint = (pos) => {
		return {
			x: pos[0],
			y: pos[1]
		};
	};

	engine.getJoints().forEach(joint => {
		const renderInfo = joint.getData();
		renderInfo.renderObj.segments[0].point = vecToPoint(joint.v1.getPosition());
		renderInfo.renderObj.segments[1].point = vecToPoint(joint.v2.getPosition());
	});

};

const addNewVertex = (position, pinned = false) => {
	var ball = createBall(position, pinned);
	return ball;
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

const getNearestBall = (pos) => {
	let mindist = 1e9;
	let chosen;
	engine.getNodes().forEach((node) => {
		let ball = node.data;
		let ballPos = [ball.renderObj.position.x, ball.renderObj.position.y];
		let dist = math.distance(ballPos, pos);
		if (dist < mindist) {
			chosen = node;
			mindist = dist;
		}
	});
	return chosen;
};

const getMode = () => {
	return document.querySelector('.mode-container input[name="mode"]:checked').value;
};

let changeSelection = (node, isSelected) => {
	let renderInfo = node.getData();
	if (isSelected) {
		renderInfo.renderObj.fillColor = 'red';
		return;
	}
	if (node.isPinned()) {
		node.getData().renderObj.fillColor = 'green';
		return;
	}
	renderInfo.renderObj.fillColor = renderInfo.color;
};

let downPos;
let selVertex = null;
let connectSegment = createSegment();

const getMousePos = (evt) => {
    let rect = canvas.getBoundingClientRect();
	return [
		evt.clientX - rect.left,
		evt.clientY - rect.top
    ];
};

canvas.addEventListener('mousedown', (e) => {
	let curPos = getMousePos(e);
	downPos = curPos;
	let mode = getMode();
	if (mode == 'connect') {
		if (shouldConnectToExistingNode(curPos)) {
			selVertex = getNearestBall(curPos);
		} else {
			selVertex = addNewVertex(curPos, true);
		}
		connectSegment.visible = true;
		connectSegment.segments[0].point = selVertex.getPosition();
		connectSegment.segments[1].point = downPos;
	}
	if (mode == 'pull') {
		selVertex = getNearestBall(curPos);
	}
	if (mode == 'circle') {
		createCircle(downPos);
	}
	if (mode == 'backwheel') {
		wheel = getNearestBall(curPos);
	}

});

let shouldConnectToExistingNode = (destPos) => {
	let nearest = getNearestBall(destPos);
	let dist = math.distance(nearest.getPosition(), destPos);
	return dist < 10;
};

let candidateVertex = null;
canvas.addEventListener('mousemove', (e) => {
	let curPos = getMousePos(e);
	let mode = getMode();
	if (selVertex == null) {
		if (candidateVertex != null) {
			changeSelection(candidateVertex, false);
		}
		candidateVertex = getNearestBall(curPos);
		changeSelection(candidateVertex, true);
	}
	if (mode === 'pull') {
		if (selVertex != null) {
			selVertex.setPosition(curPos);
		}
	}
	if (mode == 'connect') {
		if (selVertex != null) {
			let pos = shouldConnectToExistingNode(curPos) ? getNearestBall(curPos).getPosition() : curPos;
			connectSegment.segments[1].point = pos;
		}
	}
});

canvas.addEventListener('mouseup', (e) => {
	let curPos = getMousePos(e);
	const mode = getMode();
	if (mode === 'connect') {
		let v2;
		if (!shouldConnectToExistingNode(curPos)) {
			v2 = addNewVertex(curPos, true);
		} else {
			v2 = getNearestBall(curPos);
		}
		if (selVertex != v2) {
			// disallow connecting same vertex
			addNewJoint(selVertex, v2); 
		}
		connectSegment.visible = false;
		changeSelection(selVertex, false);
	}
	if (mode == 'pin') {
		let nearest = getNearestBall(curPos);
		if (nearest.isPinned()) {
			nearest.unpin();
		} else {
			nearest.pin();
		}
	}
	downPos = null;
	selVertex = null;
});
