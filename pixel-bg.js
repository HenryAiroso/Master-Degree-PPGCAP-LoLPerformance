// =====================================================
//  Pixel Lab: prédio de robôs em camadas (Canvas 2D)
//  - Plano de fundo: céu + nuvens + árvores
//  - Plano intermediário: prédio multi-andar
//  - Plano frontal: robôs e detalhes animados
// =====================================================

const canvas = document.getElementById("pixel-bg");
if (!canvas) {
  // se o elemento não existir, não faz nada
  // (protege caso o HTML mude)
} else {
  const ctx = canvas.getContext("2d");
  const DPR = window.devicePixelRatio || 1;

  // "mundo" lógico da cena
  const scene = {
    width: window.innerWidth,
    height: window.innerHeight,
    buildingX: 0,
    buildingWidth: 0,
    buildingTop: 0,
    buildingHeight: 0,
    floorYs: [],
    floorCount: 6
  };

  const clouds = [];
  let robots = [];
  let lastTime = performance.now();

  // ----------------- Geometria da cena -----------------
  function updateSceneGeometry() {
    scene.width = window.innerWidth;
    scene.height = window.innerHeight;

    const w = scene.width;
    const h = scene.height;

    // prédio ocupa ~70% da largura, centralizado
    scene.buildingWidth = Math.min(w * 0.68, 960);
    scene.buildingX = (w - scene.buildingWidth) / 2;

    // topo do prédio e base (deixa um pouco de céu em cima e grama embaixo)
    scene.buildingTop = h * 0.16;
    const bottom = h * 0.9;
    scene.buildingHeight = bottom - scene.buildingTop;

    // linhas de piso (andares internos)
    scene.floorYs = [];
    const levels = scene.floorCount;
    for (let i = 0; i < levels; i++) {
      const t = (i + 1) / (levels + 1); // distribui entre topo e base
      scene.floorYs.push(scene.buildingTop + scene.buildingHeight * t);
    }
  }

  // ----------------- Resize do canvas ------------------
  function resizeCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = w * DPR;
    canvas.height = h * DPR;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    updateSceneGeometry();
  }

  // -------------------- Nuvens -------------------------
  function initClouds() {
    clouds.length = 0;
    const count = 7;
    for (let i = 0; i < count; i++) {
      clouds.push({
        x: Math.random() * scene.width,
        y: scene.height * (0.06 + Math.random() * 0.22),
        width: 80 + Math.random() * 120,
        height: 18 + Math.random() * 8,
        speed: 0.02 + Math.random() * 0.04
      });
    }
  }

  function updateAndDrawClouds(dt) {
    ctx.fillStyle = "rgba(248, 250, 252, 0.9)";
    const w = scene.width;

    clouds.forEach((c) => {
      c.x += c.speed * dt;
      if (c.x > w + c.width) c.x = -c.width - 20;

      const x = c.x;
      const y = c.y;
      const cw = c.width;
      const ch = c.height;

      // bloco principal
      ctx.fillRect(Math.round(x), Math.round(y), cw, ch);
      // "bolhas" extras para forma irregular
      ctx.fillRect(Math.round(x + cw * 0.15), Math.round(y - ch * 0.4), cw * 0.4, ch * 0.7);
      ctx.fillRect(Math.round(x + cw * 0.45), Math.round(y + ch * 0.3), cw * 0.35, ch * 0.6);
    });
  }

  // ----------------- Robôs (sprites) -------------------

  // 12x12 sprites em "pixels" lógicos.
  // 1 = contorno, 2 = metal escuro, 3 = metal claro,
  // 4 = visor/olhos, 5 = acento de cor, 6 = rodas/jato.
  const ROBOT_TYPES = [
    {
      name: "walker",
      movement: "ground",
      sprite: [
        ".....11.....",
        "...111111...",
        "..13333331..",
        "..13344331..",
        "..12222221..",
        ".1222222221.",
        ".1222222221.",
        ".1522222251.",
        "..12222221..",
        "..12....21..",
        "..12....21..",
        "..11....11.."
      ]
    },
    {
      name: "wheeler",
      movement: "ground",
      sprite: [
        ".....11.....",
        "...111111...",
        "..13333331..",
        "..13344331..",
        "..12222221..",
        ".1222222221.",
        ".1222222221.",
        ".1522222251.",
        "...166661...",
        "...166661...",
        "...166661...",
        "....1111...."
      ]
    },
    {
      name: "hover",
      movement: "hover",
      sprite: [
        ".....11.....",
        "...111111...",
        "..13333331..",
        "..13344331..",
        "..12222221..",
        ".1222222221.",
        ".1222222221.",
        ".1522222251.",
        "..12222221..",
        "...16661....",
        "...16661....",
        "....111....."
      ]
    }
  ];

  const ROLES = ["cleaner", "plumber", "coder"];

  function randomPalette(role) {
    let accent;
    switch (role) {
      case "cleaner":
        accent = "#22c55e"; // verde
        break;
      case "plumber":
        accent = "#38bdf8"; // azul
        break;
      case "coder":
      default:
        accent = "#a855f7"; // roxo
        break;
    }
    return {
      "1": "#020617",  // contorno
      "2": "#4b5563",  // metal escuro
      "3": "#e5e7eb",  // metal claro
      "4": "#22d3ee",  // visor/olhos
      "5": accent,     // detalhes
      "6": "#f97316"   // rodas / jato
    };
  }

  // Layout fixo dos robôs: cada um em um andar/posição
  const ROBOT_LAYOUT = [
    { type: "walker", role: "coder",   floorIndex: 2, offset: 0.48 },
    { type: "walker", role: "cleaner", floorIndex: 4, offset: 0.25 },
    { type: "walker", role: "plumber", floorIndex: 3, offset: 0.78 },
    { type: "wheeler", role: "cleaner", floorIndex: 1, offset: 0.18 },
    { type: "wheeler", role: "plumber", floorIndex: 0, offset: 0.72 },
    { type: "hover",   role: "coder",   floorIndex: 0, offset: 0.35 },
    { type: "hover",   role: "cleaner", floorIndex: 5, offset: 0.6 }
  ];

  function initRobots() {
    robots = [];
    const w = scene.width;
    const buildingX = scene.buildingX;
    const bWidth = scene.buildingWidth;

    ROBOT_LAYOUT.forEach((spec) => {
      const type = ROBOT_TYPES.find((t) => t.name === spec.type) || ROBOT_TYPES[0];
      const scale = 3 + Math.random() * 1.2;
      const spriteW = type.sprite[0].length * scale;
      const spriteH = type.sprite.length * scale;

      const floorY = scene.floorYs[Math.min(spec.floorIndex, scene.floorYs.length - 1)];
      const x = buildingX + spec.offset * (bWidth - spriteW);
      const baseY = floorY - spriteH + 4; // leve ajuste vertical

      const role = spec.role;
      const palette = randomPalette(role);

      robots.push({
        type,
        sprite: type.sprite,
        role,
        palette,
        scale,
        spriteW,
        spriteH,
        x,
        baseY,
        idleOffset: Math.random() * 20
      });
    });
  }

  // Desenho de um robô + overlay da "tarefa"
  function drawRobot(robot, time) {
    const { x, baseY, scale, sprite, palette, role, type, idleOffset } = robot;
    const isHover = type.movement === "hover";
    const bob = Math.sin(time * 0.004 + idleOffset) * (isHover ? 4 : 1);
    const y = baseY + bob;

    for (let row = 0; row < sprite.length; row++) {
      const line = sprite[row];
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

    // overlays: ferramentas simples por papel
    ctx.save();
    if (role === "cleaner") {
      // vassoura no chão
      ctx.fillStyle = "#f97316";
      ctx.fillRect(
        Math.round(x - 4),
        Math.round(y + sprite.length * scale - 2),
        3,
        10
      );
      ctx.fillStyle = "#eab308";
      ctx.fillRect(
        Math.round(x - 6),
        Math.round(y + sprite.length * scale + 6),
        7,
        3
      );
    } else if (role === "plumber") {
      // cano + gota animada
      ctx.fillStyle = "#64748b";
      ctx.fillRect(
        Math.round(x + sprite[0].length * scale + 2),
        Math.round(y + sprite.length * scale - 10),
        10,
        4
      );
      ctx.fillRect(
        Math.round(x + sprite[0].length * scale + 8),
        Math.round(y + sprite.length * scale - 6),
        4,
        10
      );
      ctx.fillStyle = "#38bdf8";
      const dripY =
        y +
        sprite.length * scale -
        6 +
        Math.abs(Math.sin(time * 0.005 + idleOffset)) * 6;
      ctx.fillRect(
        Math.round(x + sprite[0].length * scale + 10),
        Math.round(dripY),
        2,
        3
      );
    } else if (role === "coder") {
      // terminal/monitor ao lado
      const screenX = x + sprite[0].length * scale + 4;
      const screenY = y + 4;
      ctx.fillStyle = "#020617";
      ctx.fillRect(Math.round(screenX), Math.round(screenY), 20, 14);
      const glow = (Math.sin(time * 0.006 + idleOffset) + 1) / 2;
      ctx.fillStyle = `rgba(96, 165, 250, ${0.4 + glow * 0.4})`;
      ctx.fillRect(Math.round(screenX + 2), Math.round(screenY + 3), 16, 7);
      ctx.fillStyle = "#22c55e";
      if (Math.floor(time / 400) % 2 === 0) {
        ctx.fillRect(Math.round(screenX + 3), Math.round(screenY + 11), 11, 2);
      }
    }
    ctx.restore();
  }

  // --------------- Desenho do cenário -----------------

  function drawBackgroundSky() {
    const w = scene.width;
    const h = scene.height;

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0f172a");
    g.addColorStop(0.35, "#38bdf8");
    g.addColorStop(1, "#22c55e");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // faixa de árvores atrás do prédio
    const treeLineY = h * 0.82;
    ctx.fillStyle = "#166534";
    ctx.fillRect(0, treeLineY, w, h - treeLineY);
    ctx.fillStyle = "#22c55e";
    for (let i = 0; i < 40; i++) {
      const x = (i / 40) * w + (Math.random() - 0.5) * 24;
      const r = 14 + Math.random() * 16;
      ctx.beginPath();
      ctx.arc(x, treeLineY, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBackPipes() {
    const w = scene.width;
    const h = scene.height;
    const pipeWidth = Math.max(40, w * 0.06);

    ctx.fillStyle = "#020617";
    // colunas laterais "de fundo"
    ctx.fillRect(0, 0, pipeWidth, h);
    ctx.fillRect(w - pipeWidth, 0, pipeWidth, h);

    ctx.fillStyle = "#111827";
    ctx.fillRect(6, 0, pipeWidth - 12, h);
    ctx.fillRect(w - pipeWidth + 6, 0, pipeWidth - 12, h);
  }

  function drawBuildingStructure(time) {
    const x = scene.buildingX;
    const w = scene.buildingWidth;
    const top = scene.buildingTop;
    const h = scene.buildingHeight;
    const bottom = top + h;

    // bloco externo
    ctx.fillStyle = "#020617";
    ctx.fillRect(Math.round(x - 8), Math.round(top - 10), w + 16, h + 20);

    // corpo principal
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(Math.round(x), Math.round(top), w, h);

    // interior (um pouco mais claro)
    ctx.fillStyle = "#111827";
    ctx.fillRect(Math.round(x + 6), Math.round(top + 6), w - 12, h - 12);

    // pisos
    ctx.strokeStyle = "#020617";
    ctx.lineWidth = 2;
    ctx.beginPath();
    scene.floorYs.forEach((fy) => {
      ctx.moveTo(x + 10, fy);
      ctx.lineTo(x + w - 10, fy);
    });
    ctx.stroke();

    // colunas verticais (salas)
    const cols = 4;
    ctx.beginPath();
    for (let i = 1; i < cols; i++) {
      const cx = x + (w / cols) * i;
      ctx.moveTo(cx, top + 10);
      ctx.lineTo(cx, bottom - 10);
    }
    ctx.stroke();

    // algumas portas e janelas internas
    ctx.fillStyle = "#020617";
    for (let i = 0; i < scene.floorYs.length; i++) {
      const fy = scene.floorYs[i];
      const roomHeight =
        (i === 0 ? fy - top : fy - scene.floorYs[i - 1]) - 8;
      const roomTop = fy - roomHeight;

      // porta
      if (i % 2 === 0) {
        const px = x + w * 0.1;
        const pw = 26;
        const ph = 30;
        ctx.fillRect(Math.round(px), Math.round(fy - ph - 4), pw, ph);
      }

      // pequena janela iluminada
      ctx.fillStyle = i % 2 === 0 ? "#0f172a" : "#020617";
      const jx = x + w * 0.68;
      ctx.fillRect(Math.round(jx), Math.round(roomTop + 12), 60, 26);

      const flicker = (Math.sin(time * 0.004 + i) + 1) / 2;
      ctx.fillStyle = `rgba(56, 189, 248, ${0.25 + 0.4 * flicker})`;
      ctx.fillRect(Math.round(jx + 4), Math.round(roomTop + 15), 52, 20);
      ctx.fillStyle = "#111827";
    }

    // console central grande (andar do meio)
    const midIndex = Math.floor(scene.floorYs.length / 2);
    const midY = scene.floorYs[midIndex];
    const consoleY = midY - 42;
    const consoleX = x + w * 0.32;
    ctx.fillStyle = "#020617";
    ctx.fillRect(Math.round(consoleX), consoleY, 110, 36);

    const glow = (Math.sin(time * 0.006) + 1) / 2;
    ctx.fillStyle = `rgba(59, 130, 246, ${0.35 + 0.35 * glow})`;
    ctx.fillRect(Math.round(consoleX + 6), consoleY + 6, 44, 10);
    ctx.fillRect(Math.round(consoleX + 56), consoleY + 6, 44, 10);
    ctx.fillStyle = "#22c55e";
    if (Math.floor(time / 450) % 2 === 0) {
      ctx.fillRect(Math.round(consoleX + 8), consoleY + 20, 60, 3);
    }

    // luminárias penduradas
    ctx.fillStyle = "#0f172a";
    for (let i = 0; i < 5; i++) {
      const lx = x + w * (0.15 + 0.15 * i);
      const ly = top + 4;
      ctx.fillRect(Math.round(lx), ly, 2, 26);
      const pulse = (Math.sin(time * 0.005 + i) + 1) / 2;
      ctx.fillStyle = `rgba(251, 191, 36, ${0.4 + 0.4 * pulse})`;
      ctx.fillRect(Math.round(lx - 4), ly + 26, 10, 6);
      ctx.fillStyle = "#0f172a";
    }
  }

  function drawFrontPipesAndCables(time) {
    const w = scene.width;
    const h = scene.height;
    const pipeWidth = Math.max(40, w * 0.06);

    // bordas "frontais" dos tubos
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, h * 0.05, pipeWidth * 0.5, h * 0.9);
    ctx.fillRect(w - pipeWidth * 0.5, h * 0.05, pipeWidth * 0.5, h * 0.9);

    // cintas horizontais com luzinhas
    ctx.fillStyle = "#111827";
    const bands = [0.24, 0.52, 0.8];
    bands.forEach((t, idx) => {
      const y = h * t;
      ctx.fillRect(0, y, pipeWidth * 0.5, 6);
      ctx.fillRect(w - pipeWidth * 0.5, y, pipeWidth * 0.5, 6);

      const glow = (Math.sin(time * 0.004 + idx) + 1) / 2;
      ctx.fillStyle = `rgba(56, 189, 248, ${0.3 + glow * 0.4})`;
      ctx.fillRect(pipeWidth * 0.25 - 4, y + 1, 8, 4);
      ctx.fillRect(
        w - pipeWidth * 0.25 - 4,
        y + 1,
        8,
        4
      );
      ctx.fillStyle = "#111827";
    });

    // cabos laterais simples
    ctx.strokeStyle = "#020617";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pipeWidth * 0.5, h * 0.2);
    ctx.bezierCurveTo(w * 0.25, h * 0.3, w * 0.25, h * 0.45, scene.buildingX, scene.buildingTop + 40);
    ctx.moveTo(w - pipeWidth * 0.5, h * 0.3);
    ctx.bezierCurveTo(w * 0.75, h * 0.4, w * 0.75, h * 0.6, scene.buildingX + scene.buildingWidth, scene.buildingTop + 60);
    ctx.stroke();
  }

  // ---------------------- Loop ------------------------
  function loop(now) {
    const dt = now - lastTime;
    lastTime = now;

    drawBackgroundSky();
    updateAndDrawClouds(dt);
    drawBackPipes();
    drawBuildingStructure(now);
    // robôs são plano frontal intermediário
    robots.forEach((r) => drawRobot(r, now));
    // tubos/cabos em primeiro plano
    drawFrontPipesAndCables(now);

    requestAnimationFrame(loop);
  }

  // -------------------- Boot da cena ------------------
  resizeCanvas();
  initClouds();
  initRobots();
  window.addEventListener("resize", () => {
    resizeCanvas();
    initClouds();
    initRobots();
  });

  requestAnimationFrame(loop);
}
