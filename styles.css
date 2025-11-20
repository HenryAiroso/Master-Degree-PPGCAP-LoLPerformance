:root {
  --accent: #4af7ff;
  --accent2: #ffb347;
  --panel-border: #22d3ee;
  --panel-glow: rgba(34, 211, 238, 0.9);
  --panel-bg: rgba(5, 10, 25, 0.9);
  --text-main: #f9fafb;
  --text-muted: #9ca3af;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  font-family: "JetBrains Mono", monospace;
  color: var(--text-main);
  background: #000;
  overflow-x: hidden;
}

/* ===== CENA BASE ===== */
.scene {
  position: relative;
  min-height: 120vh;
}

.scene__base {
  position: fixed;
  inset: 0;
  background-image: url("lab-base.png"); /* ajusta o nome se for outro */
  background-size: cover;
  background-position: center;
  image-rendering: pixelated;
  z-index: -3;
}

.scene__fx {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -2;
}

/* Vinheta para focar no prédio */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 170px rgba(0, 0, 0, 0.85);
  z-index: -1;
}

/* Canvas transparente das animações JS */
#fx-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  image-rendering: pixelated;
}

/* ===== GLOWS EM TELAS DA ARTE ===== */

.screen-glow {
  position: absolute;
  background: rgba(34, 211, 238, 0.12);
  border: 1px solid rgba(34, 211, 238, 0.7);
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.9);
  border-radius: 4px;
  animation: screenPulse 2.6s ease-in-out infinite;
}

/* coordenadas aproximadas em cima da arte */
.screen-glow--center {
  left: 50%;
  top: 56%;
  width: 26vw;
  height: 12vh;
  transform: translate(-50%, -50%);
}

.screen-glow--upper-left {
  left: 38%;
  top: 39%;
  width: 14vw;
  height: 7vh;
  transform: translate(-50%, -50%);
}

.screen-glow--upper-right {
  left: 63%;
  top: 37%;
  width: 15vw;
  height: 7vh;
  transform: translate(-50%, -50%);
}

.screen-glow--bottom-left {
  left: 41%;
  top: 69%;
  width: 15vw;
  height: 6.5vh;
  transform: translate(-50%, -50%);
}

.screen-glow--bottom-right {
  left: 61%;
  top: 72%;
  width: 14vw;
  height: 6.5vh;
  transform: translate(-50%, -50%);
}

/* faísca do robô soldando */
.spark {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fbbf24;
  box-shadow: 0 0 18px rgba(251, 191, 36, 0.95);
  animation: sparkFlicker 0.5s infinite alternate;
}

.spark--welder {
  left: 66%;
  top: 33%;
}

@keyframes screenPulse {
  0% {
    opacity: 0.55;
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.6);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 24px rgba(34, 211, 238, 1);
  }
  100% {
    opacity: 0.55;
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.6);
  }
}

@keyframes sparkFlicker {
  0% {
    transform: scale(0.7) translateY(0);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1) translateY(-3px);
    opacity: 1;
  }
  100% {
    transform: scale(0.6) translateY(1px);
    opacity: 0.5;
  }
}

/* ===== PAINÉIS HUD INTEGRADOS NA CENA ===== */

.overlay {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  height: 120vh; /* espaço pra espalhar os painéis */
}

/* painel base holográfico */
.panel {
  position: absolute;
  padding: 0.9rem 1.1rem;
  background: var(--panel-bg);
  border-radius: 12px;
  border: 2px solid var(--panel-border);
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.9),
    0 0 18px var(--panel-glow);
  backdrop-filter: blur(2px);
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--text-main);
  max-height: 21vh;
  overflow-y: auto;
}

/* “moldura interna” estilo painel */
.panel::before {
  content: "";
  position: absolute;
  inset: 4px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  pointer-events: none;
}

/* outdoor de título (topo da construção) */
.panel-title {
  top: 7vh;
  left: 50%;
  transform: translateX(-50%);
  width: 42vw;
  max-height: 17vh;
}

/* painel overview no centro */
.panel-overview {
  top: 26vh;
  left: 50%;
  transform: translateX(-50%);
  width: 55vw;
}

/* goals à esquerda, API à direita, na faixa do meio */
.panel-goals {
  top: 46vh;
  left: 27%;
  transform: translateX(-50%);
  width: 30vw;
}

.panel-api {
  top: 46vh;
  left: 73%;
  transform: translateX(-50%);
  width: 30vw;
}

/* parte de baixo: tech stack e ethics */
.panel-tech {
  top: 66vh;
  left: 27%;
  transform: translateX(-50%);
  width: 30vw;
}

.panel-ethics {
  top: 66vh;
  left: 73%;
  transform: translateX(-50%);
  width: 30vw;
}

/* painel final logo acima do rodapé do prédio */
.panel-legal {
  top: 86vh;
  left: 50%;
  transform: translateX(-50%);
  width: 52vw;
  max-height: 20vh;
}

/* Tipografia dos painéis */

.badge {
  display: inline-block;
  font-size: 0.6rem;
  text-transform: uppercase;
  padding: 0.18rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--accent2);
  background: rgba(0, 0, 0, 0.75);
}

.panel-title h1 {
  font-family: "Press Start 2P", system-ui;
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  line-height: 1.5;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-top: 0.35rem;
}

.panel-title h1 span {
  color: var(--accent2);
}

.subtitle {
  margin-top: 0.7rem;
  color: var(--text-muted);
  font-size: 0.78rem;
}

.panel h2 {
  font-family: "Press Start 2P", system-ui;
  font-size: 0.85rem;
  margin-bottom: 0.7rem;
}

.panel h3 {
  margin-bottom: 0.4rem;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--accent);
}

.panel p {
  margin-bottom: 0.5rem;
}

.panel ul {
  margin-left: 1.1rem;
}

.panel li + li {
  margin-top: 0.25rem;
}

.panel code {
  background: #020617;
  padding: 0.05rem 0.3rem;
  border-radius: 4px;
  border: 1px solid #1f2937;
  font-size: 0.78rem;
}

/* tags + botão dentro do painel-legal */

.tags {
  margin-top: 0.6rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  list-style: none;
}

.tags li {
  font-size: 0.68rem;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--accent);
  background: rgba(0, 0, 0, 0.7);
}

.btn {
  display: inline-block;
  margin-top: 0.6rem;
  font-family: "Press Start 2P", system-ui;
  font-size: 0.7rem;
  text-decoration: none;
  text-transform: uppercase;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  border: 2px solid var(--accent2);
  background: linear-gradient(135deg, #1f2937, #020617);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.9);
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    filter 0.1s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.95);
  filter: brightness(1.08);
}

/* ===== RESPONSIVO: mobile volta a ser em coluna ===== */

@media (max-width: 900px) {
  .scene {
    min-height: auto;
  }

  .overlay {
    height: auto;
    max-width: 640px;
    padding: 5vh 1rem 8vh;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .panel {
    position: static;
    width: 100%;
    transform: none;
    max-height: none;
    overflow: visible;
  }

  .panel-title {
    max-height: none;
  }

  .panel-legal {
    max-height: none;
  }
}

@media (max-width: 640px) {
  .panel {
    padding: 0.85rem 0.95rem 1rem;
  }

  .panel::before {
    inset: 3px;
  }

  .panel-title h1 {
    font-size: 1.05rem;
  }

  .subtitle {
    font-size: 0.75rem;
  }
}
