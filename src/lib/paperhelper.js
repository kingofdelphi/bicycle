import {  Path, } from 'paper';

export const createBallObj = (position, config = {}) => {
	if (config.radius == null) {
		Object.assign(config, { radius: 4 });
	}
	if (!config.color) {
		Object.assign(config, { color: 'black' });
	}
	let myCircle = new Path.Circle(position, config.radius);
	myCircle.fillColor = config.color;	
	return myCircle;
};

export const createSegment = (config = {}) => {
	if (config.thickness == null) {
		Object.assign(config, { thickness: 2 });
	}
	if (!config.color) {
		Object.assign(config, { color: 'black' });
	}
	let myPath = new Path({
		segments: [[0, 0], [0, 0]]
	});
	myPath.strokeColor = config.color;
	myPath.strokeWidth = config.thickness;
	return myPath;
};

export const createRectangle = (config = {}) => {
	if (config.thickness == null) {
		Object.assign(config, { thickness: 0 });
	}
	if (!config.color) {
		Object.assign(config, { color: 'black' });
	}
	let myPath = new Path({
		segments: [[0, 0], [50, 0], [50, 100], [0, 100]],
	});
	myPath.strokeColor = config.color;
	myPath.fillColor = config.fillColor
	myPath.strokeWidth = config.thickness;
	return myPath;
};
