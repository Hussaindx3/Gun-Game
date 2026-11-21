/*----- Game Stages Data (2 Progressive Stages) -----*/
const STAGES_DATA = [
  { stage: 1, name: 'Desert Outpost', theme: 'theme-1', difficulty: 'Easy', targetCount: 4, shape: 'shape-circle', speed: 2.2, verticalSpeed: 0, size: 64, pointsPerHit: 10 },
  { stage: 2, name: 'Forest Range', theme: 'theme-2', difficulty: 'Medium', targetCount: 5, shape: 'shape-square', speed: 2.7, verticalSpeed: 0, size: 60, pointsPerHit: 15 }
];

const MAX_ALLOWED_MISSES = 3;

let currentStageIndex = 0;
let score = 0;
let missedShots = 0;
let activeTargets = [];
let isPlaying = false;
let animationFrameId = null;
let weaponX = 480;

/*----- Background Music State Variables -----*/
let isMusicPlaying = false;
let musicInterval = null;

const arenaEl = document.getElementById('game-arena');
const targetsLayerEl = document.getElementById('targets-layer');
const weaponEl = document.getElementById('weapon');
const stageThemeNameEl = document.getElementById('stage-theme-name');

const stageDisplayEl = document.getElementById('stage-display');
const difficultyDisplayEl = document.getElementById('difficulty-display');
const targetsDisplayEl = document.getElementById('targets-display');
const missedDisplayEl = document.getElementById('missed-display');
const scoreDisplayEl = document.getElementById('score-display');

const centerBannerEl = document.getElementById('center-banner');
const bannerTitleEl = document.getElementById('banner-title');
const bannerSubtextEl = document.getElementById('banner-subtext');
const bannerActionBtn = document.getElementById('banner-action-btn');

const modalEl = document.getElementById('game-modal');
const stageSelectEl = document.getElementById('stage-select');
const startGameBtn = document.getElementById('start-game-btn');
const instructionsBtn = document.getElementById('instructions-btn');
const restartBtn = document.getElementById('restart-btn');
const musicToggleBtn = document.getElementById('music-toggle-btn');

function init() {
  populateStageDropdown();
  updateHUD();
}

function populateStageDropdown() {
  stageSelectEl.innerHTML = '';
  STAGES_DATA.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `Stage ${item.stage}: ${item.name} (${item.difficulty})`;
    stageSelectEl.appendChild(option);
  });
}

function startNewGame(startIndex = 0) {
  currentStageIndex = startIndex;
  score = 0;
  missedShots = 0;
  loadStage(currentStageIndex);
}

function loadStage(index) {
  cancelAnimationFrame(animationFrameId);
  targetsLayerEl.innerHTML = '';
  activeTargets = [];
  centerBannerEl.classList.add('hidden');
  modalEl.classList.add('hidden');

  const stageConfig = STAGES_DATA[index];
  const arenaWidth = arenaEl.clientWidth;

  arenaEl.className = `game-arena ${stageConfig.theme}`;
  stageThemeNameEl.textContent = `Stage ${stageConfig.stage}: ${stageConfig.name}`;

  for (let i = 0; i < stageConfig.targetCount; i++) {
    const rowY = 35 + (i % 4) * 72;
    const startX = Math.random() * (arenaWidth - stageConfig.size);
    const dirX = i % 2 === 0 ? 1 : -1;
    const dirY = i % 3 === 0 ? 1 : -1;

    const targetEl = document.createElement('div');
    targetEl.classList.add('target-board', stageConfig.shape);
    targetEl.style.width = `${stageConfig.size}px`;
    targetEl.style.height = `${stageConfig.size}px`;
    targetEl.style.top = `${rowY}px`;
    targetEl.style.left = `${startX}px`;

    targetsLayerEl.appendChild(targetEl);

    activeTargets.push({
      element: targetEl,
      x: startX,
      y: rowY,
      size: stageConfig.size,
      vx: stageConfig.speed * dirX,
      vy: stageConfig.verticalSpeed * dirY
    });
  }

  isPlaying = true;
  updateHUD();
  gameLoop();
}

function gameLoop() {
  if (!isPlaying) return;

  const arenaWidth = arenaEl.clientWidth;
  const maxAllowedY = 310;

  activeTargets.forEach((target) => {
    target.x += target.vx;
    target.y += target.vy;

    if (target.x <= 0) {
      target.x = 0;
      target.vx *= -1;
    } else if (target.x + target.size >= arenaWidth) {
      target.x = arenaWidth - target.size;
      target.vx *= -1;
    }

    if (target.y <= 25) {
      target.y = 25;
      target.vy *= -1;
    } else if (target.y + target.size >= maxAllowedY) {
      target.y = maxAllowedY - target.size;
      target.vy *= -1;
    }

    target.element.style.left = `${target.x}px`;
    target.element.style.top = `${target.y}px`;
  });

  animationFrameId = requestAnimationFrame(gameLoop);
}

function handleAim(e) {
  if (!isPlaying) return;
  const rect = arenaEl.getBoundingClientRect();
  let relativeX = e.clientX - rect.left;

  relativeX = Math.max(25, Math.min(rect.width - 25, relativeX));
  weaponX = relativeX;
  weaponEl.style.left = `${weaponX}px`;
}

function handleShoot(e) {
  if (!isPlaying) return;
  if (e.target.closest('.modal-overlay') || e.target.closest('.center-banner') || e.target.closest('.header-controls')) return;

  weaponEl.classList.add('recoil');
  setTimeout(() => weaponEl.classList.remove('recoil'), 80);

  const stageConfig = STAGES_DATA[currentStageIndex];
  let hitIndex = -1;
  let hitY = 0;

  for (let i = 0; i < activeTargets.length; i++) {
    const t = activeTargets[i];
    const withinHorizontalBounds = weaponX >= t.x && weaponX <= t.x + t.size;

    if (withinHorizontalBounds && t.y > hitY) {
      hitY = t.y;
      hitIndex = i;
    }
  }

  if (hitIndex !== -1) {
    const hitTarget = activeTargets[hitIndex];
    
    /* Play Hit Sound Effect */
    playShootSound(true);

    renderBulletTracer(weaponX, hitTarget.y + hitTarget.size / 2);
    showFeedback(weaponX, hitTarget.y, `+${stageConfig.pointsPerHit}`, 'hit-pop');

    hitTarget.element.remove();
    activeTargets.splice(hitIndex, 1);
    score += stageConfig.pointsPerHit;

    updateHUD();
    checkStageProgress();
  } else {
    /* Play Miss Sound Effect */
    playShootSound(false);

    renderBulletTracer(weaponX, 0);
    showFeedback(weaponX, arenaEl.clientHeight - 115, 'MISS!', 'miss-pop');

    missedShots++;
    updateHUD();

    if (missedShots > MAX_ALLOWED_MISSES) {
      triggerLossInCenter();
    }
  }
}

function checkStageProgress() {
  if (activeTargets.length === 0) {
    isPlaying = false;
    cancelAnimationFrame(animationFrameId);

    if (currentStageIndex < STAGES_DATA.length - 1) {
      currentStageIndex++;
      showCenterBanner(
        'STAGE CLEARED!',
        `Next: Stage ${currentStageIndex + 1} - ${STAGES_DATA[currentStageIndex].name}`,
        'Next Stage',
        true,
        () => loadStage(currentStageIndex)
      );
    } else {
      showCenterBanner(
        'YOU WIN!',
        `You conquered both stages! Final Score: ${score}`,
        'Play Again',
        true,
        () => startNewGame(0)
      );
    }
  }
}

function triggerLossInCenter() {
  isPlaying = false;
  cancelAnimationFrame(animationFrameId);

  showCenterBanner(
    'YOU LOSE!',
    `You missed ${missedShots} shots (Max allowed: 3). Score: ${score}`,
    'Try Again',
    false,
    () => startNewGame(currentStageIndex)
  );
}

function showCenterBanner(title, subtext, btnText, isWin, actionCallback) {
  bannerTitleEl.textContent = title;
  bannerSubtextEl.textContent = subtext;
  bannerActionBtn.textContent = btnText;

  if (isWin) {
    centerBannerEl.classList.add('win-banner');
  } else {
    centerBannerEl.classList.remove('win-banner');
  }

  centerBannerEl.classList.remove('hidden');

  bannerActionBtn.replaceWith(bannerActionBtn.cloneNode(true));
  const freshBtn = document.getElementById('banner-action-btn');
  freshBtn.addEventListener('click', actionCallback);
}

function renderBulletTracer(x, targetTopY) {
  const arenaHeight = arenaEl.clientHeight;
  const startY = arenaHeight - 45;
  const height = Math.max(10, startY - targetTopY);

  const tracer = document.createElement('div');
  tracer.classList.add('bullet-tracer');
  tracer.style.left = `${x}px`;
  tracer.style.top = `${targetTopY}px`;
  tracer.style.height = `${height}px`;

  arenaEl.appendChild(tracer);
  setTimeout(() => tracer.remove(), 120);
}

function showFeedback(x, y, text, className) {
  const pop = document.createElement('div');
  pop.classList.add('feedback-pop', className);
  pop.style.left = `${x}px`;
  pop.style.top = `${y}px`;
  pop.textContent = text;

  arenaEl.appendChild(pop);
  setTimeout(() => pop.remove(), 600);
}

function updateHUD() {
  const stageConfig = STAGES_DATA[currentStageIndex];
  stageDisplayEl.textContent = `${stageConfig.stage} / ${STAGES_DATA.length}`;
  difficultyDisplayEl.textContent = stageConfig.difficulty;
  targetsDisplayEl.textContent = activeTargets.length;
  missedDisplayEl.textContent = `${missedShots} / ${MAX_ALLOWED_MISSES}`;
  scoreDisplayEl.textContent = score;
}

/*----- Web Audio API Sound Generator for Gun Shots -----*/
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playShootSound(isHit) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = isHit ? 'triangle' : 'sawtooth';
  
  const startFreq = isHit ? 520 : 180;
  const endFreq = isHit ? 110 : 40;

  oscillator.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + 0.15);

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.15);
}

/*----- Relaxing & Upbeat Melodic Background Music Generator -----*/
const melodyNotes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // C4, E4, G4, C5, G4, E4
let melodyIndex = 0;

function playComfortableBeat() {
  if (!isMusicPlaying) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  // Using 'triangle' wave for a smooth, relaxing, and comfortable sound tone
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(melodyNotes[melodyIndex % melodyNotes.length], audioCtx.currentTime);
  melodyIndex++;

  // Low volume to keep it ambient and relaxing in the background
  gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
}

function toggleBackgroundMusic() {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  isMusicPlaying = !isMusicPlaying;

  if (isMusicPlaying) {
    musicToggleBtn.textContent = '🎵 Music: ON';
    musicToggleBtn.style.background = '#22c55e';
    musicToggleBtn.style.color = '#0f172a';
    musicInterval = setInterval(playComfortableBeat, 350);
  } else {
    musicToggleBtn.textContent = '🎵 Music: OFF';
    musicToggleBtn.style.background = '#334155';
    musicToggleBtn.style.color = '#f1f5f9';
    clearInterval(musicInterval);
  }
}

musicToggleBtn.addEventListener('click', toggleBackgroundMusic);

arenaEl.addEventListener('mousemove', handleAim);
arenaEl.addEventListener('mousedown', handleShoot);

startGameBtn.addEventListener('click', () => {
  const selectedStage = parseInt(stageSelectEl.value, 10) || 0;
  startNewGame(selectedStage);
});

instructionsBtn.addEventListener('click', () => {
  isPlaying = false;
  cancelAnimationFrame(animationFrameId);
  centerBannerEl.classList.add('hidden');
  modalEl.classList.remove('hidden');
});

restartBtn.addEventListener('click', () => {
  startNewGame(0);
});

init();