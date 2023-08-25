import mouseHandler from './mousehandler';
import keys from './keys';
import * as math from './math';
import nodes from './level';
import { drawCircle } from './canvas';

class Demo {
	buildBicycle() {
		const config = {
			pinned: true,
			color: 'black',
			radius: 2
		};
		config.rigid = true;
		config.radius = 22
		config.pinned = false;
		const positionA = [80, 300];
		const positionB = math.add(positionA, [2 * config.radius + 40, 0]);
		this.viewController.createPedals('left')

		const ballA = this.viewController.createBall(positionA, { ...config, strokeWidth: 5 })
		this.wheel = { v1: ballA, v2: ballA } 
		return

		const ballB = this.viewController.createBall(positionB, { ...config, strokeWidth: 5 })
		
		const thickness = 2;
		this.wheel = this.viewController.addNewJoint(ballA, ballB, { thickness, collidable: true, weightageA: 0.5, weightageB: .5 });
		this.viewController.wheel = this.wheel
		// return
		this.wheel.getData().renderObj.visible = false;
		this.viewController.createPedals('right')

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

		// const bounds = getCanvasBounds()
		// wallHelper([0, bounds.height], [bounds.width, bounds.height]);
		// wallHelper([bounds.width, 0], [bounds.width, bounds.height]);
		//wallHelper([0, 0], [bounds.width, 0]);
		// wallHelper([0, 0], [0, bounds.height]);
		this.addTerrain()

		const lengthPrev = viewController.engine.nodes.length
		this.buildBicycle()

		const lengthCur = viewController.engine.nodes.length
		this.bicycleNodes = viewController.engine.nodes.slice(lengthPrev, lengthCur)
		
		mouseHandler(viewController);
	}

	addTerrain() {

		const cfg = { pinned: true, rigid: false };
		cfg.radius = 2;
		const pa = this.viewController.createBall([0, 0], cfg);
		const pb = this.viewController.createBall([1, 0], cfg);
		this.collisionLine = this.viewController.addNewJoint(pa, pb, { thickness: 3, color: 'green', collidable: false });
		const numberOfAverages = 0
		// while (nodes.length>1) nodes.pop()
		for (let iter = 1; iter <= numberOfAverages; ++iter) {
			for (let i = 1; i + 1 < nodes.length; ++i) {
				nodes[i] = math.divide(math.add(nodes[i - 1], nodes[i + 1]), 2)
			}
		}
		const lst = nodes[nodes.length - 1]
		const steps = 100
		const numcycles = 4
		for (let i = 0; i < steps; ++i) {
			const pos = [200 + i * 50, Math.sin(i / steps * (numcycles * 2 * Math.PI)) * 180]
			const nd = math.add(lst, pos)
			nodes.push(nd)
		}

		const nodesP = [];

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
			this.viewController.createTerrain(nodesP[i - 1].position, math.add(nodesP[i].position, [1, 0]), { fillColor: 'rgb(139, 152, 76)', height: 1000 })
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
			let pivot = math.add(wheel.v1.position, wheel.v2.position);
			pivot = math.multiply(pivot, .5);
			// pivot = wheel.v2.position;
			const rotAroundPivot = (pos, angle) => {
				const vrp = math.subtract(pos, pivot);
				const np = math.rotate(vrp, angle);
				return math.add(pivot, np);
			};
			const angle = dir * Math.PI / 180;

			const wheel1NewPos = rotAroundPivot(wheel.v1.position, angle);
			const wheel2NewPos = rotAroundPivot(wheel.v2.position, angle);

			wheel.v1.position = wheel1NewPos;

			wheel.v2.position = wheel2NewPos;
		};

		if (keys['a'] || keys['ArrowLeft']) {
			if (wheel != null) {
				rot(-15 * dt);
			}
		}
		if (keys['d'] || keys['ArrowRight']) {
			if (wheel != null) {
				rot(15 * dt);
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


		const pedal = (direction) => {
			if (!wheel) return

			const dir = direction === 'forward' ? 1 : -1

			this.wheel.v1.angularVelocity += 5 * dt * dir
			
			// console.log('Back wheel collision', collision.length);
			collision.forEach(colInfo => {					
				const dd = math.rotate(colInfo.collisionInfo.axis, Math.PI / 2)
				this.bicycleNodes.forEach(nd => {
					if (nd === wheel.v1)
					// nd.oldPosition = math.add(nd.oldPosition, math.multiply(dd, -20 * dt * dir))
					nd.velocity = math.add(nd.velocity, math.multiply(dd, 500 * dt * dir))

				})
			})
		
			this.viewController.pedal.rotation += 5 * dir * dt
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
