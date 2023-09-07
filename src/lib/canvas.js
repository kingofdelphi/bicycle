const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


export const drawCircle = (position, radius, config) => {
    ctx.beginPath();
    ctx.arc(position[0], position[1], radius, 0, 2 * Math.PI);
    ctx.lineWidth = config.strokeWidth
    ctx.strokeStyle = config.strokeColor || 'black'
    ctx.stroke()
    if (config.fillColor) {
        ctx.fillStyle = config.fillColor
        ctx.fill()
    }
}

export const clearCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export const drawLine = (pos1, pos2, config) => {
    // Start a new Path
    ctx.beginPath();
    ctx.strokeStyle = config.color || 'black'

    ctx.moveTo(pos1[0], pos1[1]);
    ctx.lineTo(pos2[0], pos2[1]);
    ctx.lineWidth = config?.thickness || 1
    ctx.lineCap = 'round'

    ctx.stroke()
}

export const drawTrapezoid = (a, b, c, d, config) => {
    // Start a new Path
    ctx.beginPath();
    ctx.moveTo(a[0], a[1])
    ctx.lineTo(b[0], b[1])
    ctx.lineTo(c[0], c[1])
    ctx.lineTo(d[0], d[1])
    
    ctx.strokeStyle = 'black'
    ctx.fillStyle = config.fillColor
    ctx.lineWidth = 2

    ctx.fill()
    // ctx.stroke()
}

export const getCanvasBounds = () => [canvas.width, canvas.height]


export {
	canvas,
	ctx,
    
}

