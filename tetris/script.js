
const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const SIZE = 30;

const colors = [
    null,
    "#00e5ff",
    "#3366ff",
    "#ff9900",
    "#ffff00",
    "#00ff88",
    "#aa44ff",
    "#ff3366"
];

const shapes = [
    [],
    [[1,1,1,1]],
    [[2,0,0],[2,2,2]],
    [[0,0,3],[3,3,3]],
    [[4,4],[4,4]],
    [[0,5,5],[5,5,0]],
    [[0,6,0],[6,6,6]],
    [[7,7,0],[0,7,7]]
];

let board;
let piece;
let score;
let gameOver;
let lastTime = 0;
let dropCounter = 0;

function createBoard() {
    return Array.from(
        { length: ROWS },
        () => Array(COLS).fill(0)
    );
}

function newPiece() {
    const type = Math.floor(Math.random() * 7) + 1;

    return {
        matrix: shapes[type].map(row => [...row]),
        x: 3,
        y: 0
    };
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colors[value];
                ctx.fillRect(
                    (x + offset.x) * SIZE,
                    (y + offset.y) * SIZE,
                    SIZE - 1,
                    SIZE - 1
                );
            }
        });
    });
}

function draw() {
    ctx.fillStyle = "#080812";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(board, {x: 0, y: 0});
    drawMatrix(piece.matrix, piece);

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", 150, 290);
    }
}

function collide() {
    return piece.matrix.some((row, y) =>
        row.some((value, x) => {
            if (!value) return false;

            const nx = piece.x + x;
            const ny = piece.y + y;

            return (
                nx < 0 ||
                nx >= COLS ||
                ny >= ROWS ||
                (ny >= 0 && board[ny][nx] !== 0)
            );
        })
    );
}

function merge() {
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value && piece.y + y >= 0) {
                board[piece.y + y][piece.x + x] = value;
            }
        });
    });
}

function clearLines() {
    let lines = 0;

    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(value => value !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            lines++;
            y++;
        }
    }

    score += lines * 100;
    document.getElementById("score").textContent = score;
}

function rotate() {
    const matrix = piece.matrix;

    piece.matrix = matrix[0].map((_, i) =>
        matrix.map(row => row[i]).reverse()
    );

    if (collide()) {
        piece.matrix = matrix;
    }
}

function drop() {
    piece.y++;

    if (collide()) {
        piece.y--;
        merge();
        clearLines();
        piece = newPiece();

        if (collide()) {
            gameOver = true;
        }
    }
}

function move(direction) {
    piece.x += direction;

    if (collide()) {
        piece.x -= direction;
    }
}

function update(time = 0) {
    if (gameOver) {
        draw();
        return;
    }

    const delta = time - lastTime;
    lastTime = time;
    dropCounter += delta;

    if (dropCounter > 700) {
        drop();
        dropCounter = 0;
    }

    draw();
    requestAnimationFrame(update);
}

document.addEventListener("keydown", event => {
    if (gameOver) return;

    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
    if (event.key === "ArrowDown") drop();
    if (event.key === "ArrowUp") rotate();

    draw();
});

function restartGame() {
    board = createBoard();
    piece = newPiece();
    score = 0;
    gameOver = false;
    lastTime = 0;
    dropCounter = 0;

    document.getElementById("score").textContent = score;

    requestAnimationFrame(update);
}

restartGame();
