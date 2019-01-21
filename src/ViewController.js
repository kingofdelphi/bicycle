import * as PaperHelper from './paperhelper';
import Engine from './engine';

class ViewController {
	constructor() {
	}

	init() {
		this.engine = new Engine();
		this.createJoints();
		this.createCircle([30, 30]);
	}

	getEngine() {
		return this.engine;
	}

	createCircle(position, color = 'grey') {
		let node = this.engine.addNode(position, false, true);
		let ball = PaperHelper.createBallObj(position, color, 20);
		ball = {
			renderObj: ball, 
			node,
			color
		};
		node.setData(ball);
		return node;
	}

	createBall(position, pinned = false) {
		let node = this.engine.addNode(position, pinned, true);
		let color = pinned ? 'green' : 'black';
		let ball = PaperHelper.createBallObj(position, color);
		ball = {
			renderObj: ball, 
			node,
			color
		};
		node.setData(ball);
		return node;
	}

	addNewJoint(v1, v2) {
		let joint = this.engine.connectJoint(v1, v2);
		let jointInfo = {
			renderObj: PaperHelper.createSegment(),
			joint,
		};
		joint.setData(jointInfo);
		return joint;
	}

	createJoints() {
		let ballsAdded = [];
		const K = 20;
		for (let i = 0; i < K; ++i) {
			let position = [100, 70 + i * 20];
			let ball = this.createBall(position, i == 0 || i == K - 1);
			ballsAdded.push(ball);
		}
		for (let i = 1; i < K; ++i) {
			this.addNewJoint(ballsAdded[i - 1], ballsAdded[i]);
		}
		let lastNode = ballsAdded.slice(-1)[0];
		lastNode.setPosition([300, 170]);
	}

	update(dt) {
		this.engine.update(dt);

		this.engine.getNodes().forEach(node => {
			const renderInfo = node.getData();
			var pos = node.getPosition();
			renderInfo.renderObj.position.x = pos[0];
			renderInfo.renderObj.position.y = pos[1];
		});

		const vecToPoint = (pos) => {
			return {
				x: pos[0],
				y: pos[1]
			};
		};

		this.engine.getJoints().forEach(joint => {
			const renderInfo = joint.getData();
			renderInfo.renderObj.segments[0].point = vecToPoint(joint.v1.getPosition());
			renderInfo.renderObj.segments[1].point = vecToPoint(joint.v2.getPosition());
		});
	}


}

export default ViewController;
