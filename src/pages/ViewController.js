import * as PaperHelper from './paperhelper';
import Engine from './engine';
import * as math from 'mathjs';
import * as paper from 'paper';
import { rotateZ } from './collision';

import { pos2point } from './util';

class ViewController {
	init(config = {}) {
		this.engine = new Engine();
		config.scale = config.scale || 1;
		this.config = config;
		this.focus = [0, 0];
	}

	getEngine() {
		return this.engine;
	}

	createBall(position, config) {
		let node = this.engine.addNode(position, config);
		let color = config.pinned ? 'green' : config.color;
		let nconfig = Object.assign({}, config, { color });
		let ball = PaperHelper.createBallObj(position, nconfig);
		ball = {
			renderObj: ball, 
			node,
			config
		};
		if (config.rigid) {
			ball.rotationObj = PaperHelper.createSegment({ color: 'grey' });
			const v1 = math.add(position, -config.radius);
			ball.rotationObj.segments[0].point = pos2point(v1);
			const v2 = math.add(position, config.radius);
			ball.rotationObj.segments[1].point = pos2point(v2);
		}
		node.setData(ball);
		return node;
	}

	addNewJoint(v1, v2, config) {
		let joint = this.engine.connectJoint(v1, v2);
		let jointInfo = {
			renderObj: PaperHelper.createSegment(config),
			config,
			joint,
		};
		joint.setData(jointInfo);
		return joint;
	}

	getScaledPosition(position, origin = [0, 0]) {
		const { scale } = this.config;
		const relativeToCenter = math.subtract(position, origin);
		const scaled = math.multiply(relativeToCenter, scale);
		const finalPos = math.add(origin, scaled);
		return finalPos;
	}

	worldToViewPort(position) {
		const bounds = paper.view.getSize();

		const center = [bounds.width / 2, bounds.height / 2];

		const pos = math.subtract(this.getScaledPosition(position), this.getScaledPosition(this.focus));
		return math.add(center, pos);
	}

	viewPortToWorld(position) {
		const bounds = paper.view.getSize();

		const center = [bounds.width / 2, bounds.height / 2];

		let pos = math.subtract(position, center);
		pos = math.divide(pos, this.config.scale);
		return math.add(pos, this.focus);
	}

	update(dt) {
		this.engine.update(dt);

		// zoom scale
		const { scale } = this.config;

		this.engine.getNodes().forEach(node => {
			const renderInfo = node.getData();
			var pos = node.getPosition();
			var viewPortPos = this.worldToViewPort(pos);
			renderInfo.renderObj.position = pos2point(viewPortPos);

			const radius = renderInfo.config.radius;
			const curRadius = renderInfo.renderObj.getBounds().width / 2;
			renderInfo.renderObj.scale(scale * radius / curRadius);

			if (renderInfo.config.rigid) {
				const circleLine = renderInfo.rotationObj;

				const v1 = rotateZ([-curRadius, 0], node.getRotation());
				const v1Scaled = math.add(viewPortPos, v1);
				circleLine.segments[0].point = pos2point(v1Scaled);

				const v2 = rotateZ([curRadius, 0], node.getRotation());
				const v2Scaled = math.add(viewPortPos, v2);
				circleLine.segments[1].point = pos2point(v2Scaled);
			}
		});

		this.engine.getJoints().forEach(joint => {
			const renderInfo = joint.getData();
			renderInfo.renderObj.segments[0].point = pos2point(this.worldToViewPort(joint.v1.getPosition()));
			renderInfo.renderObj.segments[1].point = pos2point(this.worldToViewPort(joint.v2.getPosition()));
		});
	}

}

export default ViewController;
