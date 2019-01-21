import mouseHandler from './mousehandler';
import * as paper from 'paper';
import keys from './keys';

class Demo {
	postInit(viewController) {
		this.viewController = viewController;
		const wallHelper = (positionA, positionB) => {
			const config = {
				pinned: true,
				color: 'black',
				radius: 2
			};

			const ballA = viewController.createBall(positionA, Object.assign({}, config));
			const ballB = viewController.createBall(positionB, config);

			return viewController.addNewJoint(ballA, ballB, { thickness: 1, collidable: true });
		};
		const createJoints = () => {
			let ballsAdded = [];
			const K = 10;
			const L = 40;
			for (let i = 0; i < K; ++i) {
				let position = [100, 70 + i * L];
				const config = {
					pinned: i == 0 || i == K - 1,
					color: 'black',
					radius: 2,
					ignoreNormal: i > 0 && i + 1 < K
				};
				let ball = viewController.createBall(position, config);
				ballsAdded.push(ball);
			}
			for (let i = 1; i < K; ++i) {
				viewController.addNewJoint(ballsAdded[i - 1], ballsAdded[i], { collidable: true, color: 'grey', thickness: 2 });
			}
			let lastNode = ballsAdded.slice(-1)[0];
			lastNode.setPosition([300, 170]);
		}

		createJoints();

		let config = {
			pinned: true,
			color: 'black',
			radius: 2
		};
		const bounds = paper.view.getSize();
		wallHelper([0, bounds.height], [bounds.width, bounds.height]);
		wallHelper([bounds.width, 0], [bounds.width, bounds.height]);
		wallHelper([0, 0], [bounds.width, 0]);
		wallHelper([0, 0], [0, bounds.height]);

		this.addBigCircle([30, 30]);

		config = Object.assign({}, config);
		config.rigid = true;
		config.radius = 10;
		config.pinned = false;
		const positionA = [40, 300];
		const positionB = [90, 300];
		const ballA = viewController.createBall(positionA, Object.assign({}, config));
		const ballB = viewController.createBall(positionB, config);

		this.wheel = viewController.addNewJoint(ballA, ballB, { thickness: 1, collidable: true });
		this.vehicleXvel = 0;

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

	preUpdateCallback(event) {
		let wheel = this.wheel;
		const dt = event.delta;
		const vx = .05;
		if (keys['d']) {
			if (wheel != null) {
				this.vehicleXvel += vx * dt;
			}
		}
		if (keys['a']) {
			if (wheel != null) {
				this.vehicleXvel -= vx * dt;
			}
		}
		this.vehicleXvel *= 0.99;
		if (wheel != null) {
			this.wheel.v1.position[0] += this.vehicleXvel;
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
