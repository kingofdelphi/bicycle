import mouseHandler from './mousehandler';
import keys from './keys';
import * as math from './math';
import nodes from './level';
import { BicycleFrame } from './bicycle_frame'
import { Pedal } from './pedal'

class Demo {
	buildBicycle() {
		const config = {
			pinned: true,
			color: 'black',
			radius: 2
		};
		config.rigid = true;
		config.radius = 22;
		config.pinned = false;
		const positionA = [80, 300];
		const positionB = math.add(positionA, [2 * config.radius + 34, 0])

		const ballA = this.viewController.createBall(positionA, Object.assign({}, config, { color: null }));
		this.wheel = { v1: ballA, v2: ballA } 
		// return

		const ballB = this.viewController.createBall(positionB, Object.assign({}, config, { color: null }))
		
		const thickness = 2
		this.wheel = this.viewController.addNewJoint(ballA, ballB, { thickness, collidable: true, weightageA: 0.5, weightageB: .5 });
		this.viewController.wheel = this.wheel
		// return
		this.wheel.getData().renderObj.visible = false

		// remove wheel solid color
		ballA.getData().config.fillColor = null
		ballA.getData().config.strokeColor = 'black'
		ballA.getData().config.strokeWidth = 4

		ballB.getData().config.fillColor = null
		ballB.getData().config.strokeColor = 'black'
		ballB.getData().config.strokeWidth = 4

		const rearAngleToSeat = -Math.PI / 6 * 2
		const RR = 38;
		const positionRear = math.add(positionA, math.multiply([Math.cos(rearAngleToSeat), Math.sin(rearAngleToSeat)], RR))
		const ballRear = this.viewController.createBall(positionRear, { radius: 0, pinned: false })

		// back wheel to seat
		this.viewController.addNewJoint(ballA, ballRear, { thickness, collidable: true, weightageA: 0, weightageB: 1 })
		this.viewController.engine.addAngularConstraint(ballB, ballA, ballRear, rearAngleToSeat, 0, 1)

		// front wheel to handle
		const frontWheelToHandle = -Math.PI / 6 * 2.2
		const RR2 = 26
		const handlePos = math.add(positionB, math.multiply([Math.cos(frontWheelToHandle), Math.sin(frontWheelToHandle)], RR2))
		const ballHandle = this.viewController.createBall(handlePos, { radius: 0, pinned: false })
		this.viewController.addNewJoint(ballB, ballHandle, { thickness, collidable: true, weightageA: 0, weightageB: 1 })
		this.viewController.engine.addAngularConstraint(ballA, ballB, ballHandle, -frontWheelToHandle, 0, 1)

		// pedal joint
		const pedalPos = math.add(positionA, [config.radius + 20, 0])
		const ballPedal = this.viewController.createBall(pedalPos, { radius: 0, pinned: false })
		this.viewController.ballPedal = ballPedal

		this.viewController.addNewJoint(ballA, ballPedal, { thickness, collidable: true, weightageA: 0, weightageB: 1 })
		this.viewController.engine.addAngularConstraint(ballB, ballA, ballPedal, 0, 0, 1)

		// joint to handle
		this.viewController.addNewJoint(ballPedal, ballHandle, { thickness, collidable: true, weightageA: 0, weightageB: 1 })

		//pedal to rear seat
		this.viewController.addNewJoint(ballPedal, ballRear, { thickness, collidable: true, weightageA: 0, weightageB: 1 })

		//front handle to rear seat
		this.viewController.addNewJoint(ballHandle, ballRear, { thickness, collidable: true, weightageA: 0, weightageB: 1 })

		//actual seat
		const seatHeight = 8
		const seatPos = math.add(positionRear, [0, -seatHeight])
		const ballSeat = this.viewController.createBall(seatPos, { radius: 0, pinned: false })
		this.viewController.ballSeat = ballSeat
		this.viewController.addNewJoint(ballSeat, ballRear, { thickness, collidable: true, weightageA: 1, weightageB: 0 })
		this.viewController.engine.addAngularConstraint(ballPedal, ballRear, ballSeat, Math.PI, 0, 1)

		const seat_radius = 6
		const seatPosA = math.add(seatPos, [-seat_radius, 0])
		const seatPosB = math.add(seatPos, [seat_radius, 0])
		const ballSeatA = this.viewController.createBall(seatPosA, { radius: 0, pinned: false })
		const ballSeatB = this.viewController.createBall(seatPosB, { radius: 0, pinned: false })
		this.viewController.addNewJoint(ballSeatA, ballSeat, { thickness: 4, collidable: true, weightageA: 1, weightageB: 0 })
		this.viewController.addNewJoint(ballSeatB, ballSeat, { thickness: 4, collidable: true, weightageA: 1, weightageB: 0 })
		this.viewController.engine.addAngularConstraint(ballRear, ballSeat, ballSeatA, Math.PI / 2 + Math.PI / 6, 0, 1)
		this.viewController.engine.addAngularConstraint(ballSeatA, ballSeat, ballSeatB, Math.PI, 0, 1)


		// actual front handle 
		const handle_height = 14
		const handleCenterPos = math.add(handlePos, [0, -handle_height])
		const handleCenterBall = this.viewController.createBall(handleCenterPos, { radius: 0, pinned: false })
		this.viewController.addNewJoint(handleCenterBall, ballHandle, { thickness, collidable: true, weightageA: 1, weightageB: 0 })
		this.viewController.engine.addAngularConstraint(ballB, ballHandle, handleCenterBall, Math.PI, 0, 1)

		const handle_length = 10
		const handlePosA = math.add(handleCenterPos, [-handle_length, 0])
		const handlePosB = math.add(handleCenterPos, [handle_length, 0])
		const ballHandleA = this.viewController.createBall(handlePosA, { radius: 0, pinned: false })
		const ballHandleB = this.viewController.createBall(handlePosB, { radius: 0, pinned: false })
		this.viewController.addNewJoint(ballHandleA, handleCenterBall, { thickness: 4, collidable: true, weightageA: 1, weightageB: 0 })
		this.viewController.addNewJoint(ballHandleB, handleCenterBall, { thickness: 4, collidable: true, weightageA: 1, weightageB: 0 })

		this.viewController.engine.addAngularConstraint(ballHandle, handleCenterBall, ballHandleA, Math.PI / 2 + Math.PI / 6, 0, 1)
		this.viewController.engine.addAngularConstraint(ballHandleA, handleCenterBall, ballHandleB, Math.PI, 0, 1)
		
		this.viewController.bicycleFrame = new BicycleFrame()
		this.viewController.bicycleFrameNodes = {
			A: ballPedal,
			B: ballA,
			C: ballRear,
			D: ballHandle,
			E: ballSeat,
			F: handleCenterBall,
			G: ballB,
			H: ballHandleA,
			I: ballHandleB,
			J: ballSeatA,
			K: ballSeatB
		}
		this.viewController.pedal = new Pedal()
	}

	postInit(viewController) {
		this.viewController = viewController;

		this.addTerrain()

		const lengthPrev = viewController.engine.nodes.length
		const jointsPrev = viewController.engine.joints.length

		this.buildBicycle()
		viewController.engine.bicycleJoints = viewController.engine.joints.slice(jointsPrev, viewController.engine.joints.length)

		const lengthCur = viewController.engine.nodes.length
		this.bicycleNodes = viewController.engine.nodes.slice(lengthPrev, lengthCur)
		viewController.engine.bicycleNodes = this.bicycleNodes
		mouseHandler(viewController);
	}

	addTerrain() {

		const cfg = { pinned: true, rigid: false };
		cfg.radius = 2;
		const pa = this.viewController.createBall([0, 0], cfg);
		const pb = this.viewController.createBall([1, 0], cfg);
		this.collisionLine = this.viewController.addNewJoint(pa, pb, { thickness: 3, color: 'green', collidable: false });
		
		this.viewController.addNewTerrain(nodes)
	}

	addBigCircle(position) {
		const config = {
			color: 'silver',
			rigid: true,
			pinned: false,
			radius: 20
		};
		this.viewController.createBall(position, config)
	}

	preUpdateCallback(event) {
		let wheel = this.wheel;
		const dt = event.delta;
		if (!dt) return
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
		
		
		let pedaling = null

		if (keys['w'] || keys['ArrowUp']) {
			pedaling = 'forward'
		}
		
		if (keys['s'] || keys['ArrowDown']) {
			pedaling = 'backward'
		}
		
		if (keys['z']) {
			this.viewController.config.scale += 0.01;
		}
		
		if (keys['x']) {
			this.viewController.config.scale -= 0.01;
		}

		const rot = (dir) => {
			const pivotMid = math.divide(math.add(wheel.v1.position, wheel.v2.position), 2)

			let pivotType

			if (dir == 'left') {
				pivotType = colInfo ? 'left' : 'mid'
			} else {
				pivotType = engine.getCollidingObjects(wheel.v2)[0] ? 'right' : 'mid'
			}

			const pivot = pivotMid
			let angle = (dir === 'left' ? -1 : 1) * dt * Math.PI / 180;

			if (pivotType === 'left' || pivotType === 'right') {
				angle *= 12
			} else {
				angle *= 6
			}

			// pivot = wheel.v2.position;
			const rotAroundPivot = (pos, angle) => {
				const vrp = math.subtract(pos, pivot)
				const np = math.rotate(vrp, angle)
				return math.add(pivot, np)
			}


			const wheel1NewPos = rotAroundPivot(wheel.v1.position, angle)
			const wheel2NewPos = rotAroundPivot(wheel.v2.position, angle)

			wheel.v1.position = wheel1NewPos

			wheel.v2.position = wheel2NewPos
		};

		if (keys['a'] || keys['ArrowLeft']) {
			rot('left')
		}

		if (keys['d'] || keys['ArrowRight']) {
			rot('right')
		}

		if (keys[' ']) {
			if (colInfo) {
				const jumpAccln = 150
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


		const pedal = (direction) => {
			if (!wheel) return

			const dir = direction === 'forward' ? 1 : -1
			
			this.wheel.v1.angularVelocity += 5 * dt * dir

			if (colInfo) {
				const dd = math.rotate(colInfo.collisionInfo.axis, Math.PI / 2)
				this.bicycleNodes.forEach(nd => {
					if (nd === wheel.v1)
					nd.position = math.add(nd.position, math.multiply(dd, 9 * dt * dir))

				})
			}

			this.viewController.pedal.rotation +=  4 * dt * dir
		}

		if (pedaling != null) {
			pedal(pedaling)
		}

		// focus follow
		const dest = math.add(wheel.v1.position, [120, -80]);
		const del = math.subtract(dest, this.viewController.focus); 
		this.viewController.focus = math.add(this.viewController.focus, math.multiply(del, 0.1))


	}
}

export default Demo;
