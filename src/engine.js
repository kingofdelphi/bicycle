import * as math from 'mathjs';
import lineCircleCollision from './collision';

class Engine {
	constructor() {
		this.nodes = [];
		this.joints = [];
		this.config = {
			gravity: 10
		};
		this.collisionMap = new Map();
	}
	setConfig(config) {
		this.config = config;
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
					refAxis = math.add(refAxis, c.axis);
					colcount++;
				});
				if (!coll) break;
			}
			// TODO: DO NOT AVERAGE refAxis, 
			// put collision resolution inside the loop (to see if its better)
			// remember to reflect normal only if velocity goes towards the collision axis
			if (colcount) {
				refAxis = math.divide(refAxis, math.norm(refAxis));
				const nodeVel = math.subtract(node.position, node.oldPosition);

				// rotation calculation
				var r = math.multiply(refAxis, -node.getData().config.radius);
				const I = math.dot(r, r);
				const T = math.cross(r.concat(0), nodeVel.concat(0))[2];
				const mg = Math.min(math.norm(nodeVel), 200);
				node.angularVelocity += -10 * mg * T * this.dt / I;

				// new velocity after collision
				var normVel = math.dot(refAxis, nodeVel);
				normVel = math.multiply(refAxis, normVel);
				var tangentVel = math.subtract(nodeVel, normVel);
				tangentVel = math.multiply(tangentVel, -.99);
				normVel = math.multiply(normVel, .8);
				const newNodeVel = math.add(normVel, tangentVel);
				node.oldPosition = math.add(node.position, newNodeVel);
			}
		});
	}

	update(dt) {
		this.dt = dt;
		this.nodes.forEach((node, i) => {
			if (node.isPinned()) return;
			var vel = math.subtract(node.position, node.oldPosition);
			node.oldPosition = node.position;

			var dv = math.multiply(vel, 0.99);
			var gravity = [0, this.config.gravity * dt];
			dv = math.add(dv, gravity);
			node.rotation += node.angularVelocity * dt;
			node.angularVelocity *= 0.99;
			node.position = math.add(node.position, dv);
		});

		var iter = 20;
		while (iter--) {
			this.solveConstraints();
		}

		this.resolveCollisions();

	}

	getCollidingObjects(node) {
		return this.collisionMap.get(node) || [];
	}

}

export default Engine;
