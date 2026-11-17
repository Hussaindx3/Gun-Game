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

// Card 1: Open and close instructions
rulesBtn.addEventListener('click', () => {
  rulesBox.classList.remove('hidden');
});

closeRulesBtn.addEventListener('click', () => {
  rulesBox.classList.add('hidden');
});

// Card 2: Start round and reset counters
startBtn.addEventListener('click', () => {
  stageEl.textContent = 1;
  scoreEl.textContent = 0;
  missedEl.textContent = 0;

  startScreen.classList.add('hidden');
  rulesBox.classList.add('hidden');
  gameBoard.classList.remove('hidden');
});