
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

const createBallObj = (position, color = 'black', radius = 3) => {
	var myCircle = new Path.Circle(position, radius);
	myCircle.fillColor = color;	
	return myCircle;
};

const createSegment = () => {
	var myPath = new Path({
		segments: [[0, 0], [0, 0]]
	});
	myPath.strokeColor = 'black';
	myPath.strokeWidth = 4;
	return myPath;
};

var FLOOR = canvas.height;

paper.setup(canvas);
var balls = [];

var createBall = (position, pinned = false) => {
	var ball = createBallObj(position);
	return { 
		obj: ball, 
		position,
		oldPos: position,
		pinned
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
	for (let i = 1; i < 20; ++i) {
		var joint = {
			obj: createSegment(),
			v1: i - 1,
			v2: i,
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

const updateGame = (event) => {
	if (keys['s']) {
	}
	var dt = event.delta;
	var DT = dt;
	var g = 1.9;
	balls.forEach(ball => {
		if (!ball.pinned) {
			var vel = math.subtract(ball.position, ball.oldPos);
			ball.oldPos = ball.position;

			var dv = math.multiply(vel, 0.99);
			dv = math.add(dv, [0, g * DT]);
			ball.position = math.add(ball.position, dv);
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
	ball.obj.fillColor = 'black';
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
	selVertex = getNearestBall(curPos);
	var mode = getMode();
	if (mode == 'connect') {
		connectSegment.segments[0].point = balls[selVertex].position;
		connectSegment.segments[1].point = downPos;
		connectSegment.visible = true;
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
		if (selVertex) {
			balls[selVertex].position = curPos;
		}
	}
	if (mode == 'connect') {
		if (selVertex) {
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
			balls.push(createBall(curPos, true));
			v2 = balls.length - 1;
		} else {
			v2 = getNearestBall(curPos);
		}
		if (selVertex != v2) {
			// disallow connecting same vertex
			var joint = {
				obj: createSegment(),
				v1: selVertex,
				v2
			};
			Object.assign(joint, {
				length: math.distance(balls[joint.v1].position, balls[joint.v2].position)
			});
			joints.push(joint);
		}
		connectSegment.visible = false;
	}
	if (mode == 'pin') {
		var nearest = getNearestBall(curPos);
		pinVertex(balls[nearest], !balls[nearest].pinned);
	}
	changeSelection(balls[selVertex], false);
	downPos = null;
	selVertex = null;
});
