/**
 * wordsearch.js — Módulo de Sopa de Letras
 *
 * Exporta: renderWordSearch(config, container)
 *
 * config = { gridSize: number, words: string[] }
 *
 * Toda la lógica está encapsulada dentro de renderWordSearch para
 * garantizar aislamiento total: múltiples instancias no comparten estado.
 */

import { toAsciiUpper } from './core.js';

const DIRECTIONS = [
  [ 0,  1],   // derecha
  [ 1,  0],   // abajo
  [ 1,  1],   // diagonal abajo-derecha
  [-1,  1],   // diagonal arriba-derecha
  [ 0, -1],   // izquierda
  [-1,  0],   // arriba
  [-1, -1],   // diagonal arriba-izquierda
  [ 1, -1],   // diagonal abajo-izquierda
];

// ── Punto de entrada ──────────────────────────────────────────────────────────
export function renderWordSearch(config, container) {
  const GRID_SIZE = config.gridSize ?? 14;
  const WORDS     = config.words   ?? [];

  // ── Estado local (completamente aislado) ─────────────────────────────────
  let board        = [];
  let placedWords  = [];
  let cellElements = [];
  let foundWords   = new Set();
  let isDragging   = false;
  let dragStart    = null;
  let currentPath  = [];
  let selectedPath = [];

  // ── Construir DOM ────────────────────────────────────────────────────────
  container.innerHTML = '';

  // Panel de palabras
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = '<h2>Palabras a encontrar</h2>';
  const wordListEl = document.createElement('ul');
  wordListEl.className = 'word-list';
  panel.appendChild(wordListEl);

  // Tablero
  const boardWrap = document.createElement('div');
  boardWrap.className = 'board-wrap';
  const gridEl = document.createElement('div');
  gridEl.className  = 'grid';
  gridEl.setAttribute('aria-label', 'Sopa de letras');
  boardWrap.appendChild(gridEl);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'ws-footer';
  const messageEl = document.createElement('div');
  messageEl.className = 'ws-message';
  footer.appendChild(messageEl);

  container.appendChild(panel);
  container.appendChild(boardWrap);
  container.appendChild(footer);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const randomLetter = () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];

  const inBounds = (r, c) => r >= 0 && c >= 0 && r < GRID_SIZE && c < GRID_SIZE;

  const sign = n => (n === 0 ? 0 : n > 0 ? 1 : -1);

  function createEmptyBoard() {
    board = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
  }

  function canPlace(letters, row, col, dr, dc) {
    for (let i = 0; i < letters.length; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (!inBounds(r, c)) return false;
      const existing = board[r][c];
      if (existing !== '' && existing !== letters[i]) return false;
    }
    return true;
  }

  function placeWord(word) {
    const letters = toAsciiUpper(word).split('');
    for (let attempt = 0; attempt < 500; attempt++) {
      const [dr, dc] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      if (!canPlace(letters, row, col, dr, dc)) continue;
      const positions = [];
      for (let i = 0; i < letters.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        board[r][c] = letters[i];
        positions.push([r, c]);
      }
      return { word, normalized: toAsciiUpper(word), positions };
    }
    throw new Error(`No se pudo ubicar la palabra: ${word}`);
  }

  function fillRandomCells() {
    for (let r = 0; r < GRID_SIZE; r++)
      for (let c = 0; c < GRID_SIZE; c++)
        if (board[r][c] === '') board[r][c] = randomLetter();
  }

  // ── Render de lista ──────────────────────────────────────────────────────
  function renderWordList() {
    wordListEl.innerHTML = '';
    for (const item of placedWords) {
      const li  = document.createElement('li');
      li.textContent = item.normalized;
      li.id = `ws-word-${item.normalized}`;
      wordListEl.appendChild(li);
    }
  }

  // ── Render del grid ──────────────────────────────────────────────────────
  function buildGrid() {
    gridEl.innerHTML = '';
    cellElements = [];

    // Establecer columnas dinámicamente según gridSize
    gridEl.style.gridTemplateColumns = `repeat(${GRID_SIZE}, var(--word-search-cell-size))`;

    for (let r = 0; r < GRID_SIZE; r++) {
      cellElements[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = document.createElement('div');
        cell.className     = 'cell';
        cell.textContent   = board[r][c];
        cell.dataset.row   = String(r);
        cell.dataset.col   = String(c);
        cell.addEventListener('pointerdown',  onPointerDown);
        cell.addEventListener('pointerenter', onPointerEnter);
        gridEl.appendChild(cell);
        cellElements[r][c] = cell;
      }
    }

    // Los listeners globales se añaden al documento UNA sola vez
    document.addEventListener('pointerup',     onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
  }

  // ── Selección ────────────────────────────────────────────────────────────
  function getCellFromTarget(target) {
    if (!target?.classList?.contains('cell')) return null;
    // Solo procesar celdas del tablero actual
    if (!gridEl.contains(target)) return null;
    const row = Number(target.dataset.row);
    const col = Number(target.dataset.col);
    if (Number.isNaN(row) || Number.isNaN(col)) return null;
    return { row, col };
  }

  function clearActiveSelection() {
    for (const [r, c] of currentPath) {
      const cell = cellElements[r]?.[c];
      if (cell && !cell.classList.contains('found')) cell.classList.remove('active');
    }
    currentPath = [];
  }

  function computePath(start, end) {
    const dr    = end.row - start.row;
    const dc    = end.col - start.col;
    const stepR = sign(dr);
    const stepC = sign(dc);
    if (stepR === 0 && stepC === 0) return [[start.row, start.col]];
    const sameRow  = stepR === 0;
    const sameCol  = stepC === 0;
    const diagonal = Math.abs(dr) === Math.abs(dc);
    if (!(sameRow || sameCol || diagonal)) return null;
    const length = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
    const path   = [];
    for (let i = 0; i < length; i++) {
      const r = start.row + stepR * i;
      const c = start.col + stepC * i;
      if (!inBounds(r, c)) return null;
      path.push([r, c]);
    }
    return path;
  }

  function markPath(path) {
    for (const [r, c] of path) {
      const cell = cellElements[r]?.[c];
      if (cell) cell.classList.add('active');
    }
    currentPath = path;
  }

  function pathToString(path) {
    return path.map(([r, c]) => board[r][c]).join('');
  }

  function finalizeSelection(path) {
    const selected  = pathToString(path);
    const reversed  = selected.split('').reverse().join('');

    for (const item of placedWords) {
      const word = item.normalized;
      if (foundWords.has(word)) continue;
      if (selected === word || reversed === word) {
        foundWords.add(word);
        item.positions.forEach(([r, c]) => {
          const cell = cellElements[r][c];
          if (cell) {
            cell.classList.remove('active');
            cell.classList.add('found');
          }
        });
        const li = document.getElementById(`ws-word-${word}`);
        if (li) li.classList.add('found');
        messageEl.innerHTML = `<i class="fas fa-check-circle" aria-hidden="true"></i> Encontraste: ${word}`;

        // ¿Ganó?
        if (foundWords.size === placedWords.length) {
          document.dispatchEvent(new CustomEvent('gameCompleted', {
            detail: { message: '<i class="fas fa-trophy" aria-hidden="true"></i> ¡Encontraste todas las palabras!' }
          }));
        }
        return;
      }
    }

    clearActiveSelection();
    messageEl.textContent = '';
  }

  function onPointerDown(e) {
    const cell = getCellFromTarget(e.currentTarget);
    if (!cell) return;
    isDragging = true;
    dragStart  = { row: cell.row, col: cell.col };
    selectedPath = [[cell.row, cell.col]];
    clearActiveSelection();
    markPath(selectedPath);
    e.preventDefault();
  }

  function onPointerEnter(e) {
    if (!isDragging || !dragStart) return;
    const cell = getCellFromTarget(e.currentTarget);
    if (!cell) return;
    const path = computePath(dragStart, { row: cell.row, col: cell.col });
    if (!path) return;
    clearActiveSelection();
    selectedPath = path;
    markPath(selectedPath);
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    if (selectedPath.length > 1) {
      finalizeSelection(selectedPath);
    } else {
      clearActiveSelection();
    }
    dragStart    = null;
    selectedPath = [];
  }

  // ── Inicialización ───────────────────────────────────────────────────────
  function initGame() {
    foundWords   = new Set();
    messageEl.textContent = '';
    createEmptyBoard();
    placedWords = [];
    const wordsByLength = [...WORDS].sort((a, b) => b.length - a.length);
    for (const word of wordsByLength) {
      try {
        placedWords.push(placeWord(word));
      } catch (err) {
        console.warn(err.message);
      }
    }
    placedWords.sort((a, b) => WORDS.indexOf(a.word) - WORDS.indexOf(b.word));
    fillRandomCells();
    renderWordList();
    buildGrid();
  }

  initGame();
}
