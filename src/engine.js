import * as math from 'mathjs';
import lineCircleCollision from './collision';

class Engine {
	constructor() {
		this.nodes = [];
		this.joints = [];
		this.config = {
			gravity: 10
		};
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
			if (!nodeA.isPinned()) {
				nodeA.position = math.add(pa, math.multiply(v, 1));
			}
			if (!nodeB.isPinned()) {
				nodeB.position = math.add(pb, math.multiply(v, -1));
			}
		});
	}

	addNode(position, config, data) {
		let node = {
			position,
			oldPosition: position,
			data,
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

	resolveCollisions() {
		const collidableJoints = this.joints.filter(joint => joint.getData().config.collidable);
		this.nodes.filter(node => node.getData().config.rigid == true).forEach((node) => {
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
			if (colcount) {
				refAxis = math.divide(refAxis, math.norm(refAxis));
				var normVel = math.dot(refAxis, node.vel);
				normVel = math.multiply(refAxis, normVel);
				var tangentVel = math.subtract(node.vel, normVel);
				tangentVel = math.multiply(tangentVel, -.99);
				normVel = math.multiply(normVel, .8);
				node.vel = math.add(normVel, tangentVel);
				node.oldPosition = math.add(node.position, node.vel);
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
			node.vel = math.add(vel, gravity);
			node.position = math.add(node.position, dv);
		});

		var iter = 20;
		while (iter--) {
			this.solveConstraints();
		}

		this.resolveCollisions();

	}

}

export default Engine;
