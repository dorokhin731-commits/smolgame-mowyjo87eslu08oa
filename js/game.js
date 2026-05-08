import * as PIXI from 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/6.5.10/pixi.min.js';
import { Tween } from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js';

// Game constants
const BLOCK_SIZE = 30;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const COLORS = [
    0xFF0000, // Red
    0xFFA500, // Orange
    0xFFFF00, // Yellow
    0x00FF00, // Green
    0x0000FF, // Blue
    0x800080, // Purple
];

// Tetromino shapes
const TETROMINOS = [
    [
        [1, 1, 1, 1],
    ],
    [
        [1, 1, 0],
        [0, 1, 1],
    ],
    [
        [0, 1, 1],
        [1, 1, 0],
    ],
    [
        [1, 1],
        [1, 1],
    ],
    [
        [1, 0, 0],
        [1, 1, 1],
    ],
    [
        [0, 0, 1],
        [1, 1, 1],
    ],
    [
        [1, 1, 1],
        [0, 1, 0],
    ],
];

// Game state
let grid = Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(0));
let currentTetromino = null;
let nextTetromino = null;
let score = 0;

// Function to generate a new tetromino
function generateTetromino() {
    const tetrominoIndex = Math.floor(Math.random() * TETROMINOS.length);
    return TETROMINOS[tetrominoIndex];
}

// Function to rotate a tetromino
function rotateTetromino(tetromino) {
    return tetromino[0].map((_, colIndex) => tetromino.map((row) => row[colIndex]).reverse());
}

// Function to check if a tetromino can be placed at a given position
function canPlaceTetromino(tetromino, x, y) {
    for (let i = 0; i < tetromino.length; i++) {
        for (let j = 0; j < tetromino[i].length; j++) {
            if (tetromino[i][j] === 1) {
                if (x + j < 0 || x + j >= GRID_WIDTH || y + i < 0 || y + i >= GRID_HEIGHT) {
                    return false;
                }
                if (grid[y + i][x + j] === 1) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Function to place a tetromino at a given position
function placeTetromino(tetromino, x, y) {
    for (let i = 0; i < tetromino.length; i++) {
        for (let j = 0; j < tetromino[i].length; j++) {
            if (tetromino[i][j] === 1) {
                grid[y + i][x + j] = 1;
            }
        }
    }
}

// Function to remove full lines
function removeFullLines() {
    for (let i = 0; i < GRID_HEIGHT; i++) {
        if (grid[i].every((cell) => cell === 1)) {
            grid.splice(i, 1);
            grid.unshift(Array(GRID_WIDTH).fill(0));
            score++;
            // Add particle effect
            const particles = [];
            for (let j = 0; j < 10; j++) {
                const particle = new PIXI.Graphics();
                particle.beginFill(0xFFFFFF);
                particle.drawRect(0, 0, 5, 5);
                particle.endFill();
                particle.position.set(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
                particles.push(particle);
                app.stage.addChild(particle);
                new Tween(particle.position).to({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }, 1000).start();
            }
            setTimeout(() => {
                particles.forEach((particle) => {
                    app.stage.removeChild(particle);
                });
            }, 1000);
        }
    }
}

// Function to draw the game grid
function drawGrid() {
    app.stage.removeChildren();
    for (let i = 0; i < GRID_HEIGHT; i++) {
        for (let j = 0; j < GRID_WIDTH; j++) {
            if (grid[i][j] === 1) {
                const block = new PIXI.Graphics();
                block.beginFill(COLORS[Math.floor(Math.random() * COLORS.length)]);
                block.drawRect(0, 0, BLOCK_SIZE, BLOCK_SIZE);
                block.endFill();
                block.position.set(j * BLOCK_SIZE, i * BLOCK_SIZE);
                app.stage.addChild(block);
            }
        }
    }
    if (currentTetromino) {
        for (let i = 0; i < currentTetromino.shape.length; i++) {
            for (let j = 0; j < currentTetromino.shape[i].length; j++) {
                if (currentTetromino.shape[i][j] === 1) {
                    const block = new PIXI.Graphics();
                    block.beginFill(COLORS[Math.floor(Math.random() * COLORS.length)]);
                    block.drawRect(0, 0, BLOCK_SIZE, BLOCK_SIZE);
                    block.endFill();
                    block.position.set((j + currentTetromino.x) * BLOCK_SIZE, (i + currentTetromino.y) * BLOCK_SIZE);
                    app.stage.addChild(block);
                }
            }
        }
    }
}

// Initialize game loop
function update() {
    if (!currentTetromino) {
        currentTetromino = {
            shape: generateTetromino(),
            x: Math.floor((GRID_WIDTH - currentTetromino?.shape[0].length) / 2),
            y: 0,
        };
    } else {
        if (canPlaceTetromino(currentTetromino.shape, currentTetromino.x, currentTetromino.y + 1)) {
            currentTetromino.y++;
        } else {
            placeTetromino(currentTetromino.shape, currentTetromino.x, currentTetromino.y);
            removeFullLines();
            currentTetromino = null;
        }
    }
    drawGrid();
    requestAnimationFrame(update);
}

// Handle touch events
let touchX = 0;
let touchY = 0;
let isTouching = false;

// Initialize PixiJS application
const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio,
    backgroundColor: 0x111111,
});

// Add screen shake effect
function screenShake() {
    app.stage.position.set(Math.random() * 10, Math.random() * 10);
    new Tween(app.stage.position).to({ x: 0, y: 0 }, 100).start();
}

// Create game container
const gameContainer = document.createElement('div');
document.body.appendChild(gameContainer);
gameContainer.appendChild(app.view);

// Add event listeners
app.view.addEventListener('touchstart', (event) => {
    touchX = event.touches[0].clientX;
    touchY = event.touches[0].clientY;
    isTouching = true;
    screenShake();
});
app.view.addEventListener('touchmove', (event) => {
    if (isTouching) {
        const moveX = event.touches[0].clientX - touchX;
        const moveY = event.touches[0].clientY - touchY;
        if (Math.abs(moveX) > Math.abs(moveY)) {
            if (canPlaceTetromino(currentTetromino.shape, currentTetromino.x + Math.sign(moveX), currentTetromino.y)) {
                currentTetromino.x += Math.sign(moveX);
            }
        } else {
            if (canPlaceTetromino(rotateTetromino(currentTetromino.shape), currentTetromino.x, currentTetromino.y)) {
                currentTetromino.shape = rotateTetromino(currentTetromino.shape);
            }
        }
        touchX = event.touches[0].clientX;
        touchY = event.touches[0].clientY;
    }
});
app.view.addEventListener('touchend', () => {
    isTouching = false;
});

// Start game loop
update();