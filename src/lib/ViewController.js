import Engine from './engine';
import * as math from './math';

import { drawCircle, drawLine, drawTrapezoid, getCanvasBounds } from './canvas';

class ViewController {
	init(config = {}) {
		this.engine = new Engine();
		config.scale = config.scale || 1;
		this.config = config;
		this.focus = [0, 0];

		// for mouse events
		this.nodes = []

		this.terrains = []

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

	update(dt) {
		this.engine.update(dt);

		// zoom scale
		const { scale } = this.config;


		this.engine.getNodes().forEach(node => {
			const renderInfo = node.getData()
			var pos = node.getPosition()
			var viewPortPos = this.worldToViewPort(pos)

			const radius = renderInfo.config.radius

			renderInfo.renderObj.position = viewPortPos
			
			drawCircle(viewPortPos, scale * radius, renderInfo.config)
			
			if (renderInfo.config.rigid) {
				const numSpokes = 8
				const delta = 2 * Math.PI / numSpokes
				const r = [radius, 0]

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
		
		this.engine.getJoints().forEach(joint => {
			const renderInfo = joint.getData();
			
			if (!renderInfo.renderObj.visible) {
				return
			}

			const v1 = this.worldToViewPort(joint.v1.getPosition())
			const v2 = this.worldToViewPort(joint.v2.getPosition())

			drawLine(v1, v2, renderInfo.config)
			

		})
		
		// return

		this.terrains.forEach(terrain => {
			const v1 = this.worldToViewPort(math.add(terrain.p1, [0, 0]))
			const v2 = this.worldToViewPort(math.add(terrain.p2, [0, 0]))
			const v3 = this.worldToViewPort(math.add(terrain.p2, [0, terrain.config.height]))
			const v4 = this.worldToViewPort(math.add(terrain.p1, [0, terrain.config.height]))
			
			drawTrapezoid(v1, v2, v3, v4, terrain.config)
		})
		
		// return

		const pedalPos = math.rotate([10, 0], this.pedal.rotation)
		let wheelDelta = math.subtract(this.wheel.v2.position, this.wheel.v1.position)

		const wheelLength = math.norm(wheelDelta)
		wheelDelta = math.divide(wheelDelta, wheelLength)

		const pedalCenter = math.divide(math.add(this.wheel.v1.position, this.wheel.v2.position), 2)

		const wheelRadius = this.wheel.v1.data.config.radius

		const cfg = { thickness: 2 }

		drawLine(
			this.worldToViewPort(pedalCenter),
			this.worldToViewPort(this.wheel.v1.position),
			cfg
		)

		const wheelAng = math.atan2(wheelDelta[1], wheelDelta[0])
		
		const frameCenter = math.add(this.wheel.v1.position, math.rotate([wheelRadius + 20, 0], -Math.PI / 4 + wheelAng))

		drawLine(
			this.worldToViewPort(this.wheel.v1.position),
			this.worldToViewPort(frameCenter),
			cfg
		)

		drawLine(
			this.worldToViewPort(pedalCenter),
			this.worldToViewPort(frameCenter),
			cfg
		)
		
		const seatHeight = 14

		const seatPos = math.add(frameCenter, math.rotate([seatHeight, 0], wheelAng - 110 * Math.PI / 180))
		
		drawLine(
			this.worldToViewPort(frameCenter),
			this.worldToViewPort(seatPos),
			cfg
		)
		
		drawLine(
			this.worldToViewPort(seatPos),
			this.worldToViewPort(math.add(seatPos, math.rotate([10, 0], wheelAng))),
			cfg
		)
		drawLine(
			this.worldToViewPort(seatPos),
			this.worldToViewPort(math.add(seatPos, math.rotate([-10, 0], wheelAng))),
			cfg
		)
		
		const frameFront = math.add(this.wheel.v2.position, math.rotate([wheelRadius + seatHeight, 0], wheelAng - 110 * Math.PI / 180))


		drawLine(
			this.worldToViewPort(this.wheel.v2.position),
			this.worldToViewPort(frameFront),
			cfg
		)

		drawLine(
			this.worldToViewPort(frameCenter),
			this.worldToViewPort(frameFront),
			cfg
		)

		drawLine(
			this.worldToViewPort(pedalCenter),
			this.worldToViewPort(frameFront),
			cfg
		)

		const handlePos = math.add(frameFront, math.rotate([10, 0], wheelAng - 110 * Math.PI / 180))

		drawLine(
			this.worldToViewPort(handlePos),
			this.worldToViewPort(frameFront),
			cfg
		)
		
		drawLine(
			this.worldToViewPort(handlePos),
			this.worldToViewPort(math.add(handlePos, math.rotate([10, 0], wheelAng + Math.PI / 10))),
			cfg
		)

		drawLine(
			this.worldToViewPort(handlePos),
			this.worldToViewPort(math.add(handlePos, math.rotate([-10, 0], wheelAng + Math.PI / 10))),
			cfg
		)

		const LEG_LEN = 5

	
		const leftPos = math.add(pedalCenter, pedalPos)

		drawLine(
			this.worldToViewPort(pedalCenter),
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

		const rightPos = (math.add(pedalCenter, math.rotate(pedalPos, Math.PI)))

		drawLine(
			this.worldToViewPort(pedalCenter),
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
