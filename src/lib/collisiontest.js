import mouseHandler from './mousehandler';
import keys from './keys';
import lineCircleCollision from './collision';
import * as math from 'mathjs';

class Test {
	postInit(viewController) {
		viewController.getEngine().setConfig({
			gravity: 0
		});

		const positionA = [100, 70];
		const positionB = [100, 170];

		let config = { pinned: true, color: 'black', radius: 2 };
		let ballA = viewController.createBall(positionA, config);
		let ballB = viewController.createBall(positionB, config);

		this.joint = viewController.addNewJoint(ballA, ballB, { color: 'black', thickness: 1 });

		this.circle = viewController.createBall([60, 100], { color: 'blue', radius: 20 });
		this.circle.pin();

		mouseHandler(viewController);
	}

	preUpdateCallback(viewController) {
		const { circle, joint } = this;

		const { v1, v2 } = joint;
		let c = lineCircleCollision(v1.position, v2.position, true, true, circle.position, [0, 0], circle.getData().renderObj.bounds.width / 2);
		if (c) {
			console.table(c)
			circle.position = math.add(circle.position, math.multiply(c.axis, c.penetration));
		}

	}

}

export default Test;
