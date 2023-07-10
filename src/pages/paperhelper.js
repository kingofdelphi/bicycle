import { Point, Path, Size } from 'paper';

export const createBallObj = (position, config = {}) => {
	if (!config.radius) {
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
	if (!config.thickness) {
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
