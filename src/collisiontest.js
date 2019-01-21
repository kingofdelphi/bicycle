import mouseHandler from './mousehandler';
import keys from './keys';
import lineCircleCollision from './collision';

class Test {
	postInit(viewController) {
		viewController.getEngine().setConfig({
			gravity: 0
		});

		const positionA = [100, 70];
		const positionB = [300, 170];

		let ballA = viewController.createBall(positionA, true);
		let ballB = viewController.createBall(positionB, true);

		this.joint = viewController.addNewJoint(ballA, ballB, { color: 'black', thickness: 1 });

		this.circle = viewController.createBall([30, 30], { color: 'blue', radius: 20 });
		this.circle.pin();

		mouseHandler(viewController);
	}

	preUpdateCallback(viewController) {
		const { circle, joint } = this;
		while (1) {
			let coll = false;
			const { v1, v2 } = joint;
			let c = lineCircleCollision(v1.position, v2.position, circle.position, [0, 0], circle.getData().renderObj.bounds.width / 2);
			if (!c) break;
			console.log('coll');
			break;
			// ball.position = math.add(ball.position, math.multiply(c.axis, c.penetration));
		}

	}

}

export default Test;
