(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const startBtn = document.getElementById('startBtn');
  const nameForm = document.getElementById('nameForm');
  const playerNameInput = document.getElementById('playerName');
  const scoresList = document.getElementById('scoresList');
  const clearScoresBtn = document.getElementById('clearScores');

  const CELL = 20;
  const COLS = canvas.width / CELL;
  const ROWS = canvas.height / CELL;

  let snake, dir, food, score, timer, pendingDir, gameOver;

  function reset() {
    snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
    dir = { x: 1, y: 0 };
    pendingDir = dir;
    score = 0;
    gameOver = false;
    placeFood();
    updateScore(0);
    nameForm.style.display = 'none';
  }

  function placeFood() {
    do {
      food = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
    } while (snake.some(seg => seg.x === food.x && seg.y === food.y));
  }

  function updateScore(delta) {
    score += delta;
    scoreEl.textContent = score;
  }

  function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // background grid (optional subtle grid)
    ctx.strokeStyle = '#eee';
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j <= ROWS; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * CELL);
      ctx.lineTo(canvas.width, j * CELL);
      ctx.stroke();
    }
    // food
    drawCell(food.x, food.y, '#e74c3c');
    // snake
    snake.forEach((seg, idx) => drawCell(seg.x, seg.y, idx === 0 ? '#2ecc71' : '#27ae60'));
  }

  function step() {
    if (gameOver) return;
    dir = pendingDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // wall collision
    if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
      return endGame();
    }
    // self collision
    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      return endGame();
    }
    snake.unshift(head);
    // food
    if (head.x === food.x && head.y === food.y) {
      updateScore(10);
      placeFood();
    } else {
      snake.pop();
    }
    render();
  }

  function endGame() {
    gameOver = true;
    clearInterval(timer);
    nameForm.style.display = 'flex';
  }

  function start() {
    reset();
    render();
    clearInterval(timer);
    timer = setInterval(step, 100);
  }

  function changeDir(newDir) {
    // prevent reversing directly
    if (newDir.x === -dir.x && newDir.y === -dir.y) return;
    pendingDir = newDir;
  }

  document.addEventListener('keydown', e => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        changeDir({ x: 0, y: -1 }); break;
      case 'ArrowDown':
      case 's':
      case 'S':
        changeDir({ x: 0, y: 1 }); break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        changeDir({ x: -1, y: 0 }); break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        changeDir({ x: 1, y: 0 }); break;
      case ' ':
        if (gameOver) start();
        break;
    }
  });

  startBtn.addEventListener('click', start);

  // Leaderboard
  const LS_KEY = 'snake_highscores';

  function loadScores() {
    try {
      const data = JSON.parse(localStorage.getItem(LS_KEY)) || [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveScores(scores) {
    localStorage.setItem(LS_KEY, JSON.stringify(scores));
  }

  function renderScores() {
    const scores = loadScores().sort((a, b) => b.score - a.score).slice(0, 10);
    scoresList.innerHTML = '';
    scores.forEach((item, idx) => {
      const li = document.createElement('li');
      li.textContent = `${idx + 1}. ${item.name} — ${item.score}`;
      scoresList.appendChild(li);
    });
  }

  nameForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = (playerNameInput.value || 'Guest').trim().slice(0, 20);
    const scores = loadScores();
    scores.push({ name, score, ts: Date.now() });
    saveScores(scores);
    renderScores();
    nameForm.style.display = 'none';
  });

  clearScoresBtn.addEventListener('click', () => {
    localStorage.removeItem(LS_KEY);
    renderScores();
  });

  // initial
  renderScores();
  reset();
  render();
})();
