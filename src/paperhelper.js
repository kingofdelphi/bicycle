import { Point, Path, Size } from 'paper';

export const createBallObj = (position, config = { color: 'black', radius: 4 }) => {
	let myCircle = new Path.Circle(position, config.radius);
	myCircle.fillColor = config.color;	
	return myCircle;
};

export const createSegment = (config = { color: 'black', thickness: 2 }) => {
	let myPath = new Path({
		segments: [[0, 0], [0, 0]]
	});
	myPath.strokeColor = config.color;
	myPath.strokeWidth = config.thickness;
	return myPath;
};
