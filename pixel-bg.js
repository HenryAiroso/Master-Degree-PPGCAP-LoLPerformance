// lab-fx.js
// Animações leves sobre a arte estática:
// - Nuvens extras em pixel art (camada superior)
// - Partículas de "dados" perto do console central

(function () {
  const canvas = document.getElementById("fx-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const DPR = window.devicePixelRatio || 1;
  ctx.imageSmoothingEnabled = false;

  let width = 0;
  let height = 0;

  let clouds = [];
  let particles = [];

  let lastTime = performance.now();

  // ---------- Utils ----------
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  // ---------- Resize ----------
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = width * DPR;
    canvas.height = height * DPR;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    initClouds();
  }

  window.addEventListener("resize", resize);
  resize();

  // ---------- Clouds ----------
  function initClouds() {
    clouds = [];
    const count = 6;

    for (let i = 0; i < count; i++) {
      const layer = i < 3 ? 0 : 1; // 0 = fundo, 1 = frente
      const yBase = layer === 0 ? 0.12 : 0.2;

      clouds.push({
        x: rand(0, width),
        y: height * (yBase + rand(-0.04, 0.04)),
        w: rand(90, 160),
        h: rand(16, 22),
        speed: layer === 0 ? rand(4, 8) : rand(8, 14), // px/s
        layer
      });
    }
  }

  function updateClouds(dt) {
    const skyTop = height * 0.02;
    const skyBottom = height * 0.45;

    clouds.forEach((c) => {
      c.x += c.speed * dt;
      if (c.x > width + c.w) {
        c.x = -c.w - 20;
        const yBase = c.layer === 0 ? 0.12 : 0.2;
        c.y = height * (yBase + rand(-0.04, 0.04));
      }
      // garante que fica na faixa de céu
      c.y = Math.min(Math.max(c.y, skyTop), skyBottom - c.h);
    });
  }

  function drawClouds() {
    ctx.save();
    ctx.fillStyle = "rgba(241, 245, 249, 0.9)";

    clouds.forEach((c) => {
      const x = c.x;
      const y = c.y;
      const w = c.w;
      const h = c.h;

      // blocos empilhados para dar cara de nuvem pixelada
      ctx.fillRect(Math.round(x), Math.round(y), w, h);
      ctx.fillRect(
        Math.round(x + w * 0.2),
        Math.round(y - h * 0.5),
        w * 0.45,
        h * 0.8
      );
      ctx.fillRect(
        Math.round(x + w * 0.5),
        Math.round(y + h * 0.3),
        w * 0.35,
        h * 0.6
      );
    });

    ctx.restore();
  }

  // ---------- Partículas de dados ----------
  function spawnParticle() {
    // região aproximada do "console" central da arte
    const centerX = width * 0.5;
    const centerY = height * 0.6;

    particles.push({
      x: centerX + rand(-width * 0.04, width * 0.04),
      y: centerY + rand(-height * 0.02, height * 0.02),
      vx: rand(-5, 5),
      vy: rand(-16, -8),
      life: rand(1.0, 1.6), // segundos
      age: 0,
      size: rand(3, 5)
    });
  }

  function updateParticles(dt) {
    // mantém um número pequeno e estável de partículas
    if (particles.length < 40 && Math.random() < 0.5) {
      spawnParticle();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += dt;
      if (p.age >= p.life) {
        particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  function drawParticles() {
    particles.forEach((p) => {
      const t = p.age / p.life;
      const alpha = 1 - t;

      ctx.fillStyle = `rgba(56, 189, 248, ${0.7 * alpha})`;
      ctx.fillRect(
        Math.round(p.x),
        Math.round(p.y),
        p.size,
        p.size
      );

      // "glow" um pouco maior
      ctx.fillStyle = `rgba(56, 189, 248, ${0.25 * alpha})`;
      ctx.fillRect(
        Math.round(p.x - 1),
        Math.round(p.y - 1),
        p.size + 2,
        p.size + 2
      );
    });
  }

  // ---------- Loop ----------
  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000); // limita a 50 ms
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    updateClouds(dt);
    updateParticles(dt);

    drawClouds();
    drawParticles();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
