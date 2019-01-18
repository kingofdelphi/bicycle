
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
for (let i = 0; i < 6; ++i) {
	var ball = createBall(new Point(100, 70 + i * L));
	balls.push({ obj: ball, velocity: new Point(0, 0), oldPos: new Point(100, 70 + i * L) });
}

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
	var iter = 1;
	var DT = 20 * dt / iter;
	for (let fr = 0; fr < iter; ++fr) {
		for (let i = 1; i < balls.length; ++i) {
			var pa = balls[i - 1].obj.position;
			var pb = balls[i].obj.position;
			var dx = pa.x - pb.x;
			var dy = pa.y - pb.y;
			var m = Math.hypot(dx, dy);
			if (dx == 0 && dy == 0) m = 0;
			var k = 1;
			var force = k * (m - L);
			var mass = 10;
			var u = m == 0 ? 0 : dx / m;
			var v = m == 0 ? 0 : dy / m;
			var vx = balls[i].obj.position.x - balls[i].oldPos.x;
			var vy = balls[i].obj.position.y - balls[i].oldPos.y;
			vx *= 0.8;
			vy *= 0.8;
			balls[i].oldPos = new Point(balls[i].obj.position.x, balls[i].obj.position.y);
			balls[i].obj.position.x += vx + (force * u * DT - .03 * vx) / mass;
			balls[i].obj.position.y += vy + (force * v * DT - .03 * vy) / mass + 0.3;
		}
	}

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
	var curPos = new Point(e.pageX, e.pageY);
	balls[0].obj.position = curPos;
});

canvas.addEventListener('mouseup', (e) => {
});
