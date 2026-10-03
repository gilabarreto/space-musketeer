// Board size and position
const tileSize = 32;
const rows = 16;
const columns = 16;
const boardWidth = tileSize * columns; // 32 * 16
const boardHeight = tileSize * rows; // 32 * 16

const board = document.querySelector(".board");
board.width = boardWidth;
board.height = boardHeight;
const context = board.getContext("2d"); // use for drawing on the board

// Ship size and position
const shipWidth = tileSize * 4;
const shipHeight = tileSize * 2;
const shipX = tileSize * columns / 2 - tileSize;
const shipY = tileSize * rows - tileSize * 3;
// Ship moving speed in pixels per frame
const shipVelocityX = 6;

const ship = {
  x: shipX,
  y: shipY,
  width: shipWidth,
  height: shipHeight
};

const shipImg = new Image();
shipImg.src = "./public/imgs/musketeer.png";

// Tweeters size and position
const tweeterWidth = tileSize * 2;
const tweeterHeight = tileSize;
const tweeterX = tileSize;
const tweeterY = tileSize * 2;
const tweeterImg = new Image();
tweeterImg.src = "./public/imgs/tweeter.png";

let tweeterArray = [];
let tweeterRows;
let tweeterColumns;
// Tweeter moving speed in pixels per frame
let tweeterVelocityX;

let bulletArray = [];
// Bullet moving speed in pixels per frame
const bulletVelocityY = -10;

let score = 0;
let best = Number(localStorage.getItem("space-musketeer-best")) || 0;
// "start", "playing" or "over"
let state = "start";
let gameOverAt = -Infinity;
let lastTime = performance.now();
// Arrow keys currently held down
const keys = new Set();

// Show one section of the page, hide the others
function show(section) {
  for (const el of document.querySelectorAll(".board, .about, .help")) {
    el.classList.toggle("active", el.classList.contains(section));
  }
  // Pause the help video if it's playing
  for (const iframe of document.querySelectorAll("iframe[src]")) {
    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*");
  }
  // YouTube embed only loads when first opened
  const video = document.querySelector(`.${section} iframe:not([src])`);
  if (video) video.src = video.dataset.src;
}

for (const link of document.querySelectorAll(".game-link")) {
  link.addEventListener("click", () => show("board"));
}
document.querySelector(".about-link").addEventListener("click", () => show("about"));
document.querySelector(".help-link").addEventListener("click", () => show("help"));

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", (e) => keys.delete(e.key));

resetGame();
requestAnimationFrame(update);

// Game input, only while the board is visible
function handleKeyDown(e) {
  if (!board.classList.contains("active") || e.key === "Tab") return;
  // Keep space and arrows from clicking buttons or scrolling the page
  if ([" ", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();

  if (state === "start") {
    state = "playing";
  } else if (state === "over") {
    // Short cooldown so a mashed key doesn't skip the game over screen
    if (performance.now() - gameOverAt > 500) {
      resetGame();
      state = "playing";
    }
  } else if (e.key === " " && !e.repeat) {
    shoot();
  } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    keys.add(e.key);
  }
}

// The update function is called on each animation frame
function update(now) {
  requestAnimationFrame(update);

  // Scale movement by elapsed time so speed is the same on any refresh rate,
  // clamped so a background tab doesn't jump ahead
  const step = Math.min(now - lastTime, 50) / (1000 / 60);
  lastTime = now;

  // Paused while About or Help is open
  if (!board.classList.contains("active")) return;

  // Clear the canvas
  context.clearRect(0, 0, board.width, board.height);

  if (state === "playing") {
    moveShip(step);
    moveTweeters(step);
    moveBullets(step);
  }

  // Draw everything
  context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
  for (const tweeter of tweeterArray) {
    if (tweeter.alive) {
      context.drawImage(tweeterImg, tweeter.x, tweeter.y, tweeter.width, tweeter.height);
    }
  }
  context.fillStyle = "white";
  for (const bullet of bulletArray) {
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }

  // Display the score and high score
  context.font = "20px Musketeer, Courier";
  context.textAlign = "left";
  context.fillText(score, 20, 30);
  context.textAlign = "right";
  context.fillText(`HI ${best}`, board.width - 20, 30);

  // Display a message if the game isn't running
  context.textAlign = "center";
  if (state === "start") {
    context.fillText("- Press any key to start -", board.width / 2, board.height / 2);
  } else if (state === "over") {
    context.fillStyle = "#ffff00"; // same yellow as the page title
    context.fillText("- Game Over -", board.width / 2, board.height / 2);
    context.fillText("- Press any key to restart -", board.width / 2, board.height / 2 + 30);
  }
}

// Move the ship while an arrow key is held, keeping it inside the board
function moveShip(step) {
  if (keys.has("ArrowLeft")) ship.x -= shipVelocityX * step;
  if (keys.has("ArrowRight")) ship.x += shipVelocityX * step;
  ship.x = Math.max(0, Math.min(ship.x, board.width - ship.width));
}

function moveTweeters(step) {
  const alive = tweeterArray.filter((tweeter) => tweeter.alive);
  const dx = tweeterVelocityX * step;

  for (const tweeter of alive) {
    tweeter.x += dx;
  }

  // When any tweeter hits a wall, step back, turn around and move all tweeters down one row
  if (alive.some((tweeter) => tweeter.x <= 0 || tweeter.x + tweeter.width >= board.width)) {
    for (const tweeter of tweeterArray) {
      if (tweeter.alive) tweeter.x -= dx;
      tweeter.y += tweeterHeight;
    }
    tweeterVelocityX *= -1;
  }

  // Game over when the tweeters reach the ship
  if (alive.some((tweeter) => tweeter.y >= ship.y)) {
    endGame();
  }
}

function moveBullets(step) {
  for (const bullet of bulletArray) {
    bullet.y += bulletVelocityY * step;

    // Check for collision between bullet and tweeter
    for (const tweeter of tweeterArray) {
      if (!bullet.used && tweeter.alive && detectCollision(bullet, tweeter)) {
        bullet.used = true;
        tweeter.alive = false;
        score += 100;
      }
    }
  }
  // Clear the used bullets and the ones that left the board
  bulletArray = bulletArray.filter((bullet) => !bullet.used && bullet.y + bullet.height > 0);

  // Next wave when all tweeters have been defeated
  if (tweeterArray.every((tweeter) => !tweeter.alive)) {
    // Increase the number of tweeters in columns and rows by 1, capped at 6 each
    tweeterColumns = Math.min(tweeterColumns + 1, columns / 2 - 2);
    tweeterRows = Math.min(tweeterRows + 1, rows / 2 - 2);
    // Increase the tweeter movement speed
    tweeterVelocityX *= 1.2;
    bulletArray = [];
    createTweeters();
  }
}

function endGame() {
  state = "over";
  gameOverAt = performance.now();
  keys.clear();
  if (score > best) {
    best = score;
    localStorage.setItem("space-musketeer-best", best);
  }
}

// Reset the game to the first wave
function resetGame() {
  score = 0;
  ship.x = shipX;
  bulletArray = [];
  tweeterRows = 2;
  tweeterColumns = 3;
  tweeterVelocityX = 1;
  createTweeters();
}

// Function to create tweeters
function createTweeters() {
  tweeterArray = [];
  for (let c = 0; c < tweeterColumns; c++) {
    for (let r = 0; r < tweeterRows; r++) {
      tweeterArray.push({
        x: tweeterX + c * tweeterWidth,
        y: tweeterY + r * tweeterHeight,
        width: tweeterWidth,
        height: tweeterHeight,
        alive: true
      });
    }
  }
}

// Shoot a bullet from the middle of the ship
function shoot() {
  bulletArray.push({
    x: ship.x + shipWidth * 15 / 32,
    y: ship.y,
    width: tileSize / 8,
    height: tileSize / 2,
    used: false
  });
}

// Function to detect collision between two objects
function detectCollision(a, b) {
  return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}
