// ===============================================
//  Pixel City + Robots Background (Canvas 2D)
//  Estilo: cidade 2D indie, pós-apocalipse verde
// ===============================================
const canvas = document.getElementById("pixel-bg");
const ctx = canvas.getContext("2d");

const DPR = window.devicePixelRatio || 1;
let robots = [];
let lastTime = performance.now();

// -------------------- Resize --------------------
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
window.addEventListener("resize", () => {
  resizeCanvas();
  initRobots();
});

// ----------------- Robot sprites ----------------
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

const ROLES = ["cleaner", "plumber", "coder"];

function randomPalette(role) {
  // paletas levemente diferentes por função
  let body, accent;
  switch (role) {
    case "cleaner":
      body = "#4ade80";      // verde
      accent = "#a3e635";
      break;
    case "plumber":
      body = "#38bdf8";      // azul
      accent = "#0ea5e9";
      break;
    case "coder":
    default:
      body = "#a855f7";      // roxo
      accent = "#f97316";
      break;
  }
  return {
    "1": "#111827", // contorno
    "2": body,      // corpo
    "3": "#facc15", // olhos
    "5": accent     // detalhe
  };
}

function createRobot(w, h) {
  const scale = 3 + Math.random() * 1.5;
  const spriteW = robotSprite[0].length * scale;
  const spriteH = robotSprite.length * scale;

  // faixa de "calçada" nas laterais do canal
  const groundY = h * 0.78;
  const side = Math.random() < 0.5 ? "left" : "right";
  const sideOffset = w * 0.22;

  let x;
  if (side === "left") {
    x = w * 0.1 + Math.random() * (sideOffset - spriteW - 20);
  } else {
    x = w - (w * 0.1 + Math.random() * (sideOffset - spriteW - 20) + spriteW);
  }

  const role = ROLES[Math.floor(Math.random() * ROLES.length)];

  return {
    x,
    y: groundY - spriteH,
    scale,
    spriteW,
    spriteH,
    role,
    palette: randomPalette(role),
    phase: Math.random() * Math.PI * 2,
    idleOffset: Math.random() * 20
  };
}

function initRobots() {
  robots = [];
  const w = window.innerWidth;
  const h = window.innerHeight;
  const baseCount = Math.min(12, Math.max(5, Math.floor(w / 160)));

  for (let i = 0; i < baseCount; i++) {
    robots.push(createRobot(w, h));
  }
}
initRobots();

// --------------- Desenho de ambiente ------------
function drawSkyGradient(w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#60a5fa");  // azul claro
  g.addColorStop(0.4, "#38bdf8");
  g.addColorStop(1, "#0f172a");  // azul escuro
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawClouds(t, w, h) {
  ctx.fillStyle = "rgba(248, 250, 252, 0.9)";
  const baseY = h * 0.16;
  for (let i = 0; i < 6; i++) {
    const speed = 0.003 + i * 0.0004;
    const x = ((t * speed * w) + i * (w / 6)) % (w + 80) - 40;
    const y = baseY + Math.sin(t * 0.0004 + i) * 8;

    ctx.fillRect(Math.round(x), Math.round(y), 52, 8);
    ctx.fillRect(Math.round(x + 10), Math.round(y - 6), 26, 10);
    ctx.fillRect(Math.round(x + 18), Math.round(y + 6), 30, 6);
  }
}

function drawDistantCity(w, h) {
  const horizon = h * 0.55;
  ctx.save();
  ctx.translate(0, horizon);
  for (let i = 0; i < 14; i++) {
    const bw = 26 + Math.random() * 26;
    const bh = 40 + Math.random() * 80;
    const x = (i / 14) * w + Math.random() * 12 - 20;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(Math.round(x), -bh, bw, bh);

    // pequenas janelas
    ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 3; c++) {
        if (Math.random() < 0.6) {
          const wx = x + 4 + c * 7;
          const wy = -bh + 6 + r * 8;
          ctx.fillRect(Math.round(wx), Math.round(wy), 3, 4);
        }
      }
    }
  }
  ctx.restore();
}

function drawCanalAndGround(w, h) {
  const horizon = h * 0.55;
  const canalWidth = w * 0.26;
  const canalX = w / 2 - canalWidth / 2;
  const bottom = h * 0.95;

  // água do canal
  const g = ctx.createLinearGradient(0, horizon, 0, bottom);
  g.addColorStop(0, "#22d3ee");
  g.addColorStop(1, "#0f766e");
  ctx.fillStyle = g;
  ctx.fillRect(canalX, horizon, canalWidth, bottom - horizon);

  // reflexos/pedrinhas
  ctx.fillStyle = "rgba(34, 211, 238, 0.3)";
  for (let i = 0; i < 30; i++) {
    const rx = canalX + 8 + Math.random() * (canalWidth - 16);
    const ry = horizon + 6 + Math.random() * (bottom - horizon - 20);
    ctx.fillRect(Math.round(rx), Math.round(ry), 8, 2);
  }

  // calçadas laterais
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, horizon, canalX, bottom - horizon + 6);
  ctx.fillRect(canalX + canalWidth, horizon, w - (canalX + canalWidth), bottom - horizon + 6);

  // vegetação baixa
  ctx.fillStyle = "#16a34a";
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * w;
    const y = horizon + (bottom - horizon) * Math.random();
    if (x > canalX && x < canalX + canalWidth) continue; // não dentro da água
    ctx.fillRect(Math.round(x), Math.round(y), 2, 4);
  }
}

function drawBridge(w, h, t) {
  const horizon = h * 0.55;
  const y = horizon - 32;

  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.1, y);
  ctx.lineTo(w * 0.9, y);
  ctx.stroke();

  // cabos
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.1, y);
  ctx.quadraticCurveTo(w * 0.5, y - 30, w * 0.9, y);
  ctx.stroke();

  // torres
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.28, y + 32);
  ctx.lineTo(w * 0.28, y - 26);
  ctx.moveTo(w * 0.72, y + 32);
  ctx.lineTo(w * 0.72, y - 26);
  ctx.stroke();

  // pisos
  ctx.fillStyle = "#78350f";
  ctx.fillRect(w * 0.1, y + 6, w * 0.8, 6);

  // pequenas luzes piscando na ponte
  const blink = (Math.sin(t * 0.003) + 1) / 2;
  ctx.fillStyle = `rgba(252, 211, 77, ${0.4 + 0.4 * blink})`;
  for (let i = 0; i < 12; i++) {
    const lx = w * 0.1 + (w * 0.8 / 11) * i;
    ctx.fillRect(Math.round(lx), y + 4, 2, 2);
  }
}

function drawForegroundBuildings(w, h, t) {
  const horizon = h * 0.55;
  const bottom = h * 0.95;

  function drawBuilding(x, width, height, flipVines) {
    const top = bottom - height;

    // bloco principal
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(Math.round(x), Math.round(top), width, height);

    // janelas
    for (let r = 0; r < Math.floor(height / 14); r++) {
      for (let c = 0; c < Math.floor(width / 14); c++) {
        if (Math.random() < 0.7) {
          ctx.fillStyle = "#111827";
        } else {
          ctx.fillStyle = "#facc15";
        }
        const wx = x + 3 + c * 10;
        const wy = top + 4 + r * 10;
        ctx.fillRect(Math.round(wx), Math.round(wy), 6, 6);
      }
    }

    // vinhas descendo
    ctx.fillStyle = "#16a34a";
    const vines = 4;
    for (let i = 0; i < vines; i++) {
      const vx = x + 4 + (i / vines) * (width - 8);
      const length = height * (0.5 + Math.random() * 0.5);
      ctx.fillRect(Math.round(vx), Math.round(top + (flipVines ? 6 : 0)), 2, length);
    }

    // pequena turbina / antena em cima
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(Math.round(x + width / 2 - 4), Math.round(top - 8), 8, 8);
    ctx.fillRect(Math.round(x + width / 2 - 1), Math.round(top - 18), 2, 10);
  }

  // esquerda
  drawBuilding(w * 0.02, w * 0.16, bottom - horizon + 10, false);
  drawBuilding(w * 0.18, w * 0.14, bottom - (horizon + 20), true);

  // direita
  drawBuilding(w * 0.84, w * 0.14, bottom - (horizon + 18), false);
  drawBuilding(w * 0.68, w * 0.16, bottom - (horizon + 6), true);

  // pequenas barracas / boxes na parte de baixo
  ctx.fillStyle = "#b45309";
  const stallY = bottom - 24;
  for (let i = 0; i < 4; i++) {
    const sx = w * 0.06 + i * 40;
    ctx.fillRect(Math.round(sx), stallY, 30, 18);
  }
  for (let i = 0; i < 4; i++) {
    const sx = w * 0.64 + i * 40;
    ctx.fillRect(Math.round(sx), stallY, 30, 18);
  }

  // toldos coloridos
  const awningColors = ["#f97316", "#22c55e", "#3b82f6", "#eab308"];
  for (let i = 0; i < 4; i++) {
    const sx = w * 0.06 + i * 40;
    ctx.fillStyle = awningColors[i % awningColors.length];
    ctx.fillRect(Math.round(sx), stallY - 8, 30, 8);
  }
  for (let i = 0; i < 4; i++) {
    const sx = w * 0.64 + i * 40;
    ctx.fillStyle = awningColors[(i + 1) % awningColors.length];
    ctx.fillRect(Math.round(sx), stallY - 8, 30, 8);
  }
}

// --------------- Robôs e animações --------------
function drawRobotSprite(r, time) {
  const { x, y, scale, palette, role, idleOffset } = r;
  const bob = Math.sin(time * 0.003 + idleOffset) * 1; // leve "pulo"

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
        Math.round(y + row * scale + bob),
        Math.ceil(scale),
        Math.ceil(scale)
      );
    }
  }

  // overlays: "trabalhos" diferentes
  ctx.save();
  if (role === "cleaner") {
    // vassoura
    ctx.fillStyle = "#f97316";
    ctx.fillRect(
      Math.round(x - 4),
      Math.round(y + robotSprite.length * scale - 2 + bob),
      3,
      8
    );
    ctx.fillStyle = "#facc15";
    ctx.fillRect(
      Math.round(x - 6),
      Math.round(y + robotSprite.length * scale + 6 + bob),
      7,
      3
    );
  } else if (role === "plumber") {
    // cano + gotinha
    ctx.fillStyle = "#64748b";
    ctx.fillRect(
      Math.round(x + robotSprite[0].length * scale + 2),
      Math.round(y + robotSprite.length * scale - 10 + bob),
      10,
      4
    );
    ctx.fillRect(
      Math.round(x + robotSprite[0].length * scale + 8),
      Math.round(y + robotSprite.length * scale - 6 + bob),
      4,
      10
    );
    ctx.fillStyle = "#38bdf8";
    const dripY =
      y +
      robotSprite.length * scale -
      6 +
      bob +
      Math.abs(Math.sin(time * 0.005 + idleOffset)) * 6;
    ctx.fillRect(
      Math.round(x + robotSprite[0].length * scale + 10),
      Math.round(dripY),
      2,
      3
    );
  } else if (role === "coder") {
    // terminal/computador
    const screenX = x + robotSprite[0].length * scale + 4;
    const screenY = y + 4 + bob;
    ctx.fillStyle = "#020617";
    ctx.fillRect(Math.round(screenX), Math.round(screenY), 18, 14);
    const glow =
      (Math.sin(time * 0.006 + idleOffset) + 1) / 2; // 0..1
    ctx.fillStyle = `rgba(96, 165, 250, ${0.4 + glow * 0.4})`;
    ctx.fillRect(Math.round(screenX + 2), Math.round(screenY + 3), 14, 6);

    // linha de código piscando
    ctx.fillStyle = "#22c55e";
    if (Math.floor(time / 400) % 2 === 0) {
      ctx.fillRect(Math.round(screenX + 3), Math.round(screenY + 11), 10, 2);
    }
  }
  ctx.restore();
}

function updateRobots(time, dt) {
  const w = window.innerWidth;
  const horizon = window.innerHeight * 0.55;

  robots.forEach((r, idx) => {
    // movimento horizontal bem discreto de "ida e volta"
    const dir = idx % 2 === 0 ? 1 : -1;
    r.x += dir * 0.01 * dt;

    // limite para não cair no canal
    const canalWidth = w * 0.26;
    const canalX = w / 2 - canalWidth / 2;
    const margin = 12;

    if (r.x < margin) r.x = margin;
    if (r.x + r.spriteW > canalX - margin && r.x < canalX) {
      r.x = canalX - r.spriteW - margin;
    }
    if (r.x > canalX + canalWidth - margin && r.x < w - r.spriteW - margin) {
      r.x = canalX + canalWidth + margin;
    }
    if (r.x + r.spriteW > w - margin) r.x = w - r.spriteW - margin;
  });
}

// ---------------------- Loop --------------------
function loop(now) {
  const dt = now - lastTime;
  lastTime = now;

  const w = window.innerWidth;
  const h = window.innerHeight;

  drawSkyGradient(w, h);
  drawClouds(now, w, h);
  drawDistantCity(w, h);
  drawCanalAndGround(w, h);
  drawBridge(w, h, now);
  drawForegroundBuildings(w, h, now);

  updateRobots(now, dt);
  robots.forEach((r) => drawRobotSprite(r, now));

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
