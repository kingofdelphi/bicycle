import mouseHandler from './mousehandler';
import keys from './keys';

class Demo {
	postInit(viewController) {
		this.viewController = viewController;
		const createJoints = () => {
			let ballsAdded = [];
			const K = 10;
			const L = 40;
			for (let i = 0; i < K; ++i) {
				let position = [100, 70 + i * L];
				const config = {
					pinned: i == 0 || i == K - 1,
					color: 'black',
					radius: 2
				};
				let ball = viewController.createBall(position, config);
				ballsAdded.push(ball);
			}
			for (let i = 1; i < K; ++i) {
				viewController.addNewJoint(ballsAdded[i - 1], ballsAdded[i], { color: 'grey', thickness: 2 });
			}
			let lastNode = ballsAdded.slice(-1)[0];
			lastNode.setPosition([300, 170]);
		}

		createJoints();

		const config = {
			pinned: true,
			color: 'black',
			radius: 2
		};

		const positionA = [0, 470];
		const positionB = [800, 470];

		let ballA = viewController.createBall(positionA, config);
		let ballB = viewController.createBall(positionB, config);

		viewController.addNewJoint(ballA, ballB, { color: 'black', thickness: 1 });
		this.addBigCircle([30, 30]);


		mouseHandler(viewController);
	};

	addBigCircle(position) {
		const config = {
			color: 'silver',
			rigid: true,
			pinned: false,
			radius: 20
		};
		this.viewController.createBall(position, config);
	}

	preUpdateCallback() {
		let vehicleXvel = 0;
		let wheel = null;
		if (keys['d']) {
			if (wheel != null) {
				vehicleXvel += 3 * dt;
			}
		}
		if (keys['a']) {
			if (wheel != null) {
				vehicleXvel -= 3 * dt;
			}
		}
		vehicleXvel *= 0.99;
		if (wheel != null) {
			balls[wheel].position[0] += vehicleXvel;
		}
	}
}

const buildCloth = () => {
	let x = w / 2;
	let y = h / 2;
	let ww = 10;
	let l = balls.length;
	let C = 10;
	for (let i = 0; i < C; ++i) {
		for (let j = 0; j < C; ++j) {
			let pos = [x + j * ww, y + i * ww];
			addNewVertex(pos, i == 0);
			let k = l + i * C + j;
			if (j) addNewJoint(k - 1, k);
			if (i) {
				addNewJoint(k - C, k);
				// if (j) addNewJoint(k - C - 1, k);
				// if (j + 1 < C) addNewJoint(k - C + 1, k);
			}
		}
	}
};

// buildCloth();

export default Demo;
