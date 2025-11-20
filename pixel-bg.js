// Canvas fullscreen com robôs em pixel art
const canvas = document.getElementById("pixel-bg");
const ctx = canvas.getContext("2d");

let robots = [];
const DPR = window.devicePixelRatio || 1;

function resizeCanvas() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.style.width = w + "px";
  canvas.style.height = h + "px";

  canvas.width = w * DPR;
  canvas.height = h * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Sprite de robô em grid ('.' = vazio)
const robotSprite = [
  "....1111....",
  "...122221...",
  "..12222221..",
  "..12233221..",
  ".1122222211.",
  ".1222222221.",
  ".1222552221.",
  ".1222222221.",
  "..11....11..",
  ".11......11.",
  "1..........1",
  "1..11..11..1"
];

function randomPalette() {
  // cores base, dá uma variada leve
  const body = ["#3bd9ff", "#8b5cf6", "#22c55e"][Math.floor(Math.random() * 3)];
  const accent = ["#ff66c4", "#f97316", "#eab308"][Math.floor(Math.random() * 3)];
  return {
    "1": "#202638", // contorno
    "2": body,      // corpo
    "3": "#ffec27", // olhos
    "5": accent     // detalhe
  };
}

function createRobot(w, h) {
  const scale = 3 + Math.random() * 2; // tamanho do pixel
  const spriteW = robotSprite[0].length * scale;
  const spriteH = robotSprite.length * scale;

  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vy: 0.15 + Math.random() * 0.35, // velocidade vertical
    swayAmp: 6 + Math.random() * 8,
    swaySpeed: 0.001 + Math.random() * 0.002,
    phase: Math.random() * Math.PI * 2,
    scale,
    spriteW,
    spriteH,
    palette: randomPalette()
  };
}

function initRobots() {
  robots = [];
  const w = window.innerWidth;
  const h = window.innerHeight;
  const count = Math.min(24, Math.floor((w * h) / 50000)); // escala com a tela

  for (let i = 0; i < count; i++) {
    robots.push(createRobot(w, h));
  }
}
initRobots();
window.addEventListener("resize", initRobots);

function drawRobot(r) {
  const { x, y, scale, palette } = r;

  for (let row = 0; row < robotSprite.length; row++) {
    const line = robotSprite[row];
    for (let col = 0; col < line.length; col++) {
      const key = line[col];
      if (key === ".") continue;
      const color = palette[key];
      if (!color) continue;

      ctx.fillStyle = color;
      ctx.fillRect(
        Math.round(x + col * scale),
        Math.round(y + row * scale),
        Math.ceil(scale),
        Math.ceil(scale)
      );
    }
  }
}

let lastTime = performance.now();

function loop(now) {
  const dt = now - lastTime;
  lastTime = now;

  const w = window.innerWidth;
  const h = window.innerHeight;

  // fundo: gradiente em tons de azul roxinho
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#030712");
  g.addColorStop(0.5, "#050816");
  g.addColorStop(1, "#020617");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // estrelas simples
  ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
  for (let i = 0; i < 120; i++) {
    const sx = (i * 73) % w;
    const sy = (i * 137 + now * 0.01) % h;
    if (Math.random() < 0.01) {
      ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
    }
  }

  // desenha e atualiza robôs
  robots.forEach((r) => {
    r.y += r.vy * dt * 0.05;
    r.x += Math.sin(now * r.swaySpeed + r.phase) * 0.1;

    if (r.y > h + r.spriteH) {
      r.y = -r.spriteH - Math.random() * 40;
      r.x = Math.random() * w;
    }

    drawRobot(r);
  });

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
