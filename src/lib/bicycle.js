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
		// this.wheel = { v1: ballA, v2: ballA } 
		// return
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

		const handle_length = 10;
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
		this.addTerrain()

		const lengthPrev = viewController.engine.nodes.length
		this.buildBicycle()

		const lengthCur = viewController.engine.nodes.length
		this.bicycleNodes = viewController.engine.nodes.slice(lengthPrev, lengthCur)
		
		this.vehicleVel = [0, 0]

		mouseHandler(viewController);
	}

	addTerrain() {

		const cfg = { pinned: true, rigid: false };
		cfg.radius = 2;
		const pa = this.viewController.createBall([0, 0], cfg);
		const pb = this.viewController.createBall([1, 0], cfg);
		this.collisionLine = this.viewController.addNewJoint(pa, pb, { thickness: 3, color: 'green', collidable: false });
		const nodesP = [];
		const numberOfAverages = 0
		for (let iter = 1; iter <= numberOfAverages; ++iter) {
			for (let i = 1; i + 1 < nodes.length; ++i) {
				nodes[i] = math.divide(math.add(nodes[i - 1], nodes[i + 1]), 2)
			}
		}
		for (let i = 0; i < nodes.length; ++i) {
			const config = {
				radius: 0,
				pinned: true
			};
			const ball = this.viewController.createBall(nodes[i], Object.assign({}, config));
			nodesP.push(ball);
		}
		for (let i = 1; i + 1 < nodesP.length; ++i) {
			const a = nodesP[i - 1].position
			const b = nodesP[i + 1].position
			const m = nodesP[i].position
			const dab = math.subtract(b, a) // a ---> b
			const dam = math.subtract(m, a)
			const v = math.cross(dab.concat(0), dam.concat(0))[2]
			nodesP[i].data.config.continuousNormal = v <= 0
		}
		for (let i = 1; i < nodesP.length; ++i) {
			const delta = math.subtract(nodesP[i].position, nodesP[i - 1].position)
			this.viewController.createTerrain(nodesP[i - 1].position, math.add(nodesP[i].position, [1, 0]), { fillColor: 'rgb(139, 152, 76)', height: 10 })
			this.viewController.addNewJoint(nodesP[i - 1], nodesP[i], { color: 'black', thickness: 0, collidable: true, weightageA: 0.5, weightageB: .5 }, false)
		}
	}

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
		const colInfo = collision[0];
		const showCollisionLine = false
		if (showCollisionLine && collision.length > 0) {
			this.collisionLine.v1.position = colInfo.joint.v1.position;
			this.collisionLine.v2.position = colInfo.joint.v2.position;
			this.collisionLine.updateDistance();
			this.collisionLine.getData().renderObj.visible = true;
		} else {
			this.collisionLine.getData().renderObj.visible = false;
		}

		const f = 0.4;
		const spin = false
		const addVel = (collisionInfo, forward) => {
			if (spin) {
				this.wheel.v1.angularVelocity += 100 * dt * f
				return
			}
			if (!collisionInfo) {
				return
			}
			const ci = collisionInfo.collisionInfo;
			const dir = math.rotate(ci.axis, Math.PI / 2)
			// const v12 = math.subtract(wheel.v2.position, wheel.v1.position)
			// const dir = math.divide(v12, math.norm(v12))
			const acceleration = 40
			const dv = math.multiply(dir, forward * acceleration * dt);

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
				const np = math.rotate(vrp, angle);
				return math.add(pivot, np);
			};
			const angle = dir * Math.PI / 180;
			// const addVel = math.subtract(newPosition, wheel.v2.position);
			const wheel1NewPos = rotAroundPivot(wheel.v1.position, angle);
			const wheel2NewPos = rotAroundPivot(wheel.v2.position, angle);

			wheel.v1.position = wheel1NewPos;

			wheel.v2.position = wheel2NewPos;
		};

		if (keys['a'] || keys['ArrowLeft']) {
			if (wheel != null) {
				rot(-25 * dt);
			}
		}
		if (keys['d'] || keys['ArrowRight']) {
			if (wheel != null) {
				rot(25 * dt);
			}
		}
		if (keys[' ']) {
			if (colInfo) {
				const jumpAccln = 200
				const deltaWheel = math.subtract(wheel.v2.position, wheel.v1.position)
				const wheelDir = math.divide(deltaWheel, math.norm(deltaWheel))
				
				const jumpImpulse = math.multiply(math.rotate(wheelDir, -Math.PI / 2), jumpAccln * dt)

				this.bicycleNodes.forEach(node => {
					node.position = math.add(node.position, jumpImpulse)
				})

			}
		}
		if (keys['p']) {
			console.log(JSON.stringify(this.viewController.nodes));
		}
		const coefficientOfFriction = 0.1
		
		const mag = math.norm(this.vehicleVel)
		const vehicleVelDir = math.divide(this.vehicleVel, mag == 0 ? 1 : mag)
		if (1 || colInfo) {
			// const frictionImpulse = math.min(coefficientOfFriction * this.viewController.engine.config.gravity * dt, mag)
			// this.vehicleVel = math.subtract(this.vehicleVel, math.multiply(vehicleVelDir, frictionImpulse))
			this.vehicleVel = math.multiply(this.vehicleVel, 0.98)
		}
		const delta = math.multiply(this.vehicleVel, dt)
		// this.vehicleVel = [0, 0]
		// console.log(this.vehicleVel)
		this.bicycleNodes.forEach(node => {
			node.position = math.add(node.position, delta)
		})

		// focus follow
		const dest = math.add(wheel.v1.position, [120, -80]);
		const del = math.subtract(dest, this.viewController.focus); 
		this.viewController.focus = math.add(this.viewController.focus, math.multiply(del, 0.1));
	}
}

export default Demo;
