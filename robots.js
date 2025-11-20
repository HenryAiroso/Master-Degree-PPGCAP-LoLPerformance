/**
 * ROBOTS.JS
 * Sistema de Agentes Autônomos em Pixel Art
 * Desenha e anima robôs que "vivem" nas plataformas do cenário.
 */

(function () {
  const canvas = document.getElementById("robot-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const DPR = window.devicePixelRatio || 1;
  ctx.imageSmoothingEnabled = false;

  let width, height;
  let robots = [];
  let sparks = [];

  // Definição dos Sprites (Matrizes 0/1)
  // 1 = Pixel desenhado, 0 = Transparente
  const sprites = {
    idle: [
      [0,1,1,1,0],
      [0,1,0,1,0], // Olhos
      [1,1,1,1,1], // Corpo
      [0,1,1,1,0],
      [0,1,0,1,0]  // Pernas
    ],
    walk1: [
      [0,1,1,1,0],
      [0,1,0,1,0],
      [1,1,1,1,1],
      [0,1,1,1,0],
      [1,0,0,0,1]  // Pernas abertas
    ],
    walk2: [
      [0,1,1,1,0],
      [0,1,0,1,0],
      [1,1,1,1,1],
      [0,1,1,1,0],
      [0,1,0,1,0]  // Pernas juntas
    ],
    weld: [
      [0,0,1,1,0],
      [0,0,1,1,0],
      [0,1,1,1,1], // Braço estendido
      [0,1,1,1,1],
      [0,1,0,1,0]
    ]
  };

  // Classe Robô
  class Robot {
    constructor(yRatio, speed, type) {
      this.yRatio = yRatio; // Altura relativa (0.0 a 1.0)
      this.x = Math.random() * width;
      this.y = height * yRatio;
      this.speed = (Math.random() * 0.5 + 0.2) * (Math.random() < 0.5 ? 1 : -1);
      this.color = type === 'worker' ? '#dcdacb' : '#44d65c'; // Branco ou Verde
      this.accent = type === 'worker' ? '#e53b44' : '#222';
      this.scale = 3; // Tamanho do pixel
      this.frame = 0;
      this.state = 'walking'; // walking, working, idle
      this.timer = 0;
      this.workDuration = 0;
    }

    update() {
      // Máquina de Estados Simples
      if (this.state === 'walking') {
        this.x += this.speed;
        this.timer++;

        // Troca frame de animação
        if (this.timer % 10 === 0) {
          this.frame = this.frame === 0 ? 1 : 0;
        }

        // Decisão: Parar para trabalhar?
        if (Math.random() < 0.005) {
          this.state = 'working';
          this.workDuration = 60 + Math.random() * 100;
        }

        // Limites da tela (Loop)
        if (this.x > width + 20) this.x = -20;
        if (this.x < -20) this.x = width + 20;

      } else if (this.state === 'working') {
        this.workDuration--;
        
        // Gera faíscas
        if (this.workDuration % 5 === 0) {
          createSpark(this.x + (this.speed > 0 ? 15 : -5), this.y + 5);
        }

        if (this.workDuration <= 0) {
          this.state = 'walking';
          // Chance de mudar de direção
          if (Math.random() < 0.5) this.speed *= -1;
        }
      }
    }

    draw() {
      let currentSprite;
      if (this.state === 'working') {
        currentSprite = sprites.weld;
      } else {
        currentSprite = this.frame === 0 ? sprites.walk1 : sprites.walk2;
      }

      ctx.save();
      ctx.translate(Math.round(this.x), Math.round(this.y));
      
      // Inverter se estiver andando para a esquerda
      if (this.speed < 0) {
        ctx.scale(-1, 1);
      }

      // Desenha o sprite pixel a pixel
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (currentSprite[r][c] === 1) {
            // Corpo ou Detalhe?
            if (r === 1 && c === 2) ctx.fillStyle = this.accent; // Olho/Detalhe
            else ctx.fillStyle = this.color;
            
            ctx.fillRect(c * this.scale, r * this.scale, this.scale, this.scale);
          }
        }
      }
      ctx.restore();
    }
  }

  // Sistema de Partículas (Faíscas)
  function createSpark(x, y) {
    sparks.push({ x, y, vy: -1 - Math.random(), vx: (Math.random() - 0.5) * 2, life: 10 });
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * DPR;
    canvas.height = height * DPR;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    initRobots();
  }

  function initRobots() {
    robots = [];
    // Definir andares baseados na imagem (chute aproximado das plataformas)
    // Topo, Meio, Baixo
    const floors = [0.28, 0.45, 0.55, 0.72]; 
    
    floors.forEach(y => {
      // Adiciona 1 ou 2 robôs por andar
      let count = Math.floor(Math.random() * 2) + 1;
      for(let k=0; k<count; k++) {
        robots.push(new Robot(y, 0, Math.random() > 0.5 ? 'worker' : 'drone'));
      }
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Atualiza e desenha Robôs
    robots.forEach(r => {
      r.update();
      r.draw();
    });

    // Atualiza e desenha Faíscas
    for (let i = sparks.length - 1; i >= 0; i--) {
      let s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life--;
      
      ctx.fillStyle = `rgba(255, 200, 50, ${s.life / 10})`;
      ctx.fillRect(s.x, s.y, 2, 2);

      if (s.life <= 0) sparks.splice(i, 1);
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  resize();
  animate();
})();
