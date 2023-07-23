import mouseHandler from './mousehandler';
import * as paper from 'paper';
import keys from './keys';
import * as PaperHelper from './paperhelper';
import * as math from 'mathjs';
import { rotateZ } from './collision';
import nodes from './level';

class Demo {
	buildBicycle() {
		const config = {
			pinned: true,
			color: 'black',
			radius: 2
		};
		config.rigid = true;
		config.radius = 14;
		config.pinned = false;
		const positionA = [80, 300];
		const positionB = [130, 300];
		const ballA = this.viewController.createBall(positionA, Object.assign({}, config, { color: null }));
		const ballB = this.viewController.createBall(positionB, Object.assign({}, config, { color: null }));

		const thickness = 2;
		this.wheel = this.viewController.addNewJoint(ballA, ballB, { thickness, collidable: true, weightageA: 0.5, weightageB: .5 });
		this.wheel.getData().renderObj.visible = false;

		// remove wheel solid color
		ballA.getData().renderObj.fillColor = null;
		ballA.getData().renderObj.strokeColor = 'black';
		ballA.getData().renderObj.strokeWidth = 4;

		ballB.getData().renderObj.fillColor = null;
		ballB.getData().renderObj.strokeColor = 'black';
		ballB.getData().renderObj.strokeWidth = 4;

		const rearAngleToSeat = -Math.PI / 6 * 2;
		const RR = 30;
		const positionRear = math.add(positionA, math.multiply([Math.cos(rearAngleToSeat), Math.sin(rearAngleToSeat)], RR));
		const ballRear = this.viewController.createBall(positionRear, { radius: 0, pinned: false });

		// back wheel to seat
		this.viewController.addNewJoint(ballA, ballRear, { thickness, collidable: true, weightageA: 0, weightageB: 1 });
		this.viewController.engine.addAngularConstraint(ballB, ballA, ballRear, rearAngleToSeat, 0, 1);

		// front wheel to handle
		const frontWheelToHandle = -Math.PI / 6 * 2.2;
		const RR2 = 23;
		const handlePos = math.add(positionB, math.multiply([Math.cos(frontWheelToHandle), Math.sin(frontWheelToHandle)], RR2));
		const ballHandle = this.viewController.createBall(handlePos, { radius: 0, pinned: false });
		this.viewController.addNewJoint(ballB, ballHandle, { thickness, collidable: true, weightageA: 0, weightageB: 1 });
		this.viewController.engine.addAngularConstraint(ballA, ballB, ballHandle, -frontWheelToHandle, 0, 1);

		// pedal joint
		const pedalPos = math.add(positionA, [config.radius + 12, 0]);
		const ballPedal = this.viewController.createBall(pedalPos, { radius: 0, pinned: false });
		this.viewController.addNewJoint(ballA, ballPedal, { thickness, collidable: true, weightageA: 0, weightageB: 1 });
		this.viewController.engine.addAngularConstraint(ballB, ballA, ballPedal, 0, 0, 1);

		// joint to handle
		this.viewController.addNewJoint(ballPedal, ballHandle, { thickness, collidable: true, weightageA: 0, weightageB: 1 });

		//pedal to rear seat
		this.viewController.addNewJoint(ballPedal, ballRear, { thickness, collidable: true, weightageA: 0, weightageB: 1 });

		//front handle to rear seat
		this.viewController.addNewJoint(ballHandle, ballRear, { thickness, collidable: true, weightageA: 0, weightageB: 1 });

		//actual seat
		const seatHeight = 8;
		const seatPos = math.add(positionRear, [0, -seatHeight]);
		const ballSeat = this.viewController.createBall(seatPos, { radius: 0, pinned: false });
		this.viewController.addNewJoint(ballSeat, ballRear, { thickness, collidable: true, weightageA: 1, weightageB: 0 });
		this.viewController.engine.addAngularConstraint(ballPedal, ballRear, ballSeat, Math.PI, 0, 1);
		const seat_radius = 6;
		const seatPosA = math.add(seatPos, [-seat_radius, 0]);
		const seatPosB = math.add(seatPos, [seat_radius, 0]);
		const ballSeatA = this.viewController.createBall(seatPosA, { radius: 0, pinned: false });
		const ballSeatB = this.viewController.createBall(seatPosB, { radius: 0, pinned: false });
		this.viewController.addNewJoint(ballSeatA, ballSeat, { thickness, collidable: true, weightageA: 1, weightageB: 0 });
		this.viewController.addNewJoint(ballSeatB, ballSeat, { thickness, collidable: true, weightageA: 1, weightageB: 0 });
		this.viewController.engine.addAngularConstraint(ballRear, ballSeat, ballSeatA, Math.PI / 2 + Math.PI / 6, 0, 1);
		this.viewController.engine.addAngularConstraint(ballSeatA, ballSeat, ballSeatB, Math.PI, 0, 1);


		// actual front handle 
		const handle_height = 10;
		const handleCenterPos = math.add(handlePos, [0, -handle_height]);
		const handleCenterBall = this.viewController.createBall(handleCenterPos, { radius: 0, pinned: false });
		this.viewController.addNewJoint(handleCenterBall, ballHandle, { thickness, collidable: true, weightageA: 1, weightageB: 0 });
		this.viewController.engine.addAngularConstraint(ballB, ballHandle, handleCenterBall, Math.PI, 0, 1);

		const handle_length = 8;
		const handlePosA = math.add(handleCenterPos, [-handle_length, 0]);
		const handlePosB = math.add(handleCenterPos, [handle_length, 0]);
		const ballHandleA = this.viewController.createBall(handlePosA, { radius: 0, pinned: false });
		const ballHandleB = this.viewController.createBall(handlePosB, { radius: 0, pinned: false });
		this.viewController.addNewJoint(ballHandleA, handleCenterBall, { thickness, collidable: true, weightageA: 1, weightageB: 0 });
		this.viewController.addNewJoint(ballHandleB, handleCenterBall, { thickness, collidable: true, weightageA: 1, weightageB: 0 });

		this.viewController.engine.addAngularConstraint(ballHandle, handleCenterBall, ballHandleA, Math.PI / 2 + Math.PI / 6, 0, 1);
		this.viewController.engine.addAngularConstraint(ballHandleA, handleCenterBall, ballHandleB, Math.PI, 0, 1);
	}

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
					radius: 2
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

		// createJoints();

		const bounds = paper.view.getSize();
		// wallHelper([0, bounds.height], [bounds.width, bounds.height]);
		// wallHelper([bounds.width, 0], [bounds.width, bounds.height]);
		//wallHelper([0, 0], [bounds.width, 0]);
		// wallHelper([0, 0], [0, bounds.height]);

		this.buildBicycle();
		this.vehicleVel = [0, 0];

		const cfg = { pinned: true, rigid: false };
		cfg.radius = 2;
		const pa = viewController.createBall([0, 0], cfg);
		const pb = viewController.createBall([1, 0], cfg);
		this.collisionLine = viewController.addNewJoint(pa, pb, { thickness: 3, color: 'red', collidable: false });
		const nodesP = [];
		for (let i = 0; i < nodes.length; ++i) {
			const config = {
				radius: 0,
				pinned: true
			};
			const ball = viewController.createBall(nodes[i], Object.assign({}, config));
			nodesP.push(ball);
			if (i) {
				viewController.addNewJoint(nodesP[i - 1], nodesP[i], { color: 'brown', thickness: 3, collidable: true, weightageA: 0.5, weightageB: .5 });
			}
		}
		viewController.nodes = [];
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
		const engine = this.viewController.getEngine();
		const collision = engine.getCollidingObjects(wheel.v1);
		let colInfo;
		if (collision.length > 0) {
			colInfo = collision[0];
			this.collisionLine.v1.position = colInfo.joint.v1.position;
			this.collisionLine.v2.position = colInfo.joint.v2.position;
			this.collisionLine.updateDistance();
			this.collisionLine.getData().renderObj.visible = true;
		} else {
			this.collisionLine.getData().renderObj.visible = false;
		}

		const f = 0.4;
		const spin = false
		const addVel = (collisionInfo, f) => {
			if (spin) {
				this.wheel.v1.angularVelocity += 10 * f
				return
			}
			if (!collisionInfo) {
				return
			}
			const ci = collisionInfo.collisionInfo;
			const dir = [-ci.axis[1], ci.axis[0]];
			const dv = math.multiply(dir, f * dt);
			const L = math.norm(this.vehicleVel);
			const u = 8;
			if (L > u) {
				this.vehicleVel = math.divide(this.vehicleVel, L / u);
				return;
			}
			this.vehicleVel = math.add(this.vehicleVel, dv);
		};
		if (keys['w'] || keys['ArrowUp']) {
			if (wheel != null) {
				addVel(colInfo, f);
			}
		}
		if (keys['s'] || keys['ArrowDown']) {
			if (wheel != null) {
				addVel(colInfo, -f);
			}
		}
		if (keys['z']) {
			this.viewController.config.scale += 0.01;
		}
		if (keys['x']) {
			this.viewController.config.scale -= 0.01;
		}
		const rot = (dir) => {
			let pivot = math.add(wheel.v1.position, wheel.v2.position);
			pivot = math.multiply(pivot, .5);
			// pivot = wheel.v2.position;
			const rotAroundPivot = (pos, angle) => {
				const vrp = math.subtract(pos, pivot);
				const np = rotateZ(vrp, angle);
				return math.add(pivot, np);
			};
			const angle = dir * Math.PI * .8 / 180;
			// const addVel = math.subtract(newPosition, wheel.v2.position);
			const wheel1NewPos = rotAroundPivot(wheel.v1.position, angle);
			const wheel2NewPos = rotAroundPivot(wheel.v2.position, angle);

			wheel.v1.position = wheel1NewPos;

			wheel.v2.position = wheel2NewPos;
		};

		if (keys['a'] || keys['ArrowLeft']) {
			if (wheel != null) {
				rot(-1.8);
			}
		}
		if (keys['d'] || keys['ArrowRight']) {
			if (wheel != null) {
				rot(1.8);
			}
		}
		if (keys[' ']) {
			if (colInfo) {
				const del = [0, -0.5 * this.viewController.engine.config.gravity * dt];
				wheel.v1.position = math.add(wheel.v1.position, del);
				wheel.v2.position = math.add(wheel.v2.position, del);
			}
		}
		if (keys['p']) {
			console.log(JSON.stringify(this.viewController.nodes));
		}
		this.vehicleVel = math.multiply(this.vehicleVel, 0.98);
		if (wheel != null) {
			wheel.v1.position = math.add(wheel.v1.position, this.vehicleVel);
			wheel.v1.position = math.add(wheel.v1.position, this.vehicleVel);
		}

		// focus follow
		const dest = math.add(wheel.v1.position, [120, -80]);
		const del = math.subtract(dest, this.viewController.focus); 
		this.viewController.focus = math.add(this.viewController.focus, math.multiply(del, 0.1));
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
