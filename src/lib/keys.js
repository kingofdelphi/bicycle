const keys = {};

document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
});

export default keys;