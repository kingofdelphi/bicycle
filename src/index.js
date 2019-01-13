
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
	return myPath;
};

var yvel = 0;
var xvel = 0;
var FLOOR = canvas.height;

var mode = 'throw';
var g = 200;
var dt = 1.0 / 60;
const autoVel = () => {
	var dx = dest.position.x - ball.position.x;
	var dy = dest.position.y - ball.position.y;
	if (dy > 0) return;
	dy *= -1;
	var vy = 8;
	var need = Math.sqrt(2 * g * dy);
	if (vy < need) vy = need + Math.random() * 80;
	var determinant = Math.sqrt(Math.max(0, vy * vy - 2 * g * dy));
	var t = vy;
	if (Math.random() < 0.5) {
		// cross while falling
		t += determinant;
	} else {
		// cross while going up
		t -= determinant;
	}
	t /= g;
	yvel = -vy;
	xvel = dx / t;
};

paper.setup(canvas);
var ball = createBall(new Point(100, 70));

var dest = createBall(new Point(800, 270), 'red');

var projSegment = createProjSegment();
projSegment.strokeColor = '#0f0ff0';
projSegment.strokeWidth = 4;
var strikeInfo = null;

const walls = [
	[new Point(0, 0), new Point(w, 0)],
	[new Point(0, h), new Point(w, h)],
	[new Point(0, 0), new Point(0, h)],
	[new Point(w, 0), new Point(w, h)]
];

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

	var oldPos = new Point(ball.position.x, ball.position.y);

	if (!strikeInfo) {
		yvel += g * dt;
		ball.position.x += xvel * dt;
		ball.position.y += yvel * dt;
	} else {
		strikeInfo.timeSinceStrike += event.delta;
	}

	const intersect_info = [];

	walls.forEach(([p1, p2]) => {
		var info = math.intersect([p1.x, p1.y], [p2.x, p2.y], [oldPos.x, oldPos.y], [ball.position.x, ball.position.y]);
		if (info) {
			info = new Point(info[0], info[1]);
			var dx = ball.position.x - oldPos.x;
			var dy = ball.position.y - oldPos.y;
			var t = dx != 0 ? (info.x - oldPos.x) / dx : (info.y - oldPos.y) / dy;
			if (t >= 0 && t <= 1) {
				intersect_info.push({
					t,
					intersectionPoint: info
				});
			}
		}
	});

	if (!strikeInfo && intersect_info.length > 0) {
		const mint = intersect_info
			.map(d => d.t)
			.reduce((a, x) => Math.min(a, x), 1);
		const wall = intersect_info.filter(d => d.t == mint)[0];
		ball.position.x = wall.intersectionPoint.x;
		ball.position.y = wall.intersectionPoint.y;

		strikeInfo = {
			xvel,
			yvel,
			timeSinceStrike: 0
		};
		xvel = 0;
		yvel = 0;

	}

	const setEndPos = (angle) => {
		var L = 40;
		projSegment.segments[1].point.x = ball.position.x + L * Math.cos(angle);
		projSegment.segments[1].point.y = ball.position.y + L * Math.sin(angle);
	};

	projSegment.segments[0].point.x = ball.position.x;
	projSegment.segments[0].point.y = ball.position.y;

	if (!downPos) {
		var angle = Math.atan2(yvel, xvel) + Math.PI;
		setEndPos(angle);
	}
	if (!downPos && strikeInfo) {
		var angle = Math.atan2(strikeInfo.yvel, strikeInfo.xvel) + Math.PI;
		var t = 5 * strikeInfo.timeSinceStrike;
		var mag = Math.hypot(strikeInfo.xvel, strikeInfo.yvel);
		var v = Math.pow(Math.exp(1), -t) * Math.PI * mag * 0.0001 * Math.sin(10 * t);
		angle += v;
		setEndPos(angle);
	}
};

ball.visibile = false;

paper.view.onFrame = (event) => {
	// Get a reference to the canvas object
	// Create an empty project and a view for the canvas:
	updateGame(event);
};

const setProjSegment = (i, point) => {
	projSegment.segments[i].point.x = point.x;
	projSegment.segments[i].point.y = point.y;
};

let downPos, curPos;
canvas.addEventListener('mousedown', (e) => {
	// clear strike info
	curPos = downPos = new Point(e.pageX, e.pageY);

	setProjSegment(0, curPos);
	setProjSegment(1, curPos);
	ball.position.x = curPos.x;
	ball.position.y = curPos.y;
});

canvas.addEventListener('mousemove', (e) => {
	if (!downPos) return;
	curPos = new Point(e.pageX, e.pageY);
	setProjSegment(1, curPos);
});

const launchArrow = (segment) => {
	var a = segment.segments[0].point;
	var b = segment.segments[1].point;
	ball.position = new Point(a.x, a.y);
	var dx = a.x - b.x;
	var dy = a.y - b.y;
	var mag = Math.sqrt(dx * dx + dy * dy);
	dx /= mag;
	dy /= mag;
	var M = 8 * Math.min(mag, 1000);
	xvel = dx * M;
	yvel = dy * M;

	//
	strikeInfo = null;
};

const setDestPos = (pos) => {
	dest.position.x = pos.x;
	dest.position.y = pos.y;
};

canvas.addEventListener('mouseup', (e) => {
	if (mode == 'throw') {
		launchArrow(projSegment);
	}
	if (mode == 'dest') {
		setDestPos(curPos);
	}
	downPos = null;
});
