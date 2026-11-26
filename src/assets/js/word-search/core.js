/**
 * core.js — Orquestador de Sopas de Letras
 *
 * Flujo:
 *  1. Lee el parámetro ?id= (o ?slug=) de la URL.
 *  2. Hace fetch a games.json.
 *  3. Localiza el juego correspondiente.
 *  4. Actualiza título y subtítulo.
 *  5. Importa dinámicamente el módulo del tipo de juego y lo renderiza.
 *
 * Exporta:
 *  - toAsciiUpper(text): normaliza tildes y convierte a mayúsculas.
 */

// ── Helper compartido ─────────────────────────────────────────────────────────
/**
 * Convierte texto a mayúsculas eliminando tildes y caracteres especiales.
 * Á→A, É→E, Í→I, Ó→O, Ú→U, Ü→U, Ñ→N
 * @param {string} text
 * @returns {string}
 */
export function toAsciiUpper(text) {
  return text
    .toUpperCase()
    .replace(/Á/g, 'A')
    .replace(/É/g, 'E')
    .replace(/Í/g, 'I')
    .replace(/Ó/g, 'O')
    .replace(/Ú/g, 'U')
    .replace(/Ü/g, 'U')
    .replace(/Ñ/g, 'N');
}

// ── Orquestador principal ─────────────────────────────────────────────────────
async function bootstrap() {
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id');
  const slug = params.get('slug');

  const titleEl = document.getElementById('game-title');
  const subtitleEl = document.getElementById('game-subtitle');
  const container = document.getElementById('game-container');

  // Función auxiliar para mostrar errores
  const showError = (msg) => {
    titleEl.textContent = 'Error';
    subtitleEl.textContent = '';
    container.innerHTML = `<p class="load-error">${msg}</p>`;
  };

  // ── 1. Cargar games.json ──────────────────────────────────────────────────
  let games;
  try {
    const res = await fetch('games.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    games = await res.json();
  } catch (err) {
    showError(`No se pudo cargar games.json: ${err.message}`);
    return;
  }

  // ── 2. Buscar el juego ────────────────────────────────────────────────────
  let game;

  if (idParam !== null) {
    const id = Number(idParam);
    game = games.find(g => g.id === id);
  } else if (slug) {
    game = games.find(g => g.slug === slug);
  } else {
    // Sin parámetro → mostrar menú de selección
    renderMenu(games, titleEl, subtitleEl, container);
    return;
  }

  if (!game) {
    showError(`No existe un juego con ese identificador.`);
    return;
  }

  // ── 3. Actualizar encabezado ──────────────────────────────────────────────
  document.title = game.title;
  titleEl.textContent = game.title;
  subtitleEl.textContent = game.subtitle ?? '';

  // ── 4. Cargar módulo y renderizar ─────────────────────────────────────────
  try {
    switch (game.type) {
      case 'wordsearch': {
        const { renderWordSearch } = await import('./wordsearch.js');
        renderWordSearch(game.config, container);
        break;
      }
      default:
        showError(`Tipo de juego desconocido: "${game.type}"`);
    }
  } catch (err) {
    showError(`Error al cargar el módulo del juego: ${err.message}`);
    console.error(err);
  }
}

// ── Menú de selección (sin parámetros en la URL) ──────────────────────────────
function renderMenu(games, titleEl, subtitleEl, container) {
  titleEl.textContent = 'Sopas de Letras';
  subtitleEl.textContent = 'Selecciona una sopa de letras para comenzar.';
  document.title = 'Sopas de Letras';

  const ul = document.createElement('ul');
  ul.className = 'game-menu';

  games.forEach(g => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `?id=${g.id}`;
    link.className = 'game-menu__link';

    const typeLabel = document.createElement('span');
    typeLabel.className = 'game-menu__type';
    typeLabel.innerHTML = '<i class="fas fa-th" aria-hidden="true"></i> Sopa de Letras';

    const title = document.createElement('span');
    title.className = 'game-menu__title';
    title.textContent = g.title;

    link.append(typeLabel, title);
    li.appendChild(link);
    ul.appendChild(li);
  });

  container.appendChild(ul);
}

// ── Arranque ──────────────────────────────────────────────────────────────────

// ── Pantalla completa con íconos ──────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  const fullscreenTarget = document.getElementById('game-wrapper');
  const fsBtn = document.getElementById('fullscreen-btn');
  const icon = fsBtn ? fsBtn.querySelector('i') : null;

  if (fullscreenTarget && fsBtn && icon) {
    function updateIcon() {
      const isFullscreen = Boolean(document.fullscreenElement);
      icon.className = isFullscreen ? 'fas fa-compress' : 'fas fa-expand';
      fsBtn.setAttribute('aria-label', isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa');
    }

    fsBtn.addEventListener('click', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen().then(updateIcon).catch(err => console.warn(err));
      } else {
        fullscreenTarget.requestFullscreen().then(updateIcon).catch(err => console.warn(err));
      }
    });

    document.addEventListener('fullscreenchange', updateIcon);
    document.addEventListener('webkitfullscreenchange', updateIcon);
    document.addEventListener('mozfullscreenchange', updateIcon);
    document.addEventListener('MSFullscreenChange', updateIcon);

    updateIcon();
  }

  // ── Modal de finalización ────────────────────────────────────
  const modalOverlay = document.getElementById('completion-modal');
  const modalMessage = document.getElementById('modal-message');
  const restartBtn = document.getElementById('modal-restart-btn');

  // Mostrar modal con mensaje personalizado
  window.showCompletionModal = function (message) {
    if (!modalOverlay || !modalMessage) return;
    modalMessage.innerHTML = message || '¡Has completado el juego!';
    modalOverlay.classList.add('is-visible');
    modalOverlay.setAttribute('aria-hidden', 'false');
  };

  // Ocultar modal (usado si se quiere cerrar, pero no es necesario)
  window.hideCompletionModal = function () {
    if (modalOverlay) {
      modalOverlay.classList.remove('is-visible');
      modalOverlay.setAttribute('aria-hidden', 'true');
    }
  };

  // Reiniciar: recargar la página con el mismo id
  if (restartBtn) {
    restartBtn.addEventListener('click', function () {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || '18';
      window.location.href = window.location.pathname + '?id=' + id;
    });
  }

  // Escuchar evento de juego completado
  document.addEventListener('gameCompleted', function (e) {
    const msg = e.detail?.message || '¡Felicidades! Has completado el juego.';
    window.showCompletionModal(msg);
  });
});

bootstrap();
