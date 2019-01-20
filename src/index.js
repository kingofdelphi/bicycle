
import keys from './keys';

import './styles.css';
import * as paper from 'paper';
import { Point, Path, Size } from 'paper';
import * as math from 'mathjs';

const root = document.getElementById('canvas-wrapper');
const w = root.clientWidth;
const h = root.clientHeight;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = w;
canvas.height = h;

const createBallObj = (position, color = 'black', radius = 4) => {
	var myCircle = new Path.Circle(position, radius);
	myCircle.fillColor = color;	
	return myCircle;
};

const createSegment = () => {
	var myPath = new Path({
		segments: [[0, 0], [0, 0]]
	});
	myPath.strokeColor = 'black';
	myPath.strokeWidth = 2;
	return myPath;
};

var FLOOR = canvas.height;

paper.setup(canvas);
var balls = [];

var createCircle = (position, color = 'grey') => {
	var ball = createBallObj(position, color, 20);
	return {
		rigid: true,
		obj: ball, 
		position,
		oldPos: position,
		color
	};
};

balls.push(createCircle([200, 870]));

var createBall = (position, pinned = false) => {
	var color = pinned ? 'green' : 'black';
	var ball = createBallObj(position, color);
	return {
		obj: ball, 
		position,
		oldPos: position,
		pinned,
		color
	};
};

var createVertices = () => {
	for (let i = 0; i < 20; ++i) {
		var position = [100, 70 + i * 20];
		balls.push(createBall(position, i == 0));
	}
};

var joints = [];
var createJoints = () => {
	var idx = balls.length;
	for (let i = 1; i < 20; ++i) {
		var joint = {
			obj: createSegment(),
			v1: idx + i - 1,
			v2: idx + i,
			length: 20
		};
		joints.push(joint);
	}
};

createJoints();
createVertices();

const rotate = (vec, angle) => {
	var cs = Math.cos(angle);
	var si = Math.sin(angle);
	var rot_mat = [
		[cs, -si],
		[si, cs]
	];
	var c = math;
	return math.multiply(rot_mat, vec);
};

const solveConstraints = () => {
	joints.forEach(joint => {
		var ballA = balls[joint.v1];
		var ballB = balls[joint.v2];
		var pa = ballA.position;
		var pb = ballB.position;

		var vab = math.subtract(pb, pa);
		var uab = math.divide(vab, math.norm(vab));
		var v = math.multiply(uab, -(joint.length - math.norm(vab)) / 2);
		if (!ballA.pinned) {
			ballA.position = math.add(pa, math.multiply(v, 1));
		}
		if (!ballB.pinned) {
			ballB.position = math.add(pb, math.multiply(v, -1));
		}
	});
};

var wheel = null;
var vehicleXvel = 0;
const updateGame = (event) => {
	var dt = event.delta;
	var gravity = 10.9;
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
	balls.forEach((ball, i) => {
		if (!ball.pinned) {
			var vel = math.subtract(ball.position, ball.oldPos);
			ball.oldPos = ball.position;

			var dv = math.multiply(vel, 0.99);
			dv = math.add(dv, [0, gravity * dt]);
			ball.position = math.add(ball.position, dv);
			var r = ball.obj.bounds.width / 2;
			var s = 0.6;
			var collide = false;
			if (ball.position[0] - r < 0) {
				ball.position[0] = r;
				dv[1] *= -1;
				ball.oldPos = math.add(ball.position, math.multiply(dv, s));
				if (i == wheel) {
					vehicleXvel *= -0.9;
				}
			}
			if (ball.position[0] + r > w) {
				ball.position[0] = w - r;
				dv[1] *= -1;
				ball.oldPos = math.add(ball.position, math.multiply(dv, s));
				if (i == wheel) {
					vehicleXvel *= -0.9;
				}
			}
			if (ball.position[1] - r < 0) {
				ball.position[1] = r;
				dv[0] *= -1;
				ball.oldPos = math.add(ball.position, math.multiply(dv, s));
			}
			if (ball.position[1] + r > h) {
				ball.position[1] = h - r;
				dv[0] *= -1;
				ball.oldPos = math.add(ball.position, math.multiply(dv, s));
			}
		}
	});

	var iter = 20;
	while (iter--) {
		solveConstraints();
	}

	balls.forEach(ball => {
		ball.obj.position.x = ball.position[0];
		ball.obj.position.y = ball.position[1];
	});

	const vecToPoint = (pos) => {
		return {
			x: pos[0],
			y: pos[1]
		};
	};

	joints.forEach(joint => {
		joint.obj.segments[0].point = vecToPoint(balls[joint.v1].position);
		joint.obj.segments[1].point = vecToPoint(balls[joint.v2].position);
	});

};

var addNewJoint = (v1, v2) => {
	var joint = {
		obj: createSegment(),
		v1,
		v2
	};
	Object.assign(joint, {
		length: math.distance(balls[joint.v1].position, balls[joint.v2].position)
	});
	joints.push(joint);
};

var addNewVertex = (position, pinned = false) => {
	balls.push(createBall(position, pinned));
	return balls.length - 1;
};

const buildCloth = () => {
	let x = w / 2;
	let y = h / 2;
	let ww = 10;
	let l = balls.length;
	let C = 10;
	for (let i = 0; i < C; ++i) {
		for (let j = 0; j < C; ++j) {
			var pos = [x + j * ww, y + i * ww];
			addNewVertex(pos, i == 0);
			var k = l + i * C + j;
			if (j) addNewJoint(k - 1, k);
			if (i) {
				addNewJoint(k - C, k);
				// if (j) addNewJoint(k - C - 1, k);
				// if (j + 1 < C) addNewJoint(k - C + 1, k);
			}
		}
	}
};

buildCloth();

paper.view.onFrame = (event) => {
	// Get a reference to the canvas object
	// Create an empty project and a view for the canvas:
	updateGame(event);
};

const getNearestBall = (pos) => {
	var mindist = 1e9;
	var chosen;
	balls.forEach((ball, i) => {
		var dist = math.distance(ball.position, pos);
		if (dist < mindist) {
			chosen = i;
			mindist = dist;
		}
	});
	return chosen;
};

const getMode = () => {
	return document.querySelector('.mode-container input[name="mode"]:checked').value;
};

var pinVertex = (ball, isPinned) => {
	var color = isPinned ? 'green' : 'black';
	ball.obj.fillColor = color;
	ball.pinned = isPinned;
};

var changeSelection = (ball, isSelected) => {
	if (isSelected) {
		ball.obj.fillColor = 'red';
		return;
	}
	if (ball.pinned) {
		pinVertex(ball, ball.pinned);
		return;
	}
	ball.obj.fillColor = ball.color;
};

var downPos;
var selVertex = null;
var connectSegment = createSegment();

const getMousePos = (evt) => {
    var rect = canvas.getBoundingClientRect();
	return [
		evt.clientX - rect.left,
		evt.clientY - rect.top
    ];
};

canvas.addEventListener('mousedown', (e) => {
	var curPos = getMousePos(e);
	downPos = curPos;
	var mode = getMode();
	if (mode == 'connect') {
		if (shouldConnectToExistingNode(curPos)) {
			selVertex = getNearestBall(curPos);
		} else {
			selVertex = addNewVertex(curPos, true);
		}
		connectSegment.visible = true;
		connectSegment.segments[0].point = balls[selVertex].position;
		connectSegment.segments[1].point = downPos;
	}
	if (mode == 'pull') {
		selVertex = getNearestBall(curPos);
	}
	if (mode == 'circle') {
		balls.push(createCircle(downPos));
	}
	if (mode == 'backwheel') {
		wheel = getNearestBall(curPos);
	}

});

var shouldConnectToExistingNode = (destPos) => {
	var nearest = getNearestBall(destPos);
	var dist = math.distance(balls[nearest].position, destPos);
	return dist < 10;
};

var candidateVertex = null;
canvas.addEventListener('mousemove', (e) => {
	var curPos = getMousePos(e);
	var mode = getMode();
	if (selVertex == null) {
		if (candidateVertex != null) {
			changeSelection(balls[candidateVertex], false);
		}
		candidateVertex = getNearestBall(curPos);
		changeSelection(balls[candidateVertex], true);
	}
	if (mode === 'pull') {
		if (selVertex != null) {
			balls[selVertex].position = curPos;
		}
	}
	if (mode == 'connect') {
		if (selVertex != null) {
			var pos = shouldConnectToExistingNode(curPos) ? balls[getNearestBall(curPos)].position : curPos;
			connectSegment.segments[1].point = pos;
		}
	}
});

canvas.addEventListener('mouseup', (e) => {
	var curPos = getMousePos(e);
	const mode = getMode();
	if (mode === 'connect') {
		var v2;
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
		changeSelection(balls[selVertex], false);
	}
	if (mode == 'pin') {
		var nearest = getNearestBall(curPos);
		pinVertex(balls[nearest], !balls[nearest].pinned);
	}
	downPos = null;
	selVertex = null;
});
