//Constants
const width = window.innerWidth;
const height = window.innerHeight;
const unit = parseInt(min(height, width) / 4);
const boardThickness = 2;
const buffer = unit / 5;
const boardX = parseInt((width - (unit * 3 + (boardThickness * 2))) / 2);
const boardY = parseInt((height - (unit * 3 + (boardThickness * 2))) / 2);
let canvas;
let ctx;
let game;
let overlay;
let text;

//Useful Functions
function max(n1, n2) {
  if(n1 > n2) {
    return n1;
  }
  return n2;
}

function min(n1, n2) {
  if(n1 < n2) {
    return n1;
  }
  return n2;
}

function randColor() {
  return 'rgba(' + rand(0,255) + ',' + rand(0,255) + ',' + rand(0,255) + ')';
}

function rand(min, max) {
  return Math.floor(Math.random() * (max-min+1)) + (min);
}
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function radToDeg(rad) {
  return rad / Math.PI * 180;
}

function drawLine(x1, y1, x2, y2, style = 'white', r = 1) {
  ctx.strokeStyle = style;
  ctx.lineWidth = r;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

//Classes
class Vector {
  constructor(x = 0, y = 0, x0 = 0, y0 = 0) {
    this.x = x - x0;
    this.y = y - y0;
    this.getMag();
  }

  getMag() {
    this.mag = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  normalize() {
    this.x /= this.mag;
    this.y /= this.mag;
    this.getMag();
  }

  setMag(mag) {
    this.normalize();
    this.x *= mag;
    this.y *= mag;
    this.mag = mag;
  }

  limit(mag) {
    if(this.mag > mag) {
      this.setMag(mag);
    }
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.getMag();
  }

  sub(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    this.getMag();
  }
}

class Board {
  //0 = Unfilled, 1 = X, 2 = O
  constructor(inp = false) {
    if(!inp) {
      this.arr = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ];
      this.toMove = 0;
    } else {
      const oldBoard = inp[0];
      const move = inp[1];
      this.arr = JSON.parse(JSON.stringify(oldBoard.arr));
      this.arr[move[0]][move[1]] = oldBoard.toMove + 1;
      this.toMove = (oldBoard.toMove + 1) % 2;
    }
    this.generateVal();
  }

  draw() {
    ctx.clearRect(0, 0, width, height);
    drawLine(boardX, boardY + unit, boardX + unit * 3, boardY + unit, 'white', boardThickness);
    drawLine(boardX, boardY + unit * 2, boardX + unit * 3, boardY + unit * 2, 'white', boardThickness);
    drawLine(boardX + unit, boardY, boardX + unit, boardY + unit * 3, 'white', boardThickness);
    drawLine(boardX + unit * 2, boardY, boardX + unit * 2, boardY + unit * 3, 'white', boardThickness);
    for(let x = 0; x < 3; x++) {
      for(let y = 0; y < 3; y++) {
        switch(this.arr[x][y]) {
          case 1:
            this.drawX(x, y);
            break;
          case 2:
            this.drawO(x, y);
            break;
        }
      }
    }
  }

  drawX(x, y) {
    const lx = boardX + buffer + unit * x;
    const rx = boardX + (unit - buffer) + unit * x;
    const ty = boardY + buffer + unit * y;
    const by = boardY + (unit - buffer) + unit * y;
    drawLine(lx, ty, rx, by, 'white', boardThickness);
    drawLine(lx, by, rx, ty, 'white', boardThickness);
  }

  drawO(x, y) {
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    const mid = parseInt(unit / 2);
    const r = parseInt(unit / 2) - buffer;
    ctx.arc(boardX + mid + (unit * x), boardY + mid + (unit * y), r, 0, 2 * Math.PI);
    ctx.stroke();
  }

  getMoves() {
    let moves = [];
    for(let x = 0; x < 3; x++) {
      for(let y = 0; y < 3; y++) {
        if(this.arr[x][y] == 0) {
          moves.push([x, y]);
        }
      }
    }
    return moves;
  }

  makeMove(move) {
    //move is an array [x, y] of the position
    if(this.arr[move[0]][move[1]] == 0) {
      const newBoard = new Board([this, move]);
      return newBoard;
    }
    return false;
  }

  checkWin() {
    if(this.arr[0][0] == this.arr[0][1] && this.arr[0][1] == this.arr[0][2] && this.arr[0][0]) {
      return this.arr[0][0];
    }
    if(this.arr[1][0] == this.arr[1][1] && this.arr[1][1] == this.arr[1][2] && this.arr[1][0]) {
      return this.arr[1][0];
    }
    if(this.arr[2][0] == this.arr[2][1] && this.arr[2][1] == this.arr[2][2] && this.arr[2][0]) {
      return this.arr[2][0];
    }
    if(this.arr[0][0] == this.arr[1][0] && this.arr[1][0] == this.arr[2][0] && this.arr[0][0]) {
      return this.arr[0][0];
    }
    if(this.arr[0][1] == this.arr[1][1] && this.arr[1][1] == this.arr[2][1] && this.arr[0][1]) {
      return this.arr[0][1];
    }
    if(this.arr[0][2] == this.arr[1][2] && this.arr[1][2] == this.arr[2][2] && this.arr[0][2]) {
      return this.arr[0][2];
    }
    if(this.arr[0][0] == this.arr[1][1] && this.arr[1][1] == this.arr[2][2] && this.arr[0][0]) {
      return this.arr[0][0];
    }
    if(this.arr[0][2] == this.arr[1][1] && this.arr[1][1] == this.arr[2][0] && this.arr[1][1]) {
      return this.arr[1][1];
    }
    return false;
  }

  generateVal() {
    const win = this.checkWin();
    this.val = 0;
    if(win == 1) {
      this.val = 1;
    }
    if(win == 2) {
      this.val = -1;
    }
  }

}

class Game {
  constructor(turn = 0) {
    this.player = turn;
    this.state = new Board();
    this.toMove = 0;
    this.state.draw();
    this.ended = false;
    if(turn == 1) {
      text.innerHTML = 'Ai Turn';
      let _this = this;
      setTimeout(function() {
        _this.aiMove();
      }, 1000);
    } else {
      text.innerHTML = 'Player Turn';
    }
  }

  makeMove(move, player = true) {
    if(this.ended) {
      return;
    }
    if((player && this.player == this.toMove) || !player) {
      const newState = this.state.makeMove(move);
      if(newState) {
        this.state = newState;
        this.toMove = (this.toMove + 1) % 2;
        this.state.draw();
        if(this.toMove != this.player) {
          text.innerHTML = 'Ai Turn';

        } else {
          text.innerHTML = 'Player Turn';
        }
        this.checkEnd();
        if(this.toMove != this.player) {
          let _this = this;
          setTimeout(function() {
            _this.aiMove();
          }, 1000);
        }
      }
    }
  }

  checkEnd() {
    let end = false;
    if(this.state.checkWin()) {
      end = true;
      if(this.state.checkWin() == this.player + 1) {
        text.innerHTML = 'You Win!';
      } else {
        text.innerHTML = 'You Lose!';
      }
    }
    if(this.state.getMoves().length == 0) {
      end = true;
      text.innerHTML = 'Tie!';
    }
    if(end) {
      this.ended = true;
      setTimeout(reset, 1000);
    }
  }

  aiMove() {
    let move;
    //Hard-coded to go for the middle of board
    if(this.state.arr[1][1] == 0) {
      move = [1, 1];
    } else {
      //GIVE IN THE BOARD, NOT THE GAME STATE
      move = aiDecide(this.state, this.player == 1);
      if(!move[0]) {
        return;
      }
      move = move[0];
    }
    //Make the move with variable "move"
    this.makeMove(move, false);
  }

}
