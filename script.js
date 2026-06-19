const board = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

let currentPlayer = 'X';
let gameOver = false;
let moves = 0;

function updateStatus(message) {
  statusEl.textContent = message;
}

function checkWinner() {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    const valueA = cells[a].textContent;
    if (valueA && valueA === cells[b].textContent && valueA === cells[c].textContent) {
      return valueA;
    }
  }
  return null;
}

function handleCellClick(event) {
  const cell = event.target;
  if (gameOver || cell.textContent) return;

  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
  cell.disabled = true;
  moves++;

  const winner = checkWinner();
  if (winner) {
    gameOver = true;
    updateStatus(`Player ${winner} wins!`);
    disableAllCells();
    return;
  }

  if (moves === 9) {
    gameOver = true;
    updateStatus("It's a draw!");
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus(`Player ${currentPlayer}'s turn`);
}

function disableAllCells() {
  cells.forEach(cell => cell.disabled = true);
}

function resetGame() {
  currentPlayer = 'X';
  gameOver = false;
  moves = 0;

  cells.forEach(cell => {
    cell.textContent = '';
    cell.disabled = false;
    cell.classList.remove('x', 'o');
  });

  updateStatus("Player X's turn");
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);
