import { Point, Path, Size } from 'paper';

export const createBallObj = (position, color = 'black', radius = 4) => {
	let myCircle = new Path.Circle(position, radius);
	myCircle.fillColor = color;	
	return myCircle;
};

export const createSegment = () => {
	let myPath = new Path({
		segments: [[0, 0], [0, 0]]
	});
	myPath.strokeColor = 'black';
	myPath.strokeWidth = 2;
	return myPath;
};
