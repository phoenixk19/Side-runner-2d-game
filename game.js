const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const promptText = document.getElementById('promptText');
const gameOverPopup = document.getElementById('gameOverPopup');
const finalScore = document.getElementById('finalScore');
const finalHighScore = document.getElementById('finalHighScore');
const restartBtn = document.getElementById('restartBtn');

let score = 0;
let highScore = 0;
let gameOver = false;
let gameStarted = false;
let scoreTimer = 0; // Add a timer for slower score
let difficultyLevel = 0; // Increases every 500 score

const PLAYER_GROUND_Y = 440 + 40; // Move player down by 40px
const player = {
    x: 150,
    y: PLAYER_GROUND_Y,
    width: 60,
    height: 90,
    color: '#4caf50',
    vy: 0,
    jumpPower: -18,
    gravity: 0.9,
    grounded: true
};

const obstacles = [];
const obstacleWidth = 60;
const obstacleHeight = 90;
const obstacleColor = '#e53935';
let obstacleTimer = 0;
let obstacleInterval = 90;

// --- Background objects and theme ---
const bgObjects = [];
const BG_OBJ_TYPES = ['star', 'cloud', 'building'];
const BG_COLORS = [
    // Each entry: [gradientStart, gradientEnd, extraEffect]
    ['#181c2a', '#232946', 'none'], // 0-999
    ['#1a2233', '#2b2d42', 'aurora'], // 1000-1999
    ['#232946', '#181c2a', 'rain'], // 2000-3999
    ['#1a1a2e', '#16213e', 'stars'], // 4000-4999
];
function getBgTheme(score) {
    const idx = Math.floor((score % 4000) / 1000);
    return BG_COLORS[idx];
}
function spawnBgObjects() {
    // Stars
    for (let i = 0; i < 30; i++) {
        bgObjects.push({
            type: 'star',
            x: Math.random() * canvas.width,
            y: Math.random() * 400,
            r: Math.random() * 1.2 + 0.5,
            speed: 0.1 + Math.random() * 0.2
        });
    }
    // Clouds
    for (let i = 0; i < 6; i++) {
        bgObjects.push({
            type: 'cloud',
            x: Math.random() * canvas.width,
            y: 60 + Math.random() * 120,
            w: 60 + Math.random() * 60,
            h: 18 + Math.random() * 10,
            speed: 0.3 + Math.random() * 0.2
        });
    }
    // Buildings
    for (let i = 0; i < 8; i++) {
        bgObjects.push({
            type: 'building',
            x: Math.random() * canvas.width,
            y: 400 + Math.random() * 80,
            w: 40 + Math.random() * 40,
            h: 80 + Math.random() * 60,
            speed: 0.18 + Math.random() * 0.1
        });
    }
}
spawnBgObjects();
function drawBg(ctx, score) {
    // Gradient background
    const [gradStart, gradEnd, effect] = getBgTheme(score);
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, gradStart);
    grad.addColorStop(1, gradEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Animate and draw bg objects
    for (const obj of bgObjects) {
        obj.x -= obj.speed;
        if (obj.x < -100) {
            obj.x = canvas.width + Math.random() * 60;
        }
        ctx.save();
        if (obj.type === 'star') {
            ctx.globalAlpha = 0.7 + Math.sin(Date.now() / 400 + obj.y) * 0.3;
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.r, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        } else if (obj.type === 'cloud') {
            ctx.globalAlpha = 0.18;
            ctx.beginPath();
            ctx.ellipse(obj.x, obj.y, obj.w, obj.h, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#e0e7ef';
            ctx.fill();
        } else if (obj.type === 'building') {
            ctx.globalAlpha = 0.22;
            ctx.fillStyle = '#222b3a';
            ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
            // Windows
            for (let wy = 0; wy < obj.h - 10; wy += 18) {
                for (let wx = 8; wx < obj.w - 8; wx += 18) {
                    if (Math.random() > 0.7) {
                        ctx.fillStyle = '#ffe082';
                        ctx.fillRect(obj.x + wx, obj.y + wy, 6, 8);
                        ctx.fillStyle = '#222b3a';
                    }
                }
            }
        }
        ctx.restore();
    }
    // Extra effects by theme
    if (effect === 'aurora') {
        // Aurora effect
        for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.globalAlpha = 0.13;
            ctx.beginPath();
            ctx.moveTo(0, 120 + i * 30);
            for (let x = 0; x <= canvas.width; x += 20) {
                ctx.lineTo(x, 120 + i * 30 + Math.sin(Date.now() / 800 + x / 60 + i) * 18);
            }
            ctx.lineTo(canvas.width, 0);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fillStyle = i % 2 === 0 ? '#7fffd4' : '#b388ff';
            ctx.fill();
            ctx.restore();
        }
    } else if (effect === 'rain') {
        // Rain effect
        ctx.save();
        ctx.strokeStyle = '#b3c6e7';
        ctx.globalAlpha = 0.18;
        for (let i = 0; i < 80; i++) {
            const rx = (i * 37 + Date.now() / 3) % canvas.width;
            const ry = (i * 53 + Date.now() / 2) % canvas.height;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx + 0.5, ry + 16);
            ctx.stroke();
        }
        ctx.restore();
    } else if (effect === 'stars') {
        // Twinkling extra stars
        for (let i = 0; i < 20; i++) {
            ctx.save();
            ctx.globalAlpha = 0.18 + Math.abs(Math.sin(Date.now() / 300 + i)) * 0.5;
            ctx.beginPath();
            const sx = (i * 97 + Date.now() / 7) % canvas.width;
            const sy = (i * 41 + Date.now() / 5) % 300;
            ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#fffde7';
            ctx.fill();
            ctx.restore();
        }
    }
}

window.addEventListener('keydown', (e) => {
    if (!gameStarted) return;
    if ((e.code === 'Space' || e.code === 'ArrowUp') && player.grounded && !gameOver) {
        player.vy = player.jumpPower;
        player.grounded = false;
    }
    if (gameOver && (e.code === 'Space' || e.code === 'ArrowUp')) {
        restartGame();
    }
});

startBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
    gameOverPopup.style.display = 'none';
    gameStarted = true;
    resetGame();
    gameLoop();
});

restartBtn.addEventListener('click', () => {
    gameOverPopup.style.display = 'none';
    overlay.style.display = 'none';
    gameStarted = true;
    resetGame();
    gameLoop();
});

function resetGame() {
    score = 0;
    gameOver = false;
    player.y = PLAYER_GROUND_Y;
    player.vy = 0;
    player.grounded = true;
    obstacles.length = 0;
    obstacleTimer = 0;
    scoreTimer = 0; // Reset score timer
    difficultyLevel = 0; // Reset difficulty
}

function spawnObstacle() {
    const y = PLAYER_GROUND_Y + player.height - obstacleHeight;
    obstacles.push({
        x: canvas.width,
        y: y,
        width: obstacleWidth,
        height: obstacleHeight,
        color: obstacleColor
    });
}

function update() {
    if (!gameStarted || gameOver) return;
    player.vy += player.gravity;
    player.y += player.vy;
    if (player.y >= PLAYER_GROUND_Y) {
        player.y = PLAYER_GROUND_Y;
        player.vy = 0;
        player.grounded = true;
    }
    obstacleTimer++;
    if (obstacleTimer >= obstacleInterval) {
        spawnObstacle();
        obstacleTimer = 0;
        obstacleInterval = Math.max(40, 70 + Math.floor(Math.random() * 50) - difficultyLevel * 3);
    }
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= 10 + difficultyLevel * 1.2;
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
    for (const obs of obstacles) {
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            gameOver = true;
            if (score > highScore) highScore = score;
            setTimeout(() => {
                showGameOverPopup();
                gameStarted = false;
            }, 600);
        }
    }
    // Slow down score increment
    scoreTimer++;
    if (scoreTimer % 2 === 0) {
        score++;
        // Increase difficulty every 500 score
        if (score % 500 === 0) {
            difficultyLevel++;
        }
    }
}

function drawPlayer(ctx, player, isHurt) {
    // Animation timing
    const t = Date.now() / 180;
    const isJumping = !player.grounded;
    // Body bounce when running
    let bodyBounce = Math.abs(Math.sin(t)) * 6 * (player.grounded ? 1 : 0.2);
    // Leg/arm swing
    let legSwing = Math.sin(t) * 16 * (player.grounded ? 1 : 0.2);
    let armSwing = Math.sin(t + Math.PI) * 18 * (player.grounded ? 1 : 0.2);
    let legLift = isJumping ? -18 : 0;
    // If hurt, tilt body and reduce bounce
    let hurtTilt = isHurt ? Math.PI / 8 : 0;
    if (isHurt) {
        bodyBounce = 0;
        legSwing = 0;
        armSwing = 0;
        legLift = 0;
    }

    // Body parameters
    const bodyWidth = player.width * 0.5;
    const bodyHeight = player.height * 0.5;
    const bodyX = player.x + player.width / 2;
    const bodyY = player.y + player.height * 0.45 + bodyBounce;

    // Head parameters
    const headRadius = player.width * 0.22;
    const headX = bodyX;
    const headY = player.y + headRadius + 5 + bodyBounce;

    ctx.save();
    if (isHurt) {
        ctx.translate(bodyX, bodyY);
        ctx.rotate(hurtTilt);
        ctx.translate(-bodyX, -bodyY);
    }
    // Draw shadow
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.ellipse(bodyX, player.y + player.height - 5, bodyWidth * 0.7, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.restore();

    // Draw legs (pants)
    ctx.save();
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Left leg
    ctx.moveTo(bodyX - bodyWidth * 0.18, bodyY + bodyHeight * 0.5);
    ctx.lineTo(bodyX - bodyWidth * 0.18 + legSwing, player.y + player.height + legLift);
    // Right leg
    ctx.moveTo(bodyX + bodyWidth * 0.18, bodyY + bodyHeight * 0.5);
    ctx.lineTo(bodyX + bodyWidth * 0.18 - legSwing, player.y + player.height + legLift);
    ctx.stroke();
    ctx.restore();

    // Draw shoes
    ctx.save();
    ctx.fillStyle = '#424242';
    ctx.beginPath();
    ctx.ellipse(bodyX - bodyWidth * 0.18 + legSwing, player.y + player.height + legLift, 8, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(bodyX + bodyWidth * 0.18 - legSwing, player.y + player.height + legLift, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw body (shirt)
    ctx.save();
    ctx.strokeStyle = '#1976d2';
    ctx.lineWidth = bodyWidth * 0.7;
    ctx.beginPath();
    ctx.moveTo(bodyX, headY + headRadius);
    ctx.lineTo(bodyX, bodyY + bodyHeight * 0.5);
    ctx.stroke();
    ctx.restore();

    // Draw arms (skin, swinging)
    ctx.save();
    ctx.strokeStyle = '#ffe0b2';
    ctx.lineWidth = 8;
    ctx.beginPath();
    // Left arm
    ctx.moveTo(bodyX, headY + headRadius + 5);
    ctx.lineTo(bodyX - bodyWidth * 0.5 + armSwing, bodyY + bodyHeight * 0.1 + Math.abs(Math.sin(t)) * 8);
    // Right arm
    ctx.moveTo(bodyX, headY + headRadius + 5);
    ctx.lineTo(bodyX + bodyWidth * 0.5 - armSwing, bodyY + bodyHeight * 0.1 + Math.abs(Math.sin(t + 1)) * 8);
    ctx.stroke();
    ctx.restore();

    // Draw shirt sleeves
    ctx.save();
    ctx.strokeStyle = '#1976d2';
    ctx.lineWidth = 12;
    ctx.beginPath();
    // Left sleeve
    ctx.moveTo(bodyX, headY + headRadius + 5);
    ctx.lineTo(bodyX - bodyWidth * 0.3 + armSwing * 0.5, bodyY + bodyHeight * 0.13 + Math.abs(Math.sin(t)) * 6);
    // Right sleeve
    ctx.moveTo(bodyX, headY + headRadius + 5);
    ctx.lineTo(bodyX + bodyWidth * 0.3 - armSwing * 0.5, bodyY + bodyHeight * 0.13 + Math.abs(Math.sin(t + 1)) * 6);
    ctx.stroke();
    ctx.restore();

    // Draw head
    ctx.save();
    ctx.beginPath();
    ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = isHurt ? '#ff8a80' : '#ffe0b2';
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Draw hair (brown, simple arc)
    ctx.save();
    ctx.strokeStyle = '#6d4c41';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(headX, headY - headRadius * 0.3, headRadius * 0.9, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.restore();

    // Draw face
    ctx.save();
    if (isHurt) {
        // X eyes
        ctx.strokeStyle = '#b71c1c';
        ctx.lineWidth = 3;
        // Left X
        ctx.beginPath();
        ctx.moveTo(headX - headRadius * 0.5, headY - headRadius * 0.18);
        ctx.lineTo(headX - headRadius * 0.3, headY - headRadius * 0.02);
        ctx.moveTo(headX - headRadius * 0.3, headY - headRadius * 0.18);
        ctx.lineTo(headX - headRadius * 0.5, headY - headRadius * 0.02);
        // Right X
        ctx.moveTo(headX + headRadius * 0.3, headY - headRadius * 0.18);
        ctx.lineTo(headX + headRadius * 0.5, headY - headRadius * 0.02);
        ctx.moveTo(headX + headRadius * 0.5, headY - headRadius * 0.18);
        ctx.lineTo(headX + headRadius * 0.3, headY - headRadius * 0.02);
        ctx.stroke();
        // Frown
        ctx.beginPath();
        ctx.arc(headX, headY + headRadius * 0.18, headRadius * 0.28, Math.PI * 1.1, Math.PI * 2 - 0.1);
        ctx.stroke();
    } else {
        // Eyes
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(headX - headRadius * 0.4, headY - headRadius * 0.1, 2.5, 0, Math.PI * 2);
        ctx.arc(headX + headRadius * 0.4, headY - headRadius * 0.1, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Eyebrows
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(headX - headRadius * 0.5, headY - headRadius * 0.22);
        ctx.lineTo(headX - headRadius * 0.25, headY - headRadius * 0.18);
        ctx.moveTo(headX + headRadius * 0.25, headY - headRadius * 0.18);
        ctx.lineTo(headX + headRadius * 0.5, headY - headRadius * 0.22);
        ctx.stroke();
        // Mouth (smile)
        ctx.beginPath();
        ctx.arc(headX, headY + headRadius * 0.18, headRadius * 0.28, Math.PI * 0.1, Math.PI * 1 - 0.1);
        ctx.stroke();
    }
    ctx.restore();
    ctx.restore(); // End tilt
}

function drawMine(ctx, obs, isBlown) {
    const centerX = obs.x + obs.width / 2;
    const centerY = obs.y + obs.height / 2;
    const radius = Math.min(obs.width, obs.height) * 0.35;
    // Draw base shadow
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.ellipse(centerX, obs.y + obs.height - 8, radius * 1.2, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.restore();
    if (isBlown) {
        // Draw explosion
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const len = radius * 2.2 + Math.sin(Date.now() / 80 + i) * 6;
            ctx.save();
            ctx.strokeStyle = '#ffeb3b';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(angle) * len, centerY + Math.sin(angle) * len);
            ctx.stroke();
            ctx.restore();
        }
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i + 0.13;
            const len = radius * 1.5 + Math.cos(Date.now() / 100 + i) * 4;
            ctx.save();
            ctx.strokeStyle = '#ff9800';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(angle) * len, centerY + Math.sin(angle) * len);
            ctx.stroke();
            ctx.restore();
        }
        // Draw blown mine core
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#bdbdbd';
        ctx.fill();
        ctx.restore();
        return;
    }
    // Draw mine body
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#666';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    // Draw spikes
    ctx.save();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const x1 = centerX + Math.cos(angle) * (radius + 2);
        const y1 = centerY + Math.sin(angle) * (radius + 2);
        const x2 = centerX + Math.cos(angle) * (radius + 15);
        const y2 = centerY + Math.sin(angle) * (radius + 15);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        // Draw spike tip
        ctx.beginPath();
        ctx.arc(x2, y2, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#aaa';
        ctx.fill();
    }
    ctx.restore();
    // Draw red center
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#e53935';
    ctx.fill();
    ctx.restore();
}

function drawRoad(ctx) {
    // Road base
    const roadY = 520;
    const roadH = 80;
    ctx.save();
    // Draw main road
    ctx.fillStyle = '#23272e';
    ctx.fillRect(0, roadY, canvas.width, roadH);
    // Draw road edges
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(0, roadY, canvas.width, 4);
    ctx.fillRect(0, roadY + roadH - 4, canvas.width, 4);
    // Draw dashed lane lines
    ctx.strokeStyle = '#fffde7';
    ctx.lineWidth = 4;
    ctx.setLineDash([32, 32]);
    ctx.beginPath();
    ctx.moveTo(0, roadY + roadH / 2);
    ctx.lineTo(canvas.width, roadY + roadH / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    // Add subtle road texture (random light spots)
    for (let i = 0; i < 18; i++) {
        const rx = Math.random() * canvas.width;
        const ry = roadY + 6 + Math.random() * (roadH - 12);
        ctx.globalAlpha = 0.08 + Math.random() * 0.08;
        ctx.beginPath();
        ctx.arc(rx, ry, 6 + Math.random() * 8, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
}

function draw() {
    drawBg(ctx, score); // Draw animated dark bg and objects
    drawRoad(ctx); // Draw realistic road
    drawPlayer(ctx, player, gameOver); // Draw animated player, hurt if gameOver
    for (const obs of obstacles) {
        // If gameOver and player collides with this obstacle, show blown mine
        let isBlown = false;
        if (gameOver &&
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y) {
            isBlown = true;
        }
        drawMine(ctx, obs, isBlown);
    }
    ctx.fillStyle = '#fff';
    ctx.font = '32px Arial';
    ctx.fillText('Score: ' + score, 30, 50);
    ctx.fillText('High Score: ' + highScore, 30, 90);
}

function gameLoop() {
    update();
    draw();
    if (gameStarted) {
        requestAnimationFrame(gameLoop);
    }
}

draw();

function showGameOverPopup() {
    finalScore.textContent = 'Score: ' + score;
    finalHighScore.textContent = 'High Score: ' + highScore;
    gameOverPopup.style.display = 'flex';
    overlay.style.display = 'flex';
    promptText.textContent = 'Press Start to Play';
    startBtn.textContent = 'Start Game';
}

function restartGame() {
    gameOverPopup.style.display = 'none';
    overlay.style.display = 'none';
    gameStarted = true;
    resetGame();
    gameLoop();
} 