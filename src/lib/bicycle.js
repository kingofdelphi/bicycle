import mouseHandler from './mousehandler';
import keys from './keys';
import * as math from './math';
import nodes from './level';
import { BicycleFrame } from './bicycle_frame'
import { Pedal } from './pedal'
import { PositionMap } from './position_map';

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
		
		this.viewController.bicycleFrame = new BicycleFrame()

		this.viewController.bicycleFrameNodes = {}

		const frame = this.viewController.bicycleFrameNodes

		'ABCDEFGHIJK'.split('').forEach(vertId => {
			const initialPosition = PositionMap[vertId]

			const obj = vertId == 'B' || vertId == 'G' ? 
				this.viewController.createWheel(initialPosition, { ...config }) : this.viewController.createNode(initialPosition)

			this.viewController.bicycleFrameNodes[vertId] = obj
		})
		
        /*
          J--E--K   H--F--I
              \        \
               C--------D
               /\      / \
              /  \    /   \
             /    \  /     \
            B------A        G

        */

		const joints = [
			{ id: 'BG', weightageA: 0.5, weightageB: 0.5 },
			{ id: 'BC', weightageA: 0.5, weightageB: 0.5 },
			{ id: 'GD', weightageA: 0.5, weightageB: 0.5 },
			{ id: 'BA', weightageA: 0.5, weightageB: 0.5 },
			{ id: 'AD', weightageA: 0.5, weightageB: 0.5 },
			{ id: 'AC', weightageA: 0.5, weightageB: 0.5 },
			{ id: 'DC', weightageA: 0.5, weightageB: 0.5 },
			{ id: 'EC', weightageA: 1, weightageB: 0 },
			{ id: 'JE', weightageA: 1, weightageB: 0 },
			{ id: 'KE', weightageA: 1, weightageB: 0 },
			{ id: 'FD', weightageA: 1, weightageB: 0 },
			{ id: 'HF', weightageA: 1, weightageB: 0 },
			{ id: 'IF', weightageA: 1, weightageB: 0 },
		]

		joints.forEach(joint => {
			this.viewController.addNewJoint(
				this.viewController.bicycleFrameNodes[joint.id[0]],
				this.viewController.bicycleFrameNodes[joint.id[1]],
				{ collidable: true, weightageA: joint.weightageA, weightageB: joint.weightageB }
			)
		})

		this.viewController.wheel = this.wheel = {
			v1: frame.B,
			v2: frame.G,
			data: { renderObj: { visible : false } }
		}
		
		/*

          J--E--K   H--F--I
              \        \
               C--------D
               /\      / \
              /  \    /   \
             /    \  /     \
            B------A        G

        */
	   

		const angleConstraints = [
			'GBC', 'BGD', 'GBA', 'ACE', 'CEJ', 'JEK', 'GDF', 'DFH', 'HFI'
		]

		angleConstraints.forEach(frameAngle => {
			const v0 = frame[frameAngle[0]]
			const v1 = frame[frameAngle[1]]
			const v2 = frame[frameAngle[2]]
			
			const v10 = math.subtract(v0.position, v1.position)
			const v12 = math.subtract(v2.position, v1.position)

			const angle10 = math.atan2(v10[1], v10[0])
			const angle12 = math.atan2(v12[1], v12[0])

			const angle = angle12 - angle10

			this.viewController.engine.addAngularConstraint(v0, v1, v2, angle, 0, 1)

		})

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
		const pa = this.viewController.createNode([0, 0], cfg);
		const pb = this.viewController.createNode([1, 0], cfg);
		this.collisionLine = this.viewController.addNewJoint(pa, pb, { thickness: 3, color: 'green', collidable: false });
		
		this.viewController.addNewTerrain(nodes, 1)
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
				angle *= 20
			} else {
				angle *= 10
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

		if (keys['f']) {
			const r = {}
			for (const [k, v] of Object.entries(this.viewController.bicycleFrameNodes)) {
				r[k] = v.position
			}
			console.log(r)
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
