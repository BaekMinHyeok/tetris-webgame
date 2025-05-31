const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const ROWS = 20, COLS = 10, BLOCK = 30;
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

function drawCube(x, y, colorIdx) {
  const px = x, py = y;
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, 1, 1);
  ctx.closePath();
  // 3D 그라데이션
  let grad = ctx.createLinearGradient(px, py, px+1, py+1);
  switch(colorIdx) {
    case 1: grad.addColorStop(0, "#00f2fe"); grad.addColorStop(1, "#4facfe"); break;
    case 2: grad.addColorStop(0, "#f7971e"); grad.addColorStop(1, "#ffd200"); break;
    case 3: grad.addColorStop(0, "#a770ef"); grad.addColorStop(1, "#f6d365"); break;
    case 4: grad.addColorStop(0, "#43e97b"); grad.addColorStop(1, "#38f9d7"); break;
    case 5: grad.addColorStop(0, "#fa709a"); grad.addColorStop(1, "#fee140"); break;
    case 6: grad.addColorStop(0, "#30cfd0"); grad.addColorStop(1, "#330867"); break;
    case 7: grad.addColorStop(0, "#f7971e"); grad.addColorStop(1, "#ffd200"); break;
  }
  ctx.fillStyle = grad;
  ctx.fill();
  // 3D 빛 반사 효과
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(px+0.5, py+0.3, 0.35, 0.18, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) =>
    row.forEach((v, x) => {
      if (v) drawCube(x + offset.x, y + offset.y, v);
    })
  );
}
// 나머지 게임 로직은 기존 tetris.js와 동일하게 구현하면 됩니다.