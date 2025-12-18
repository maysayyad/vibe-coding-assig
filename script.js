const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const statusDisplay = document.getElementById('status');
const startBtn = document.getElementById('startBtn');

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = canvas.width / GRID_WIDTH;

const TETROMINOS = [
    { name: 'I', shape: [[1, 1, 1, 1]], color: '#00f0f0' },
    { name: 'O', shape: [[1, 1], [1, 1]], color: '#f0f000' },
    { name: 'T', shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
    { name: 'S', shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
    { name: 'Z', shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' },
    { name: 'J', shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' },
    { name: 'L', shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' }
];

let grid = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let gameRunning = false;
let gameOver = false;
let dropCounter = 0;
let dropInterval = 1000;
let lastDropTime = 0;

function initGrid() {
    grid = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(0));
}

function getRandomPiece() {
    const tetromino = TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];
    return {
        shape: tetromino.shape.map(row => [...row]),
        color: tetromino.color,
        x: Math.floor(GRID_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
        y: 0
    };
}

function isValidMove(piece, offsetX, offsetY) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const newX = piece.x + x + offsetX;
                const newY = piece.y + y + offsetY;

                if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) {
                    return false;
                }

                if (newY >= 0 && grid[newY][newX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function rotatePiece(piece) {
    const newShape = piece.shape[0].map((_, colIndex) =>
        piece.shape.map(row => row[colIndex]).reverse()
    );
    const rotated = { ...piece, shape: newShape };

    if (isValidMove(rotated, 0, 0)) {
        piece.shape = newShape;
    }
}

function movePiece(offsetX, offsetY) {
    if (isValidMove(currentPiece, offsetX, offsetY)) {
        currentPiece.x += offsetX;
        currentPiece.y += offsetY;
        return true;
    }
    return false;
}

function lockPiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const gridY = currentPiece.y + y;
                const gridX = currentPiece.x + x;

                if (gridY >= 0) {
                    grid[gridY][gridX] = currentPiece.color;
                }
            }
        }
    }

    clearLines();
    spawnNewPiece();
}

function clearLines() {
    let linesCleared = 0;

    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell)) {
            grid.splice(y, 1);
            grid.unshift(Array(GRID_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }

    if (linesCleared > 0) {
        score += linesCleared * 100;
        scoreDisplay.textContent = score;
    }
}

function spawnNewPiece() {
    currentPiece = nextPiece || getRandomPiece();
    nextPiece = getRandomPiece();

    if (!isValidMove(currentPiece, 0, 0)) {
        endGame();
    }

    drawNextPiece();
}

function drawNextPiece() {
    nextCtx.fillStyle = '#1a1a2e';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    const offsetX = (nextCanvas.width / BLOCK_SIZE - nextPiece.shape[0].length) / 2;
    const offsetY = (nextCanvas.height / BLOCK_SIZE - nextPiece.shape.length) / 2;

    nextCtx.fillStyle = nextPiece.color;
    for (let y = 0; y < nextPiece.shape.length; y++) {
        for (let x = 0; x < nextPiece.shape[y].length; x++) {
            if (nextPiece.shape[y][x]) {
                nextCtx.fillRect(
                    (offsetX + x) * BLOCK_SIZE,
                    (offsetY + y) * BLOCK_SIZE,
                    BLOCK_SIZE - 1,
                    BLOCK_SIZE - 1
                );
            }
        }
    }
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GRID_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
    }

    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (grid[y][x]) {
                ctx.fillStyle = grid[y][x];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        }
    }

    if (currentPiece) {
        ctx.fillStyle = currentPiece.color;
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    const canvasX = (currentPiece.x + x) * BLOCK_SIZE;
                    const canvasY = (currentPiece.y + y) * BLOCK_SIZE;
                    ctx.fillRect(canvasX, canvasY, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                }
            }
        }
    }
}

function update(currentTime) {
    if (!gameRunning) return;

    const deltaTime = currentTime - lastDropTime;
    if (deltaTime > dropInterval) {
        if (!movePiece(0, 1)) {
            lockPiece();
        }
        lastDropTime = currentTime;
    }
}

function gameLoop(currentTime) {
    update(currentTime);
    draw();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    initGrid();
    score = 0;
    gameRunning = true;
    gameOver = false;
    scoreDisplay.textContent = score;
    statusDisplay.textContent = 'Playing...';
    startBtn.textContent = 'Pause';
    startBtn.disabled = false;

    currentPiece = getRandomPiece();
    nextPiece = getRandomPiece();
    drawNextPiece();

    lastDropTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameRunning = false;
    gameOver = true;
    statusDisplay.textContent = 'Game Over!';
    startBtn.textContent = 'Start Game';
}

function togglePause() {
    if (gameOver) {
        startGame();
    } else if (gameRunning) {
        gameRunning = false;
        statusDisplay.textContent = 'Paused';
        startBtn.textContent = 'Resume';
    } else {
        gameRunning = true;
        statusDisplay.textContent = 'Playing...';
        startBtn.textContent = 'Pause';
        lastDropTime = performance.now();
    }
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning || gameOver) return;

    switch (e.key) {
        case 'ArrowLeft':
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            movePiece(1, 0);
            break;
        case 'ArrowUp':
            rotatePiece(currentPiece);
            break;
        case 'ArrowDown':
            movePiece(0, 1);
            break;
    }
});

startBtn.addEventListener('click', () => {
    if (!gameRunning && !gameOver) {
        startGame();
    } else {
        togglePause();
    }
});

initGrid();
draw();
