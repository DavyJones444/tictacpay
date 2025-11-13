// Light/Dark Mode Umschalter
  document.getElementById('mode-switch').addEventListener('click', function() {
    document.body.classList.toggle('dark');
    this.innerHTML = document.body.classList.contains('dark')
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  });

  // DOM-Elemente
  const cells = document.querySelectorAll('.board .cell');
  const boardContainer = document.querySelector('.board-container');
  const winModal = document.getElementById('winModal');
  const winText = document.getElementById('winText');
  const resetButton = document.getElementById('resetButton');
  const shopItemsContainer = document.getElementById('shopItemsContainer');

  // Spielzustände
  let board = Array(9).fill('');
  let current = 'X';
  let gameActive = true;
  let currentSprite = 'sprites0.png'; // Standard Sprite
  let spriteSets = [];
  let coins = 100; // Nur für Demo Zwecke!!!!

  // Gewinnkombinationen
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8], // Zeilen
    [0,3,6],[1,4,7],[2,5,8], // Spalten
    [0,4,8],[2,4,6]          // Diagonalen
  ];

  // Alle Symbole auf aktuellem Sprite aktualisieren
  function updateSpriteSheet(spriteFile) {
    currentSprite = spriteFile;
    document.querySelectorAll('.symbol').forEach(symbol => {
      symbol.style.backgroundImage = `url('./icons/${currentSprite}')`;
    });
  }

  // Coins-Anzeige aktualisieren
  function updateCoinDisplay() {
    const coinCount = document.getElementById('coin-count');
    if (coinCount) {
      coinCount.textContent = coins;
      document.getElementById('coin-display').setAttribute('title', `Coins: ${coins}`);
    }
  }

  // Spielfeld rendern
  function renderBoard() {
    board.forEach((mark, idx) => {
      const cell = cells[idx];
      cell.innerHTML = '';
      if (mark === 'X' || mark === 'O') {
        const icon = document.createElement('span');
        icon.className = `symbol symbol-${mark.toLowerCase()}`;
        icon.style.backgroundImage = `url('./icons/${currentSprite}')`;
        cell.appendChild(icon);
      }
    });
  }

  // Gewinner prüfen
  function checkWin() {
    for (const combo of winCombos) {
      const [a,b,c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  // Unentschieden prüfen
  function checkTie() {
    return board.every(cell => cell) && !checkWin();
  }

  // Feld Klick-Handler
  function handleCellClick(e) {
    const idx = Array.from(cells).indexOf(e.target);
    if (!gameActive || board[idx]) return;
    board[idx] = current;
    renderBoard();
    const winner = checkWin();
    if (winner) {
      showWin(`${winner} hat gewonnen!`);
    } else if (checkTie()) {
      showWin('Unentschieden!');
    } else {
      current = current === 'X' ? 'O' : 'X';
    }
  }

  // Sieg Dialog einblenden
  function showWin(text) {
    gameActive = false;
    winText.textContent = text;
    winModal.classList.add('show');
    boardContainer.classList.add('dimmed');
  }

  // Spiel zurücksetzen
  function resetGame() {
    board = Array(9).fill('');
    current = 'X';
    gameActive = true;
    renderBoard();
    winModal.classList.remove('show');
    boardContainer.classList.remove('dimmed');
  }

  // Dynamisch Shop Buttons aus JSON laden
  async function loadSpriteSets() {
    try {
      const response = await fetch('./data/spritesets.json');
      spriteSets = await response.json();
      shopItemsContainer.innerHTML = '';

      spriteSets.forEach((set, idx) => {
        const btn = document.createElement('button');
        btn.className = 'sprite-select';
        btn.textContent = `${set.name} (${set.price} Coins)`;
        btn.setAttribute('data-sprite', set.file);

        if (idx === 0) btn.classList.add('active');

        btn.addEventListener('click', () => {
        if (coins >= set.price) {
          // Coins abziehen nur wenn genug Coins
          coins -= set.price;
          updateCoinDisplay();

          // Buttons aktiv setzen
          document.querySelectorAll('.sprite-select').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          updateSpriteSheet(set.file);
          renderBoard();
        } else {
          alert('Nicht genug Coins für dieses Set!'); // Einfaches Feedback
        }
      });

        shopItemsContainer.appendChild(btn);
      });

      if (spriteSets.length > 0) {
        updateSpriteSheet(spriteSets[0].file);
        renderBoard();
        updateCoinDisplay();
      }
    } catch (e) {
      console.error('Fehler beim Laden der Sprite-Sets:', e);
    }
  }

  // Listener registrieren
  cells.forEach(cell => cell.addEventListener('click', handleCellClick));
  resetButton.addEventListener('click', resetGame);

  // Initialisierung
  updateCoinDisplay();
  loadSpriteSets();
  renderBoard();