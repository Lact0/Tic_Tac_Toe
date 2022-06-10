function load() {
  canvas = document.querySelector('.canvas');
  ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  document.onkeydown = keyPress;
  overlay = document.getElementById("overlay");
  text = document.getElementById("topText");
}

function startGame(turn = 0) {
  //Set to "block" to turn on
  text.style.display = 'block';
  overlay.style.display = "none";
  game = new Game(turn);
}

function reset() {
  text.style.display = 'none';
  overlay.style.display = "block";
  //game = null;
}

function aiDecide(board, maxPlayer, depth = 10) {
  const moves = board.getMoves();
  if(board.val != 0) {
    return [false, board.val];
  }
  if(moves.length == 0) {
    return [false, board.val];
  }
  if(depth == 0) {
    return [false, board.val];
  }
  let ext;
  let bestMove;
  for(let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const newBoard = board.makeMove(move);
    const outcome = aiDecide(newBoard, !maxPlayer, depth - 1);
    if(ext == null) {
      bestMove = move;
      ext = outcome[1];
    }
    if(maxPlayer) {
      if(outcome[1] > ext) {
        bestMove = move;
        ext = outcome[1];
      }
    } else {
      if(outcome[1] < ext) {
        bestMove = move;
        ext = outcome[1];
      }
    }
  }
  return [bestMove, ext];
}

function keyPress(key) {
  if(key.keyCode != 32) {
    return;
  }
}

function leftClick() {
  if(game == null) {
    return;
  }
  let x = event.clientX;
  let y = event.clientY;
  x -= boardX;
  y -= boardY;
  if(x < 0 || y < 0) {
    return;
  }
  x = parseInt(x / unit);
  y = parseInt(y / unit);
  game.makeMove([x,y]);
}
