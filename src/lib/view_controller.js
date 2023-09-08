import Engine from './engine';
import * as math from './math';
import { Wheel } from './wheel'

import { drawLine, getCanvasBounds, ctx } from './canvas';

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

		this.texture = {
			image: new Image(),
			ctxPattern: null
		}
		
		// this.texture.image.src = "/Revised Stone Texture - Anna Sakoi.jpeg";
		this.texture.image.src = "./Clay.jpeg";
		this.texture.image.onload = () => {
			this.texture.ctxPattern = ctx.createPattern(this.texture.image, "repeat")
		}
	}

	getEngine() {
		return this.engine;
	}

	createNode(position, config) {
		const data = {
			renderObj: {
				position: [0, 0]
			},
			config: config || { pinned : false }
		}

		return this.engine.addNode(position, data);
	}

	createWheel(position, config) {
		const node = this.createNode(position, config)
		const color = config.pinned ? 'green' : config.color
		const data = {
			renderObj: {
				...node.data.renderObj,
				wheel: new Wheel(config.radius)
			},
			config: { ...config, color }
		}
		node.setData(data)
		return node
	}

	addNewJoint(v1, v2, config) {
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


	addNewTerrain(nodes, numberOfAverages = 0) {
		const nodesP = []

		let slice = false
		
		if (this.terrainJoints.length) {
			nodesP.push(this.terrainJoints.at(-1).v2)
			slice = true
			nodes = [nodesP[0].position].concat(nodes)
		}

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
			const ball = this.createNode(nodes[i], Object.assign({}, config));
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
			const numcycles = Math.random() < 0.5 ? 0.5 : 1
			const result = []
			const amplitude = (Math.random() * 300 + 50) * (Math.random() < 0.6 ? -1 : 1)

			const GAP = Math.random() * 25 + 25

			const start = math.add(this.terrains.at(-1).p2, [0, -amplitude])

			for (let i = 0; i < MIN_WINDOW; ++i) {
				const pos = [i * GAP, Math.cos(i / (MIN_WINDOW - 1) * (numcycles * 2 * Math.PI)) * amplitude]
				const nd = math.add(start, pos)
				result.push(nd)
			}
			this.addNewTerrain(result)
			
		}
	}

	update(dt) {
		this.engine.update(dt);

		this.dynamicTerrain();

		[this.wheel.v1, this.wheel.v2].forEach(node => {
			const renderInfo = node.getData()
			const worldPos = node.getPosition()
			const viewPortPos = this.worldToViewPort(worldPos)

			renderInfo.renderObj.position = viewPortPos
			const wheel = renderInfo.renderObj.wheel
			wheel.render((pos) => this.worldToViewPort(math.add(worldPos, math.rotate(pos, node.getRotation()))), renderInfo.config)
			
		})

		const frameNodes = {}

		for (const [vertId, node] of Object.entries(this.bicycleFrameNodes)) {
			frameNodes[vertId] = node.getPosition()
		}
		
		this.bicycleFrame.setPosition(frameNodes)

		this.bicycleFrame.render((pos) => this.worldToViewPort(pos), { thickness: 2 })

		
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

			ctx.fillStyle = this.texture.ctxPattern
			ctx.save()
			ctx.translate(-this.focus[0] * this.config.scale, -this.focus[1] * this.config.scale)
			ctx.fill()
			ctx.restore()
		}
		
		// return

		this.pedal.render(
			(pos) => this.worldToViewPort(math.add(pos, this.bicycleFrameNodes.A.position)),
			{ }
		)

	}

}

export default ViewController;
