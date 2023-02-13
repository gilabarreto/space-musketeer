// Board size and position
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;

// Ship size and position
let shipWidth = tileSize * 4;
let shipHeight = tileSize * 2;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 3;

let ship = {
  x: shipX,
  y: shipY,
  width: shipWidth,
  heigth: shipHeight
}

let shipImg;
// Ship moving speed
let shipVelocityX = tileSize;

// Tweeters size and position
let tweeterArray = [];
let tweeterWidth = tileSize * 2;
let tweeterHeight = tileSize;
let tweeterX = tileSize;
let tweeterY = tileSize * 2;
let tweeterImg;

let tweeterRows = 2;
let tweeterColumns = 3;
// Number of tweeters to defet
let tweeterCount = 0;
// Tweeter moving speed
let tweeterVelocityX = 1;

// Number of bullets bullets
let bulletArray = [];
// Bullet moving speed
let bulletVelocityY = -10;

let score = 0;
let gameOver = false;
let gameStarted = false;


window.onload = function () {
  // Select the board and set its dimensions
  board = document.querySelector(".board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d"); // use for drawing on the board

  // Load images and draw the ship
  shipImg = new Image();
  shipImg.src = "./public/imgs/musketeer.png"
  shipImg.onload = function () {
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.heigth);
  }

  tweeterImg = new Image();
  tweeterImg.src = "./public/imgs/tweeter.png";
  createtweeters();

  // Start the game loop
  requestAnimationFrame(update);

  // Add event listeners for user input
  document.addEventListener("keydown", moveShip);
  document.addEventListener("keyup", shoot);
}

// The update function is called on each animation frame
function update() {
  requestAnimationFrame(update);

  // Start the game on any key press
  document.addEventListener("keydown", function () {
    if (!gameStarted) {
      gameStarted = true;
    }
  });

  // Clear the canvas

  context.clearRect(0, 0, board.width, board.height);

  // Display a start message if the game hasn't started yet
  if (!gameStarted) {
    context.fillStyle = "white";
    context.font = "20px Courier";
    context.textAlign = "center";
    context.fillText("- Press any key to start -", board.width / 2, board.height / 2);
    return;
  }

  // Reset the game if it's over
  if (gameOver) {
    resetGame();
    return;
  }

  // Draw the ship
  context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.heigth);


  // Draw the tweeters
  for (let i = 0; i < tweeterArray.length; i++) {
    let tweeter = tweeterArray[i];
    if (tweeter.alive) {
      tweeter.x += tweeterVelocityX;

      // Move all tweeters up one row
      if (tweeter.x + tweeter.width >= board.width || tweeter.x <= 0) {
        tweeterVelocityX *= -1;
        tweeter.x += tweeterVelocityX * 2;

        // Move all tweeters up one row
        for (let j = 0; j < tweeterArray.length; j++) {
          tweeterArray[j].y += tweeterHeight;
        }
      }

      // Draw the tweeter
      context.drawImage(tweeterImg, tweeter.x, tweeter.y, tweeter.width, tweeter.height);

      // Check for collision with the ship
      if (tweeter.y >= ship.y) {
        gameOver = true;
        resetGame();
      }
    }
  }

  // Draw the bullets
  for (let i = 0; i < bulletArray.length; i++) {
    let bullet = bulletArray[i];
    bullet.y += bulletVelocityY;
    context.fillStyle = "white";
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    // Check for collision between bullet and tweeter
    for (let j = 0; j < tweeterArray.length; j++) {
      let tweeter = tweeterArray[j];
      if (!bullet.used && tweeter.alive && detectCollision(bullet, tweeter)) {
        bullet.used = true;
        tweeter.alive = false;
        tweeterCount--;
        score += 100;
      }
    }

  }
  // Clear the used bullets
  while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
    bulletArray.shift(); // removes the first element of the array
  }

  // Check if all tweeters have been defeated
  if (tweeterCount == 0) {
    // Increase the number of tweeters in columns and rows by 1
    // Cap the columns at 6 and the rows at 12
    tweeterColumns = Math.min(tweeterColumns + 1, columns / 2 - 2);
    tweeterRows = Math.min(tweeterRows + 1, rows - 4);
    // Increase the tweeter movement speed
    tweeterVelocityX *= 1.2;
    tweeterArray = [];
    bulletArray = [];

    // Create new tweeters
    createtweeters();
  }

  // Display the score
  context.fillStyle = " white";
  context.font = "20px courier";
  context.textAlign = "left";
  context.fillText(score, 20, 30);
}

// Reset the game
function resetGame() {
  // Display "Game Over" on the canvas
  context.fillStyle = "white";
  context.font = "20px Courier";
  context.textAlign = "center";
  context.fillText("- Game Over -", board.width / 2, board.height / 2);

  // Listen for keydown event to reset the game
  document.addEventListener("keydown", function () {
    if (gameOver) {
      gameOver = false;
      gameStarted = false;
      score = 0;
      ship.x = shipX;
      ship.y = shipY;
      bulletArray = [];
      tweeterArray = [];
      tweeterRows = 2;
      tweeterColumns = 3
      tweeterCount = 0;
      tweeterVelocityX = 1;
      // Create new tweeters
      createtweeters();
    }
  });
}

// Function to move the spaceship
function moveShip(e) {
  // Reset game if it's over
  if (gameOver) {
    resetGame();
    return;
  }

  // Check if the input arrow key is "ArrowLeft" and the spaceship's x position is greater than 0
  if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
    ship.x -= shipVelocityX;
    // Check if the input arrow key is "ArrowRight" and the spaceship's x position + width is less than or equal to the board's width
  } else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
    ship.x += shipVelocityX;
  }
}

// Function to create tweeters
function createtweeters() {
  for (let c = 0; c < tweeterColumns; c++) {
    for (let r = 0; r < tweeterRows; r++) {
      let tweeter = {
        img: tweeterImg,
        x: tweeterX + c * tweeterWidth,
        y: tweeterY + r * tweeterHeight,
        width: tweeterWidth,
        height: tweeterHeight,
        alive: true
      }

      tweeterArray.push(tweeter);
    }
  }
  tweeterCount = tweeterArray.length
}

// Function to shoot a bullet when space key is pressed
function shoot(e) {
  // Reset game if it's over
  if (gameOver) {
    resetGame();
    return;
  }

  // Check if the input key is the space key
  if (e.code == "Space") {
    let bullet = {
      x: ship.x + shipWidth * 15 / 32,
      y: ship.y,
      width: tileSize / 8,
      height: tileSize / 2,
      used: false
    }
    bulletArray.push(bullet);
  }
}
// Function to detect collision between two objects
function detectCollision(a, b) {
  return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}



