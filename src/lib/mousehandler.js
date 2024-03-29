import * as math from './math';

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
			let dist = math.distance(ball.renderObj.position, pos);
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
	const connectSegment = {
		vertex1: [0, 0],
		vertex2: [0, 0]
	}

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
				selVertex = addNewVertex(viewController.viewPortToWorld(curPos), true);
				viewController.nodes.push(selVertex.getPosition());
			}
			connectSegment.visible = true;
			connectSegment.vertex1 = curPos
			connectSegment.vertex2 = downPos
		}
		if (mode == 'pull') {
			selVertex = getNearestBall(curPos);
			if (math.distance(selVertex.getData().renderObj.position, curPos) > 20) {
				selVertex = null;
			}
		}
		if (mode == 'circle') {
			viewController.createBall(viewController.viewPortToWorld(downPos), { color: 'grey', radius: 20, rigid: true });
		}
		if (mode == 'backwheel') {
			wheel = getNearestBall(curPos);
		}

	});

	let shouldConnectToExistingNode = (destPos) => {
		let nearest = getNearestBall(destPos);
		let dist = math.distance(nearest.getData().renderObj.position, destPos)
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
				const worldPos = viewController.viewPortToWorld(curPos);
				selVertex.setPosition(worldPos);
				selVertex.oldPosition = worldPos;
			}
		}
		if (mode == 'connect') {
			if (selVertex != null) {
				const pos = shouldConnectToExistingNode(curPos) ? getNearestBall(curPos).getData().renderObj.position : curPos;
				connectSegment.vertex2 = pos;
			}
		}
	});

	canvas.addEventListener('mouseup', (e) => {
		let curPos = getMousePos(e);
		const mode = getMode();
		if (mode === 'connect') {
			let v2;
			if (!shouldConnectToExistingNode(curPos)) {
				v2 = addNewVertex(viewController.viewPortToWorld(curPos), true);
				viewController.nodes.push(v2.getPosition());
			} else {
				v2 = getNearestBall(curPos);
			}
			if (selVertex != v2) {
				// disallow connecting same vertex
				viewController.addNewJoint(selVertex, v2, { color: 'grey', thickness: 4, collidable: true }); 
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
