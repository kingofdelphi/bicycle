import * as math from './math';

interface BoundingBox {
  position: number[];
  width: number;
  height: number;
}

const lineToBBox = (p1: number[], p2: number[]): BoundingBox => {
  const minPos = [Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1])];
  const maxPos = [Math.max(p1[0], p2[0]), Math.max(p1[1], p2[1])];
  return {
    position: minPos,
    width: maxPos[0] - minPos[0],
    height: maxPos[1] - minPos[1],
  };
};

const circleToBBox = (pos: number[], radius: number): BoundingBox => {
  return {
    position: [pos[0] - radius, pos[1] - radius],
    width: 2 * radius,
    height: 2 * radius,
  };
};

const boundingBoxCollision = (rectA: BoundingBox, rectB: BoundingBox): boolean => {
  if (rectA.position[0] + rectA.width < rectB.position[0]) return false;
  if (rectB.position[0] + rectB.width < rectA.position[0]) return false;
  if (rectA.position[1] + rectA.height < rectB.position[1]) return false;
  if (rectB.position[1] + rectB.height < rectA.position[1]) return false;
  return true;
};

const lineCircleCollision = (
  p1: number[],
  p2: number[],
  p1continuousNormal: boolean,
  p2continuousNormal: boolean,
  ball: number[],
  vel: number[],
  radius: number
) => {
  if (p1continuousNormal == null) p1continuousNormal = true;
  if (p2continuousNormal == null) p2continuousNormal = true;

  if (!boundingBoxCollision(lineToBBox(p1, p2), circleToBBox(ball, radius))) return false;

  let dj = math.subtract(p2, p1);
  const jointLength = math.norm(dj);

  dj = math.divide(dj, jointLength);
  let djNormal = [-dj[1], dj[0]];

  const p1Ball = math.subtract(ball, p1);

  if (math.dot(djNormal, p1Ball) < 0) {
    djNormal = math.multiply(djNormal, -1);
  }

  const projDj = math.dot(p1Ball, dj);

  if (projDj <= -radius || projDj >= jointLength + radius) return false;

  const projDjNormal = math.dot(p1Ball, djNormal);
  if (projDjNormal <= -radius || projDjNormal >= radius) return false;

  const chordHalfLength = math.sqrt(radius * radius - projDjNormal * projDjNormal);

  if (projDj - chordHalfLength >= jointLength || projDj + chordHalfLength <= 0) return false;

  const p2Ball = math.subtract(ball, p2);

  if (p1continuousNormal && projDj < 0) {
    const normP1Ball = math.norm(p1Ball);
    if (radius <= normP1Ball) {
      return false;
    }
    return { axis: math.divide(p1Ball, normP1Ball), penetration: radius - normP1Ball, type: 'edge_a' };
  }

  if (p2continuousNormal && jointLength < projDj) {
    const normP2Ball = math.norm(p2Ball);
    if (radius <= normP2Ball) {
      return false;
    }

    return { axis: math.divide(p2Ball, normP2Ball), penetration: radius - normP2Ball, type: 'edge_b' };
  }

  return { axis: djNormal, penetration: radius - projDjNormal, type: 'edge_normal' };
};


export default lineCircleCollision;
