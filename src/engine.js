import * as math from 'mathjs';

class Engine {
	constructor() {
		this.nodes = [];
		this.joints = [];
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
			if (!nodeA.pinned) {
				nodeA.position = math.add(pa, math.multiply(v, 1));
			}
			if (!nodeB.pinned) {
				nodeB.position = math.add(pb, math.multiply(v, -1));
			}
		});
	}

	addNode(position, pinned = false, rigid = false, data) {
		let node = {
			position,
			oldPosition: position,
			pinned,
			rigid,
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
				this.pinned = true;
			},
			unpin: function() {
				this.pinned = false;
			},
			isPinned: function() {
				return this.pinned;
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

	update(dt) {
		const gravity = 10;
		this.nodes.forEach((node, i) => {
			if (node.pinned) return;
			var vel = math.subtract(node.position, node.oldPosition);
			node.oldPosition = node.position;

			var dv = math.multiply(vel, 0.99);
			dv = math.add(dv, [0, gravity * dt]);
			node.position = math.add(node.position, dv);
		});

		var iter = 20;
		while (iter--) {
			this.solveConstraints();
		}

	}

}

export default Engine;
