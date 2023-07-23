import * as math from 'mathjs';
import lineCircleCollision, { rotateZ } from './collision';

class Engine {
	constructor() {
		this.nodes = [];
		this.joints = [];
		this.angularConstraints = [];
		this.config = {
			gravity: 300
		};
		this.collisionMap = new Map();
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

			nodeA.position = math.add(ppivot, rotateZ(vpa, delA));
			nodeB.position = math.add(ppivot, rotateZ(vpb, delB));

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
				nodeA.position = math.add(pa, math.multiply(v, weightageA));
				nodeB.position = math.add(pb, math.multiply(v, -weightageB));
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

	resolveCollisions() {
		const collidableJoints = this.joints.filter(joint => joint.getData().config.collidable);
		this.collisionMap.clear();
		this.getNodesForCollision().filter(node => node.getData().config.rigid == true).forEach((node) => {
			// if (math.norm(ball.vel) <= 0) return;
			// if a circle is connected to a joint, shouldn't check collision with it
			const joints = collidableJoints.filter(joint => joint.v1 != node && joint.v2 != node);
			let colcount = 0;
			let refAxis = [0, 0];
			while (1) {
				let coll = false;
				joints.forEach(joint => {
					const { v1, v2 } = joint;
					const radius = node.data.config.radius;
					let c = lineCircleCollision(v1.getPosition(),
						v2.getPosition(),
						v1.getData().config.ignoreNormal,
						v2.getData().config.ignoreNormal,
						node.getPosition(),
						[0, 0],
						radius
					);
					if (!c) return;
					coll = true;
					let k = v1.isPinned() && v2.isPinned() ? 1 : 0.5;
					let delta = math.multiply(c.axis, k * c.penetration);
					node.position = math.add(node.position, delta);
					const collisionList = this.collisionMap.get(node) || [];
					collisionList.push({
						joint,
						collisionInfo: c
					});
					this.collisionMap.set(
						node,
						collisionList
					);
					if (!v1.isPinned()) {
						v1.position = math.subtract(v1.position, delta);
					}
					if (!v2.isPinned()) {
						v2.position = math.subtract(v2.position, delta);
					}
					refAxis = math.add([0, 0], c.axis);
					colcount++;
				});
				if (!coll) break;
			}
			// TODO: DO NOT AVERAGE refAxis, 
			// put collision resolution inside the loop (to see if its better)
			// remember to reflect normal only if velocity goes towards the collision axis
			if (colcount) {
				refAxis = math.divide(refAxis, math.norm(refAxis));
				const nodeVel = node.velocity
				
				var r = math.multiply(refAxis, -node.getData().config.radius);

				const angularVel = math.cross([0, 0, node.angularVelocity], r.concat(0)).slice(0, -1)
				// const contactVel = math.add(nodeVel, angularVel)
				const contactVel = math.add(nodeVel, angularVel)

				const coeff_of_friction = 0.99

				const contactNormVel = math.multiply(refAxis, math.dot(contactVel, refAxis))
				const contactTangentVel = math.subtract(contactVel, contactNormVel)

				const impulse = math.multiply(contactNormVel, -1.4)

				const contactTangentVelNorm = math.norm(contactTangentVel)

				const contactTangentAxis = math.divide(contactTangentVel, contactTangentVelNorm)

				const normalImpulse = math.abs(math.dot(impulse, refAxis))
				
				const frictionMg = coeff_of_friction * normalImpulse
				
				const frictionalImpulse = contactTangentVelNorm > 0 ? 
					math.multiply(contactTangentAxis, -Math.min(frictionMg, contactTangentVelNorm))
				: [0, 0]
								
				const totImpulse = math.add(frictionalImpulse, impulse)
				// p - op = (vel + impulse) * dt
				// 

				node.oldPosition = math.subtract(node.position, math.multiply(math.add(nodeVel, totImpulse), this.dt))

				const Im = math.dot(r, r)
				const T = math.cross(r.concat(0), totImpulse.concat(0))[2]
				node.angularVelocity += T / Im;

			}
		});
	}
	// a b 0
	// 0 0 w

	update(dt) {
		if (dt == 0) return;
		this.dt = dt;
		this.nodes.forEach((node, i) => {
			if (node.isPinned()) return;
			const f = 0.98
			let velocity = math.divide(math.subtract(node.position, node.oldPosition), this.dt / f)

			velocity = math.add(velocity, [0, this.config.gravity * this.dt])

			node.rotation += node.angularVelocity * this.dt * f
			
			node.oldPosition = node.position
			node.velocity = velocity
			node.position = math.add(node.position, math.multiply(velocity, this.dt))
		});

		this.resolveCollisions();

		var iter = 20;
		while (iter--) {
			this.solveConstraints();
			this.solveAngularConstraints();
		}


	}

	getCollidingObjects(node) {
		return this.collisionMap.get(node) || [];
	}

}

export default Engine;
