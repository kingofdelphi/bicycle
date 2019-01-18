
import keys from './keys';

import './styles.css';
import * as paper from 'paper';
import { Point, Path, Size } from 'paper';
import * as math from 'mathjs';

const root = document.getElementById('root');
const w = root.clientWidth;
const h = root.clientHeight;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = w;
canvas.height = h;

const createBall = (position, color = 'black', radius = 3) => {
	var myCircle = new Path.Circle(position, radius);
	myCircle.fillColor = color;	
	return myCircle;
};

const createProjSegment = () => {
	var myPath = new Path({
		segments: [[0, 0], [0, 0]]
	});
	myPath.strokeColor = '#0f0ff0';
	myPath.strokeWidth = 4;
	return myPath;
};

var FLOOR = canvas.height;

var dt = 1.0 / 60;
var L = 20;

paper.setup(canvas);
var balls = [];
for (let i = 0; i < 20; ++i) {
	var position = [100, 70 + i * L];
	var ball = createBall(new Point(position[0], position[1]));
	balls.push({ 
		obj: ball, 
		position,
		velocity: [0, 0],
		angVel: 0 
	});
}

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

const updateGame = (event) => {
	if (keys['d']) {
		mode = 'dest';
	}
	if (keys['t']) {
		mode = 'throw';
	}
	if (keys['s']) {
		strikeInfo = null;
		autoVel();
	}
	var iter = 10;
	var DT = dt / iter;
	for (let fr = 0; fr < iter; ++fr) {
		var g = 100;
		for (let i = 1; i < balls.length; ++i) {
			balls[i].velocity = math.add(balls[i].velocity, [0, g * DT]);
			var dVel = math.multiply(balls[i].velocity, DT);
			balls[i].position = math.add(balls[i].position, dVel);
		}
		for (let i = 1; i < balls.length; ++i) {
			var pa = balls[i - 1].position;
			var pb = balls[i].position;

			var R = math.subtract(pa, pb).concat(0);

			var force = 0;
			var F = [force, force + g, 0];
			var angAccln = math.cross(R, F)[2];

			var m = math.norm(R);
			if (m != 0) {
				angAccln /= m;
			}

			balls[i].angVel += angAccln * DT;
			// console.log(balls[i].angVel);
			// var tangent = [-R[1], R[0]];
			// var angVel = math.multiply(tangent, balls[i].angVel * DT);
			// balls[i].velocity = math.add(balls[i].velocity, angVel);

			var vab = math.subtract(pb, pa);
			var uab = math.divide(vab, math.norm(vab));
			vab = math.add(vab, math.multiply(uab, L - math.norm(vab)));
			vab = rotate(vab, -balls[i].angVel * DT);
			pb = math.add(pa, vab);
			balls[i].position = pb;
		}
	}

	balls.forEach(ball => {
		ball.obj.position.x = ball.position[0];
		ball.obj.position.y = ball.position[1];
	});

};

ball.visibile = false;

paper.view.onFrame = (event) => {
	// Get a reference to the canvas object
	// Create an empty project and a view for the canvas:
	updateGame(event);
};

canvas.addEventListener('mousedown', (e) => {
});

canvas.addEventListener('mousemove', (e) => {
	var curPos = [e.pageX, e.pageY];
	balls[0].position = curPos;
});

canvas.addEventListener('mouseup', (e) => {
});
