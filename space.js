//board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;

// Ship

let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
  x: shipX,
  y: shipY,
  width: shipWidth,
  heigth: shipHeight
}

let shipImg;
let shipVelocityX = tileSize; // ship moving speed

// tweeters
let tweeterArray = [];
let tweeterWidth = tileSize * 2;
let tweeterHeight = tileSize;
let tweeterX = tileSize;
let tweeterY = tileSize;
let tweeterImg;

let tweeterRows = 2;
let tweeterColumns = 3;
let tweeterCount = 0; // number of tweeters to defet
let tweeterVelocityX = 1; // tweeter moving speed


window.onload = function () {
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d"); // use for drawing on the board

  // draw initial ship
  // context.fillStyle = "green";
  // context.fillRect(ship.x, ship.y, ship.width, ship.heigth);

  // load images
  shipImg = new Image();
  shipImg.src = "./musketeer.png"
  shipImg.onload = function () {
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.heigth);
  }

  tweeterImg = new Image();
  tweeterImg.src = "./tweeter.png";
  createtweeters();

  requestAnimationFrame(update);
  document.addEventListener("keydown", moveShip);
}

function update() {
  requestAnimationFrame(update);

  context.clearRect(0, 0, board.width, board.height);
  // ship
  context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.heigth);


  //tweeter
  for (let i = 0; i < tweeterArray.length; i++) {
    let tweeter = tweeterArray[i];
    if (tweeter.alive) {
      tweeter.x += tweeterVelocityX;

      // if tweeter touches the borders
      if (tweeter.x + tweeter.width >= board.width || tweeter.x <= 0) {
        tweeterVelocityX *= -1;

        // move all tweeters up by one row
        for (let j = 0; j < tweeterArray.length; j++) {
          tweeterArray[j].y += tweeterHeight;
        }
      }

      context.drawImage(tweeterImg, tweeter.x, tweeter.y, tweeter.width, tweeter.height);
    }
  }
}

function moveShip(e) {
  if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
    ship.x -= shipVelocityX; // move left one tile
  } else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
    ship.x += shipVelocityX; // move right one tile
  }
}

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