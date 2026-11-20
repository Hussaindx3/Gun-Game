// DOM Elements
const startScreen = document.getElementById('start-screen');
const rulesBox = document.getElementById('rules-box');
const gameBoard = document.getElementById('game-board');

const startBtn = document.getElementById('start-btn');
const rulesBtn = document.getElementById('rules-btn');
const closeRulesBtn = document.getElementById('close-rules-btn');

const stageEl = document.getElementById('stage');
const scoreEl = document.getElementById('score');
const missedEl = document.getElementById('missed');
const arena = document.getElementById('arena');
const targetsContainer = document.getElementById('targets-container');

// Game State
let score = 0;
let missedShots = 0;
let activeTargets = [];
const MAX_MISSES = 3;

// Open/Close Instructions
rulesBtn.addEventListener('click', () => {
  rulesBox.classList.remove('hidden');
});

closeRulesBtn.addEventListener('click', () => {
  rulesBox.classList.add('hidden');
});

// Start Game and Initialize Stage 1
startBtn.addEventListener('click', () => {
  score = 0;
  missedShots = 0;
  scoreEl.textContent = score;
  missedEl.textContent = missedShots;

  startScreen.classList.add('hidden');
  rulesBox.classList.add('hidden');
  gameBoard.classList.remove('hidden');

  spawnStage1Targets();
});

// Spawn Stage 1 Targets
function spawnStage1Targets() {
  targetsContainer.innerHTML = '';
  activeTargets = [
    { id: 1, x: 120, y: 50, width: 45, height: 45 },
    { id: 2, x: 275, y: 50, width: 45, height: 45 },
    { id: 3, x: 430, y: 50, width: 45, height: 45 }
  ];

  activeTargets.forEach(t => {
    const el = document.createElement('div');
    el.classList.add('target');
    el.style.left = `${t.x}px`;
    el.style.top = `${t.y}px`;
    el.dataset.id = t.id;
    targetsContainer.appendChild(el);
  });
}

// Shooting & Click Logic
arena.addEventListener('click', (e) => {
  if (gameBoard.classList.contains('hidden')) return;

  const rect = arena.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  let hit = false;

  activeTargets = activeTargets.filter(t => {
    const isInside = clickX >= t.x && clickX <= t.x + t.width &&
                     clickY >= t.y && clickY <= t.y + t.height;
    if (isInside) {
      hit = true;
      score += 10;
      scoreEl.textContent = score;
      showFeedback(clickX, clickY, '+10', 'hit-text');
      
      const targetEl = targetsContainer.querySelector(`[data-id='${t.id}']`);
      if (targetEl) targetEl.remove();
      
      return false;
    }
    return true;
  });

  if (!hit) {
    missedShots++;
    missedEl.textContent = missedShots;
    showFeedback(clickX, clickY, 'MISS!', 'miss-text');

    if (missedShots > MAX_MISSES) {
      alert('Game Over! You missed 3 shots.');
      startScreen.classList.remove('hidden');
      gameBoard.classList.add('hidden');
    }
  }

  // Clear stage win condition
  if (activeTargets.length === 0) {
    setTimeout(() => {
      alert('Stage 1 Cleared! Great job.');
      spawnStage1Targets(); // Re-spawn for testing loop
    }, 300);
  }
});

// Feedback Popup
function showFeedback(x, y, text, className) {
  const pop = document.createElement('div');
  pop.className = `feedback-pop ${className}`;
  pop.style.left = `${x}px`;
  pop.style.top = `${y}px`;
  pop.textContent = text;
  arena.appendChild(pop);
  setTimeout(() => pop.remove(), 500);
}