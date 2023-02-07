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
let shipVelocityX = tileSize;

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

  requestAnimationFrame(update);
  document.addEventListener("keyddown", moveShip);
}

function update() {
  requestAnimationFrame(update);

  // ship
  context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.heigth);

}

function moveShip(e) {
  if(e.code == "ArrowLeft") {
    ship.x -= shipVelocityX; // move left one tile
  } else if (e.code == "ArrowRight") {
    ship.x += shipVelocityX; // move right one tile
  }
}