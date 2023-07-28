export const pos2point = (pos) => {
	return { x: pos[0], y: pos[1] };
};

export const point2pos = (point) => {
	return [point.x, point.y];
};

export const clamp = (value, lower_bound, upper_bound) => Math.min(Math.max(value, lower_bound), upper_bound)