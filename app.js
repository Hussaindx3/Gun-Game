const stages = [
  { level: 1, name: 'Desert Outpost', diff: 'Easy', count: 3, speed: 1.5, size: 50, pts: 10, shape: 'shape-circle' },
  { level: 2, name: 'Forest Range', diff: 'Medium', count: 4, speed: 2.3, size: 45, pts: 20, shape: 'shape-circle' },
  { level: 3, name: 'Canyon Sunset', diff: 'Hard', count: 5, speed: 3.2, size: 40, pts: 30, shape: 'shape-circle' },
  { level: 4, name: 'Cyber Neon', diff: 'Expert', count: 6, speed: 4.0, size: 36, pts: 40, shape: 'shape-circle' },
  { level: 5, name: 'Master Fortress (Class Challenge)', diff: 'MASTER', count: 8, speed: 5.0, size: 34, pts: 100, shape: 'shape-gold' }
];

const maxAllowedMiss = 3;

const arena = document.getElementById('game-arena');
const targetsLayer = document.getElementById('targets-layer');
const weapon = document.getElementById('weapon');

const stageTitle = document.getElementById('stage-title');
const stageDisplay = document.getElementById('stage-display');
const diffDisplay = document.getElementById('diff-display');
const targetsDisplay = document.getElementById('targets-display');
const missedDisplay = document.getElementById('missed-display');
const scoreDisplay = document.getElementById('score-display');

const modal = document.getElementById('game-modal');
const stageSelect = document.getElementById('stage-select');
const startGameBtn = document.getElementById('start-game-btn');
const instructionsBtn = document.getElementById('instructions-btn');
const restartBtn = document.getElementById('restart-btn');

let currentStageIndex = 0;
let score = 0;
let missedShots = 0;
let targets = [];
let isPlaying = false;
let animId = null;
let weaponX = 400;

function init() {
  stageSelect.innerHTML = '';
  stages.forEach((s, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `Stage ${s.level}: ${s.name} (${s.diff})`;
    stageSelect.appendChild(opt);
  });
}

function startNewGame(index) {
  currentStageIndex = index;
  score = 0;
  missedShots = 0;
  loadStage(currentStageIndex);
}

function loadStage(index) {
  cancelAnimationFrame(animId);
  targetsLayer.innerHTML = '';
  targets = [];
  modal.classList.add('hidden');

  const data = stages[index];
  stageTitle.textContent = `Stage ${data.level}: ${data.name}`;
  stageDisplay.textContent = `${data.level} / ${stages.length}`;
  diffDisplay.textContent = data.diff;
  updateHUD();

  const width = arena.clientWidth;

  for (let i = 0; i < data.count; i++) {
    const startX = Math.random() * (width - data.size - 40) + 20;
    const startY = 40 + (i % 3) * 55;
    const dir = i % 2 === 0 ? 1 : -1;

    const el = document.createElement('div');
    el.className = `target-board ${data.shape}`;
    el.style.width = `${data.size}px`;
    el.style.height = `${data.size}px`;
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;

    targetsLayer.appendChild(el);

    targets.push({
      el: el,
      x: startX,
      y: startY,
      size: data.size,
      vx: data.speed * dir
    });
  }

  isPlaying = true;
  gameLoop();
}

function gameLoop() {
  if (!isPlaying) return;

  const width = arena.clientWidth;

  targets.forEach(t => {
    t.x += t.vx;
    if (t.x <= 0) {
      t.x = 0;
      t.vx *= -1;
    } else if (t.x + t.size >= width) {
      t.x = width - t.size;
      t.vx *= -1;
    }
    t.el.style.left = `${t.x}px`;
  });

  animId = requestAnimationFrame(gameLoop);
}

// Mouse aiming movement for weapon
arena.addEventListener('mousemove', (e) => {
  if (!isPlaying) return;
  const rect = arena.getBoundingClientRect();
  weaponX = e.clientX - rect.left;
  weaponX = Math.max(25, Math.min(rect.width - 25, weaponX));
  weapon.style.left = `${weaponX}px`;
});

// Shooting & Laser Tracer Logic
arena.addEventListener('click', (e) => {
  if (!isPlaying) return;

  const rect = arena.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  let hitIdx = -1;
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    if (clickX >= t.x && clickX <= t.x + t.size && clickY >= t.y && clickY <= t.y + t.size) {
      hitIdx = i;
      break;
    }
  }

  if (hitIdx !== -1) {
    const t = targets[hitIdx];
    const data = stages[currentStageIndex];

    renderLaserBeam(weaponX, t.y + t.size / 2);
    score += data.pts;
    showPop(clickX, clickY, `+${data.pts}`, 'hit-pop');

    t.el.remove();
    targets.splice(hitIdx, 1);
    updateHUD();

    if (targets.length === 0) {
      isPlaying = false;
      cancelAnimationFrame(animId);

      if (currentStageIndex < stages.length - 1) {
        setTimeout(() => {
          currentStageIndex++;
          loadStage(currentStageIndex);
        }, 800);
      } else {
        setTimeout(() => {
          alert(`🏆 INCREDIBLE! You conquered all 5 stages and won the Master Class Challenge! Score: ${score}`);
          modal.classList.remove('hidden');
        }, 500);
      }
    }
  } else {
    renderLaserBeam(weaponX, 0);
    missedShots++;
    updateHUD();
    showPop(clickX, clickY, 'MISS!', 'miss-pop');

    if (missedShots > maxAllowedMiss) {
      isPlaying = false;
      cancelAnimationFrame(animId);
      setTimeout(() => {
        alert('💥 Game Over! You missed more than 3 shots.');
        modal.classList.remove('hidden');
      }, 300);
    }
  }
});

function renderLaserBeam(x, targetY) {
  const height = Math.max(10, arena.clientHeight - 55 - targetY);
  const beam = document.createElement('div');
  beam.className = 'laser-beam';
  beam.style.left = `${x}px`;
  beam.style.top = `${targetY}px`;
  beam.style.height = `${height}px`;

  arena.appendChild(beam);
  setTimeout(() => beam.remove(), 80);
}

function updateHUD() {
  targetsDisplay.textContent = targets.length;
  missedDisplay.textContent = `${missedShots} / ${maxAllowedMiss}`;
  scoreDisplay.textContent = score;
}

function showPop(x, y, text, cls) {
  const p = document.createElement('div');
  p.className = `feedback-pop ${cls}`;
  p.style.left = `${x}px`;
  p.style.top = `${y}px`;
  p.textContent = text;
  arena.appendChild(p);
  setTimeout(() => p.remove(), 500);
}

startGameBtn.addEventListener('click', () => {
  const sel = parseInt(stageSelect.value, 10) || 0;
  startNewGame(sel);
});

instructionsBtn.addEventListener('click', () => {
  isPlaying = false;
  cancelAnimationFrame(animId);
  modal.classList.remove('hidden');
});

restartBtn.addEventListener('click', () => {
  startNewGame(0);
});

init();