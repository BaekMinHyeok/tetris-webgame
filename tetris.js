const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const ROWS = 20, COLS = 10, BLOCK = 20;
ctx.scale(BLOCK, BLOCK);

const SHAPES = [
  [],
  [[1,1,1,1]], // I
  [[2,2],[2,2]], // O
  [[0,3,0],[3,3,3]], // T
  [[0,4,4],[4,4,0]], // S
  [[5,5,0],[0,5,5]], // Z
  [[6,0,0],[6,6,6]], // J
  [[0,0,7],[7,7,7]] // L
];
const COLORS = [null,'#0ff','#ff0','#a0f','#0f0','#f00','#00f','#fa0'];

function randomPiece() {
  const typeId = Math.floor(Math.random()*7)+1;
  const shape = SHAPES[typeId].map(row => [...row]); // 깊은 복사
  return {
    shape,
    color: COLORS[typeId],
    pos: {x: Math.floor(COLS/2)-Math.ceil(shape[0].length/2), y: 0},
    type: typeId
  };
}

let arena = Array.from({length:ROWS},()=>Array(COLS).fill(0));
let piece = randomPiece();
let dropCounter = 0, dropInterval = 800;
let lastTime = 0, score = 0, gameOver = false;

function collide(arena, piece) {
  const m = piece.shape, o = piece.pos;
  for(let y=0; y<m.length; ++y)
    for(let x=0; x<m[y].length; ++x)
      if(m[y][x] && (
        o.y + y >= ROWS ||
        o.x + x < 0 ||
        o.x + x >= COLS ||
        (arena[o.y + y] && arena[o.y + y][o.x + x])
      )) return true;
  return false;
}

function merge(arena, piece) {
  piece.shape.forEach((row,y)=>row.forEach((v,x)=>{
    if(v && y+piece.pos.y>=0 && y+piece.pos.y<ROWS && x+piece.pos.x>=0 && x+piece.pos.x<COLS)
      arena[y+piece.pos.y][x+piece.pos.x]=piece.type;
  }));
}

function rotate(matrix) {
  // 깊은 복사로 회전 전후 shape가 분리되도록
  const N = matrix.length;
  let ret = Array.from({length:N},()=>Array(N).fill(0));
  for(let y=0;y<N;++y)
    for(let x=0;x<N;++x)
      ret[x][N-1-y]=matrix[y][x];
  return ret;
}

function playerDrop() {
  if(gameOver) return;
  piece.pos.y++;
  if(collide(arena,piece)){
    piece.pos.y--;
    merge(arena,piece);
    piece=randomPiece();
    if(collide(arena,piece)){
      gameOver=true;
      draw();
      setTimeout(()=>{
        alert('Game Over! Score: '+score+'\n새로고침(F5)으로 다시 시작하세요.');
      }, 100);
      return;
    }
    sweep();
  }
  dropCounter=0;
}

function sweep() {
  let rowCount=1;
  outer:for(let y=arena.length-1;y>=0;--y){
    for(let x=0;x<arena[y].length;++x)
      if(!arena[y][x]) continue outer;
    arena.splice(y,1);
    arena.unshift(Array(COLS).fill(0));
    score+=rowCount*10;
    rowCount*=2;
  }
}

function playerMove(dir) {
  if(gameOver) return;
  piece.pos.x+=dir;
  if(collide(arena,piece)) piece.pos.x-=dir;
}

function playerRotate() {
  if(gameOver) return;
  const oldShape = piece.shape.map(row => [...row]);
  piece.shape = rotate(piece.shape);
  let offset=1;
  while(collide(arena,piece)){
    piece.pos.x+=offset;
    offset=-(offset+(offset>0?1:-1));
    if(offset>piece.shape[0].length){
      piece.shape = oldShape; // 실패 시 원상복구
      return;
    }
  }
}

document.addEventListener('keydown',e=>{
  if(gameOver) return;
  if(e.key==='ArrowLeft') playerMove(-1);
  else if(e.key==='ArrowRight') playerMove(1);
  else if(e.key==='ArrowDown') playerDrop();
  else if(e.key==='ArrowUp') playerRotate();
  else if(e.key===' '){
    // 빠른 드랍: 블록이 바닥에 닿을 때까지 반복
    while(!gameOver && !collide(arena, piece)){
      piece.pos.y++;
    }
    piece.pos.y--;
    playerDrop();
  }
});

function drawMatrix(matrix, offset) {
  matrix.forEach((row,y)=>row.forEach((v,x)=>{
    if(v) {
      ctx.fillStyle=COLORS[v];
      ctx.fillRect(x+offset.x,y+offset.y,1,1);
      ctx.strokeStyle='#222';
      ctx.strokeRect(x+offset.x,y+offset.y,1,1);
    }
  }));
}

function draw() {
  ctx.fillStyle='#111';
  ctx.fillRect(0,0,COLS,ROWS);
  drawMatrix(arena,{x:0,y:0});
  drawMatrix(piece.shape,piece.pos);
}

function update(time=0) {
  const dt=time-lastTime;
  lastTime=time;
  dropCounter+=dt;
  if(dropCounter>dropInterval) playerDrop();
  draw();
  document.querySelector('h1').textContent = 'Tetris Game | Score: '+score;
  if(!gameOver) requestAnimationFrame(update);
}

update();
