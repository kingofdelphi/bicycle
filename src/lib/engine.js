import * as math from 'mathjs';
import lineCircleCollision, { rotateZ } from './collision';

class Engine {
	constructor() {
		this.nodes = [];
		this.joints = [];
		this.angularConstraints = [];
		this.config = {
			gravity: 500
		};
		this.collisionMap = new Map();
		this.ballJointSeparationFactor = 0.5
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
		this.joints.forEach(joint => {
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

		const coeff_of_friction = 0.99

		const contactNormVel = math.dot(contactVel, normalAxis)
		
		if (contactNormVel >= 0) {
			console.error('objects are separating')
			return
		}

		const contactTangentVel = math.dot(contactVel, tangentAxis)

		const coeff_of_restitution = 0.3
		const momentOfInertia = node.mass * radius * radius
		const effectiveMass = 1 / node.mass

		const normalImpulse = contactNormVel * (-1 - coeff_of_restitution) / effectiveMass
				
		const frictionMg = coeff_of_friction * normalImpulse
		
		const frictionalImpulse = math.multiply(tangentAxis, -Math.max(-frictionMg, Math.min(frictionMg, contactTangentVel)))

		const totImpulse = math.add(frictionalImpulse, math.multiply(normalAxis, normalImpulse))

		// p - op = (vel + impulse) * dt

		const newVel = math.add(node.velocity, math.divide(totImpulse, node.mass))

		node.oldPosition = math.subtract(node.position, math.multiply(newVel, this.dt))
		node.velocity = newVel

		const angularImpulse = math.cross(radiusVector.concat(0), totImpulse.concat(0))[2]
		node.angularVelocity += angularImpulse / momentOfInertia
	}

	resolveCollisions() {
		const collidableJoints = this.joints.filter(joint => joint.getData().config.collidable);
		this.collisionMap.clear()

		this.getNodesForCollision().filter(node => node.getData().config.rigid == true).forEach((node) => {
			// if (math.norm(ball.vel) <= 0) return;
			// if a circle is connected to a joint, shouldn't check collision with it
			let colInfo = []
		
			collidableJoints.forEach(joint => {
				const { v1, v2 } = joint;
				if (v1 === node || v2 === node) return
				const radius = node.data.config.radius
				const collision = lineCircleCollision(v1.getPosition(),
					v2.getPosition(),
					v1.getData().config.continuousNormal,
					v2.getData().config.continuousNormal,
					node.getPosition(),
					node.velocity,
					radius
				)
				if (!collision) return
				
				if (collision.penetration < 0) {
					throw 'penetration cannot be negative'
				}
				

				colInfo.push({ joint, collisionInfo: collision })
			})

			if (!colInfo.length) return


			if (colInfo.length > 2) {
				console.error('touched more than 2 joints')
			}
			
			// filter joints that are the best for collision resolution
			const [joint_a, joint_b] = colInfo.map(d => d.joint)
			
			const convexEdge = colInfo.length == 2 && 
			(
				(joint_a.v2 === joint_b.v1 && joint_a.v2.getData().config.continuousNormal) ||
				(joint_a.v1 === joint_b.v2 && joint_a.v1.getData().config.continuousNormal)
			)
			
			if (convexEdge) {
				const [t1, t2] = colInfo.map(d => d.collisionInfo.type)
				console.log(t1, t2)

				if (t1 === 'edge_normal' && t2 === 'edge_normal') {
					throw 'impossible case'
				}
				
				if (t1 === 'edge_normal' && t2 !== 'edge_normal') {
					colInfo = [colInfo[0]]
				} else if (t1 !== 'edge_normal' && t2 === 'edge_normal') {
					colInfo = [colInfo[1]]
				}

			}

			this.handleBallJointsCollision(node, colInfo)

		})

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

	update(dt) {
		if (dt == 0) return;
		this.dt = dt;
		this.nodes.forEach((node, i) => {
			if (node.isPinned()) return

			const f = 0.98
			let velocity = math.multiply(math.divide(math.subtract(node.position, node.oldPosition), this.dt), f)

			velocity = math.add(velocity, [0, this.config.gravity * this.dt])

			node.rotation += node.angularVelocity * this.dt * f
			
			node.oldPosition = node.position
			node.velocity = velocity
			node.position = math.add(node.position, math.multiply(velocity, this.dt))
		})

		for (let i = 0; i < 1; ++i) {
			this.resolveCollisions()
		}

		for (let iter = 0; iter < 4; ++iter) {
			this.solveConstraints()
			this.solveAngularConstraints()
		}


	}

	getCollidingObjects(node) {
		return this.collisionMap.get(node) || [];
	}

}

export default Engine;
