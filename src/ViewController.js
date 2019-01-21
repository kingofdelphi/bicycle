import * as PaperHelper from './paperhelper';
import Engine from './engine';

class ViewController {
	constructor() {
	}

	init() {
		this.engine = new Engine();
	}

	getEngine() {
		return this.engine;
	}

	createBall(position, config) {
		let node = this.engine.addNode(position, config.pinned, true);
		let color = config.pinned ? 'green' : config.color;
		let nconfig = Object.assign({}, config, { color });
		let ball = PaperHelper.createBallObj(position, nconfig);
		ball = {
			renderObj: ball, 
			node,
			config
		};
		node.setData(ball);
		return node;
	}

	addNewJoint(v1, v2, config) {
		let joint = this.engine.connectJoint(v1, v2);
		let jointInfo = {
			renderObj: PaperHelper.createSegment(config),
			joint,
		};
		joint.setData(jointInfo);
		return joint;
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
