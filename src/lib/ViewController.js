import Engine from './engine';
import * as math from './math';

import { drawCircle, drawLine, getCanvasBounds, ctx } from './canvas';

class ViewController {
	init(config = {}) {
		this.engine = new Engine()
		this.engine.viewController = this

		config.scale = config.scale || 1;
		this.config = config;
		this.focus = [0, 0];

		// for mouse events
		this.nodes = []

		this.terrains = []

		this.terrainJoints = []

		this.pedal = {
			leftPedal: {
				
			},
			rightPedal: {

			},
			rotation: 0
		}


	}

	getEngine() {
		return this.engine;
	}

	createPedals(type) {
		if (type == 'left') {
			this.pedal.leftPedal.line = {
				color: 'black', thickness: 2
			}
			this.pedal.leftPedal.legSupport = { color: 'black', thickness: 3, strokeCap: 'round' }
		} else {
			this.pedal.rightPedal.line = {
				color: 'black', thickness: 2
			}
			this.pedal.rightPedal.legSupport = { color: 'black', thickness: 3, strokeCap: 'round' }

		}
	}

	createBall(position, config) {
		let node = this.engine.addNode(position, config);
		let color = config.pinned ? 'green' : config.color;
		let nconfig = Object.assign({}, config, { color });
		const ball = {
			renderObj: {
				position: [0, 0]
			},
			node,
			config: nconfig
		}
		node.setData(ball);
		return node;
	}

	addNewJoint(v1, v2, config, create_render_segment = true) {
		let joint = this.engine.connectJoint(v1, v2);
		let jointInfo = {
			renderObj: { visible: true },
			config,
			joint,
		};
		joint.setData(jointInfo);
		return joint;
	}

	createTerrain(p1, p2, config) {
		let terrainInfo = {
			config,
			p1,
			p2
		}
		this.terrains.push(terrainInfo)
		return terrainInfo;
	}

	getScaledPosition(position, origin = [0, 0]) {
		const { scale } = this.config;
		const relativeToCenter = math.subtract(position, origin);
		const scaled = math.multiply(relativeToCenter, scale);
		const finalPos = math.add(origin, scaled);
		return finalPos;
	}

	getViewPortCenter() {
		const bounds = getCanvasBounds()

		return [bounds[0] / 2, bounds[1] / 2];

	}

	worldToViewPort(position) {
		const pos = math.subtract(this.getScaledPosition(position), this.getScaledPosition(this.focus));
		return math.add(this.getViewPortCenter(), pos);
	}

	viewPortToWorld(position) {
		let pos = math.subtract(position, this.getViewPortCenter());
		pos = math.divide(pos, this.config.scale);
		return math.add(pos, this.focus);
	}

	getFirstTerrainNotInViewPort() {
		let low = -1
		let high = this.terrains.length - 1

		while (low < high) {
			const mid = Math.floor((low + high + 1) / 2)
			const x = this.worldToViewPort(this.terrains[mid].p2)[0]
			if (x < 0)
				low = mid
			else high = mid - 1
		}

		return low
	}
	
	getSecondTerrainNotInViewPort() {
		const bounds = getCanvasBounds()

		let low = 0
		let high = this.terrains.length

		while (low < high) {
			const mid = Math.floor((low + high) / 2)
			const x = this.worldToViewPort(this.terrains[mid].p1)[0]
			if (x > bounds[0])
				high = mid
			else low = mid + 1
		}

		return high
	}


	addNewTerrain(nodes) {
		const nodesP = []

		let slice = false
		
		if (this.terrainJoints.length) {
			nodesP.push(this.terrainJoints.at(-1).v2)
			slice = true
			nodes = [nodesP[0].position].concat(nodes)
		}

		const numberOfAverages = 2
		for (let iter = 1; iter <= numberOfAverages; ++iter) {
			for (let i = 1; i + 1 < nodes.length; ++i) {
				nodes[i] = math.divide(math.add(nodes[i - 1], nodes[i + 1]), 2)
			}
		}
		
		if (slice) {
			nodes.shift()
		}
		
		for (let i = 0; i < nodes.length; ++i) {
			const config = {
				radius: 0,
				pinned: true
			};
			const ball = this.createBall(nodes[i], Object.assign({}, config));
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
			this.createTerrain(nodesP[i - 1].position, math.add(nodesP[i].position, [1, 0]), { fillColor: 'rgb(139, 152, 76)' })
			const joint = this.addNewJoint(nodesP[i - 1], nodesP[i], { color: 'black', thickness: 0, collidable: true, weightageA: 0.5, weightageB: .5 }, false)

			this.terrainJoints.push(joint)
		}
	}

	dynamicTerrain() {
		const indxR = this.getSecondTerrainNotInViewPort() - 1
		const MIN_WINDOW = 50
		if (indxR + MIN_WINDOW >= this.terrains.length) {
			const numcycles = 1
			const result = []
			const amplitude = Math.random() * 300 + 50

			const start = math.add(this.terrains.at(-1).p2, [0, -amplitude])

			for (let i = 0; i < MIN_WINDOW; ++i) {
				const pos = [i * 50, Math.cos(i / (MIN_WINDOW - 1) * (numcycles * 2 * Math.PI)) * amplitude]
				const nd = math.add(start, pos)
				result.push(nd)
			}
			this.addNewTerrain(result)
			
		}
	}

	update(dt) {
		this.engine.update(dt);

		this.dynamicTerrain()

		// zoom scale
		const { scale } = this.config;

		this.engine.bicycleNodes.forEach(node => {
			const renderInfo = node.getData()
			var pos = node.getPosition()
			var viewPortPos = this.worldToViewPort(pos)

			const radius = renderInfo.config.radius

			renderInfo.renderObj.position = viewPortPos
			drawCircle(viewPortPos, scale * radius, renderInfo.config)
			
			if (renderInfo.config.rigid) {
				const numSpokes = 8
				const delta = 2 * Math.PI / numSpokes
				const r = [radius * scale, 0]

				const centerBallRadius = 1.5

				drawCircle(viewPortPos, scale * centerBallRadius, renderInfo.config)

				for (let off = 0; off < numSpokes; ++off) {
					const angle = off * delta + node.getRotation()
					
					const v1 = math.rotate(r, angle)
					const v2 = math.rotate(r, angle + Math.PI)
					
					const v1Scaled = math.add(viewPortPos, v1)
					const v2Scaled = math.add(viewPortPos, v2)

					drawLine(v1Scaled, v2Scaled, node.getData())

				}
			}
		});
		
		this.engine.bicycleJoints.forEach(joint => {
			const renderInfo = joint.getData();
			
			if (!renderInfo.renderObj.visible) {
				return
			}

			const v1 = this.worldToViewPort(joint.v1.getPosition())
			const v2 = this.worldToViewPort(joint.v2.getPosition())

			drawLine(v1, v2, renderInfo.config)
			

		})
		
		// return
		const indxL = this.getFirstTerrainNotInViewPort()
		const indxR = this.getSecondTerrainNotInViewPort()
		
		if (indxL + 1 < indxR) {
			const start = this.worldToViewPort(math.add(this.terrains[indxL + 1].p1, [0, 0]))

			ctx.beginPath();
			ctx.moveTo(start[0], start[1]);
			ctx.strokeStyle = '#926829'
			ctx.fillStyle = '#eab64f'
			ctx.lineWidth = 2

			let end
			for (let i = indxL + 1; i < indxR; ++i) {		
				const terrain = this.terrains[i]

				end = this.worldToViewPort(math.add(terrain.p2, [0, 0]))
				
				ctx.lineTo(end[0], end[1]);
			}
			ctx.lineTo(end[0], end[1] + 2000)

			ctx.lineTo(start[0], start[1] + 2000)
			ctx.stroke();

			ctx.fill()
		}
		
		// return

		const pedalPos = math.rotate([10, 0], this.pedal.rotation)
		const LEG_LEN = 5

		let wheelDelta = math.subtract(this.wheel.v2.position, this.wheel.v1.position)

		wheelDelta = math.divide(wheelDelta, math.norm(wheelDelta))

		const leftPos = math.add(this.ballPedal.getPosition(), pedalPos)

		drawLine(
			this.worldToViewPort(this.ballPedal.getPosition()),
			this.worldToViewPort(leftPos),
			this.pedal.leftPedal.line
		)
	
		const delLeft = math.multiply(wheelDelta, -LEG_LEN)
		const delRight = math.multiply(wheelDelta, LEG_LEN)

		drawLine(
			this.worldToViewPort(math.add(leftPos, delLeft)),
			this.worldToViewPort(math.add(leftPos, delRight)),
			this.pedal.leftPedal.legSupport

		)

		const rightPos = (math.add(this.ballPedal.getPosition(), math.rotate(pedalPos, Math.PI)))

		drawLine(
			this.worldToViewPort(this.ballPedal.getPosition()),
			this.worldToViewPort(rightPos),
			this.pedal.rightPedal.line

		)

		drawLine(
			this.worldToViewPort(math.add(rightPos, delLeft)),
			this.worldToViewPort(math.add(rightPos, delRight)),
			this.pedal.rightPedal.legSupport
		)

	}

}

export default ViewController;
