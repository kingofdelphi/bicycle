import * as math from './math';
import lineCircleCollision from './collision';

class Engine {
	constructor() {
		this.nodes = [];
		this.joints = [];
		this.bicycleJoints = []

		this.angularConstraints = [];
		this.config = {
			gravity: 500
		};
		this.collisionMap = new Map();
		this.ballJointSeparationFactor = 1
	}

	setConfig(config) {
		this.config = config;
	}

	solveAngularConstraints() {
		this.angularConstraints.forEach(constraint => {
			var nodeA = constraint.nodeA;
			var pivot = constraint.pivot;
			var nodeB = constraint.nodeB;
			var pa = nodeA.position;
			var pb = nodeB.position;
			var ppivot = pivot.position;

			var vpa = math.subtract(pa, ppivot);
			var vpb = math.subtract(pb, ppivot);

			var xAngleA = Math.atan2(vpa[1], vpa[0]);
			if (xAngleA < 0) xAngleA += 2 * Math.PI;

			var xAngleB = Math.atan2(vpb[1], vpb[0]);
			if (xAngleB < 0) xAngleB += 2 * Math.PI;

			var angle = xAngleB - xAngleA;
			if (angle < 0) {
				angle += 2 * Math.PI;
			}
			var angleDifference = constraint.angle - angle;

			var delA = -angleDifference * constraint.weightageA;
			var delB = angleDifference * constraint.weightageB;

			nodeA.position = math.add(ppivot, math.rotate(vpa, delA));
			nodeB.position = math.add(ppivot, math.rotate(vpb, delB));

		});
	}

	solveConstraints() {
		this.bicycleJoints.forEach(joint => {
			var nodeA = joint.v1;
			var nodeB = joint.v2;
			var pa = nodeA.position;
			var pb = nodeB.position;

			var vab = math.subtract(pb, pa);
			var uab = math.divide(vab, math.norm(vab));
			var v = math.multiply(uab, -(joint.length - math.norm(vab)) / 2);
			if (nodeA.isPinned()) {
				nodeB.position = math.add(pb, math.multiply(v, -2));
			} else if (nodeB.isPinned()) {
				nodeA.position = math.add(pa, math.multiply(v, 2));
			} else {
				const { weightageA = 0.5, weightageB = 0.5 } = joint.getData().config;
				nodeA.position = math.add(pa, math.multiply(v, weightageA * 1));
				nodeB.position = math.add(pb, math.multiply(v, -weightageB * 1));
			}
		});
	}

	addAngularConstraint(nodeA, pivot, nodeB, angle, weightageA, weightageB) {
		const constraint = {
			nodeA,
			pivot,
			nodeB,
			angle,
			weightageA,
			weightageB
		};
		this.angularConstraints.push(constraint);
	}

	addNode(position, config, data) {
		let node = {
			position,
			oldPosition: position,
			data,
			rotation: 0,
			mass: 2, // around 2 kgs
			angularVelocity: 0,
			getPosition: function () {
				return this.position;
			},
			setPosition: function (position) {
				this.position = position;
			},
			getData: function () {
				return this.data;
			},
			setData: function (data) {
				this.data = data;
			},
			pin: function() {
				this.data.config.pinned = true;
			},
			unpin: function() {
				this.data.config.pinned = false;
			},
			isPinned: function() {
				return this.data.config.pinned;
			},
			getRotation: function() {
				return this.rotation;
			}
		}
		this.nodes.push(node);
		return node;
	}

	getNodes() {
		return this.nodes;
	}

	getJoints() {
		return this.joints;
	}

	connectJoint(node1, node2, data) {
		let joint = {
			v1: node1,
			v2: node2,
			length: math.distance(node1.position, node2.position),
			data,
			updateDistance: function() {
				this.length = math.distance(this.v1.position, this.v2.position);
			},
			setData: function (data) {
				this.data = data;
			},
			getData: function () {
				return this.data;
			}
		};
		this.joints.push(joint);
		return joint;
	}

	getNodesForCollision() {
		return this.nodes.filter(node => node.getData().config.rigid == true);
	}

	fixBallJointPenetration(ball, joint, collisionInfo) {
		const { v1, v2 } = joint
		const k = v1.isPinned() && v2.isPinned() ? 1 : 0.5
		const delta = math.multiply(collisionInfo.axis, k * collisionInfo.penetration * this.ballJointSeparationFactor)
		ball.position = math.add(ball.position, delta)

		if (!v1.isPinned()) {
			v1.position = math.subtract(v1.position, delta)
		}

		if (!v2.isPinned()) {
			v2.position = math.subtract(v2.position, delta)
		}
	}

	applyCollisionImpulses(node, collisionInfo) {
		const normalAxis = collisionInfo.axis
		const tangentAxis = math.rotate(normalAxis, Math.PI / 2)
		
		const radius = node.getData().config.radius
		const radiusVector = math.multiply(normalAxis, -radius)

		const angularVel = math.cross([0, 0, node.angularVelocity], radiusVector.concat(0)).slice(0, -1)
		const contactVel = math.add(node.velocity, angularVel)

		const coeff_of_friction = 0.9

		const contactNormVel = math.dot(contactVel, normalAxis)
		
		if (contactNormVel >= 0) {
			console.error('objects are separating')
			return
		}

		const contactTangentVel = math.dot(contactVel, tangentAxis)

		const coeff_of_restitution = 0.1
		const momentOfInertia = node.mass * radius * radius
		const effectiveMass = 1 / node.mass

		const normalImpulse = -contactNormVel * (1 + coeff_of_restitution) / effectiveMass
		const tangentImpulse = -contactTangentVel / effectiveMass
				
		const frictionMg = coeff_of_friction * normalImpulse
		
		const frictionalImpulse = math.multiply(tangentAxis, math.clamp(tangentImpulse, -frictionMg, frictionMg))

		const totImpulse = math.add(frictionalImpulse, math.multiply(normalAxis, normalImpulse))

		// p - op = (vel + impulse) * dt
		const deltaV = math.divide(totImpulse, node.mass)
		const newVel = math.add(node.velocity, deltaV)

		node.velocity = newVel

		const angularImpulse = math.cross(radiusVector.concat(0), totImpulse.concat(0))[2]
		node.angularVelocity += angularImpulse / momentOfInertia
	}

	resolveCollisions() {
		this.collisionMap.clear()
		
		const indxL = this.viewController.getFirstTerrainNotInViewPort()
		const indxR = this.viewController.getSecondTerrainNotInViewPort()

		this.bicycleNodes.forEach((node) => {
			// if (math.norm(ball.vel) <= 0) return;
			// if a circle is connected to a joint, shouldn't check collision with it
			let colInfo = []
		
			for (let i = indxL + 1; i < indxR; ++i) {
				const joint = this.viewController.terrainJoints[i]
				const { v1, v2 } = joint;
				
				const radius = node.data.config.radius
				const collision = lineCircleCollision(v1.getPosition(),
					v2.getPosition(),
					v1.getData().config.continuousNormal,
					v2.getData().config.continuousNormal,
					node.getPosition(),
					node.velocity,
					radius
				)
				if (!collision) continue
				
				if (collision.penetration < 0) {
					throw 'penetration cannot be negative'
				}
				

				colInfo.push({ joint, collisionInfo: collision })
			}

			if (!colInfo.length) return


			if (colInfo.length > 2) {
				console.info('touched more than 2 joints', colInfo.length)
			}
			
			// filter joints that are the best for collision resolution
			const joints = colInfo.map(d => d.joint)
			
			// joints are connected sequentially, (a -> b -> c), (d -> e -> f), to disconnected joint components
			const pairs = joints.length === 1 ? [[0]] : []

			for (let i = 1; i < joints.length; i++) {
				const convexEdges = 
					joints[i - 1].v2 === joints[i].v1 && joints[i].v1.getData().config.continuousNormal
				if (convexEdges) {
					pairs.push([i - 1, i])
					++i
				} else {
					pairs.push([i - 1])
				}
				if (i + 1 === joints.length) {
					pairs.push([i])
				}
			}
			
			const bestCollisions = []
			for (const pair of pairs) {
				if (pair.length === 1) {
					bestCollisions.push(colInfo[pair[0]])
					continue
				}

				const col1 = colInfo[pair[0]]
				const col2 = colInfo[pair[1]]
				
				bestCollisions.push(this.getBestEdgeFromConvexPairCollision(col1, col2))

			}
			
			
			this.handleBallJointsCollision(node, bestCollisions)

		})

	}

	getBestEdgeFromConvexPairCollision(colInfo1, colInfo2) {
		const t1 = colInfo1.collisionInfo.type
		const t2 = colInfo2.collisionInfo.type

		console.log(t1, t2)

		if (t1 === 'edge_normal' && t2 === 'edge_normal') {
			console.error('got two edge normals for convex edge')
		}
		if (t1 === 'edge_normal' && t2 !== 'edge_normal') {
			return colInfo1
		} else if (t1 !== 'edge_normal' && t2 === 'edge_normal') {
			return colInfo2
		}
		
		return colInfo1 // any one will work
	}

	handleBallJointsCollision(ball, collisions) {
		const collisionList = this.collisionMap.get(ball) || []

		collisions.forEach(collision => {
			const { joint, collisionInfo } = collision
			collisionList.push({
				joint: joint,
				collisionInfo: collisionInfo
			})
	
			this.collisionMap.set(
				ball,
				collisionList
			);
	
			this.fixBallJointPenetration(ball, joint, collisionInfo)
	
	
			if (math.dot(ball.velocity, collisionInfo.axis) >= 0) {
				console.warn('velocity already separating')
				return
			}
	
			// if (collision.penetration <= 0.0001) return
	
			this.applyCollisionImpulses(ball, collisionInfo)
		})

	}
	// a b 0
	// 0 0 w
	computeVelocities(dt) {

		this.nodes.forEach((node, i) => {
			if (node.isPinned()) return

			const dp = math.subtract(node.position, node.oldPosition)
			let velocity = math.divide(dp, dt)

			velocity = math.add(velocity, [0, this.config.gravity * dt])
			node.velocity = velocity
			node.oldPosition = node.position
		})
	}

	update(dt) {
		this.dt = dt;
		this.nodes.forEach((node, i) => {
			if (node.isPinned()) return

			node.rotation += node.angularVelocity * this.dt
			
			node.position = math.add(node.position, math.multiply(node.velocity, this.dt))
		})

		for (let i = 0; i < 1; ++i) {
			this.resolveCollisions()
		}

		this.nodes.forEach((node, i) => {
			if (node.isPinned()) return

			node.beforeConstraintPosition = node.position
		})

		for (let iter = 0; iter < 4; ++iter) {
			this.solveConstraints()
			this.solveAngularConstraints()
		}

		this.nodes.forEach((node, i) => {
			if (node.isPinned()) return

			node.velocity = math.add(node.velocity, math.divide(math.subtract(node.position, node.beforeConstraintPosition), this.dt))
		})
		

	}

	getCollidingObjects(node) {
		return this.collisionMap.get(node) || [];
	}

}

export default Engine;
