import * as PaperHelper from './paperhelper';
import * as math from 'mathjs';

const getMode = () => {
	return document.querySelector('.mode-container input[name="mode"]:checked').value;
};

const MouseHandler = (viewController) => {
	const engine = viewController.getEngine();
	const addNewVertex = (position, pinned = false) => {
		var ball = viewController.createBall(position, { pinned, color: 'black', radius: 2 });
		return ball;
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

	const changeSelection = (node, isSelected) => {
		let renderInfo = node.getData();
		if (isSelected) {
			renderInfo.renderObj.fillColor = 'red';
			return;
		}
		if (node.isPinned()) {
			node.getData().renderObj.fillColor = 'green';
			return;
		}
		renderInfo.renderObj.fillColor = renderInfo.config.color;
	};

	let downPos;
	let selVertex = null;
	const connectSegment = PaperHelper.createSegment();

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
			if (math.distance(selVertex.getPosition(), curPos) > 20) selVertex = null;
		}
		if (mode == 'circle') {
			viewController.createBall(downPos, { color: 'grey', radius: 20, rigid: true });
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
				selVertex.oldPosition = curPos;
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
				selVertex.getData().config.ignoreNormal = true;
			} else {
				v2 = getNearestBall(curPos);
			}
			if (selVertex != v2) {
				// disallow connecting same vertex
				viewController.addNewJoint(selVertex, v2, { color: 'grey', thickness: 2, collidable: true }); 
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

};

export default MouseHandler;
