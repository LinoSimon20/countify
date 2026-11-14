import { elements } from "./ui.js";

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[character];
  });
}

function translateStatus(status) {
  const translations = {
    pending: "Pendiente",
    approved: "Aprobado",
    rejected: "Rechazado"
  };

  return translations[status] || status;
}

function getImageStyle(imagePath) {
  const validPath =
    /^assets\/images\/[\w./-]+\.(png|jpe?g|webp|gif|svg)$/i;

  if (!imagePath || !validPath.test(imagePath)) {
    return "";
  }

  return `style="background-image: url('${encodeURI(imagePath)}')"`;
}

function createEventCard(event, showStatus = false) {
  return `
    <article class="card">
      <div class="card-image" ${getImageStyle(event.image_path)}></div>

      <div class="card-body">
        ${showStatus
          ? `<span class="status">${translateStatus(event.status)}</span>`
          : ""}

        <h3>${escapeHtml(event.title)}</h3>

        ${event.description
          ? `<p>${escapeHtml(event.description)}</p>`
          : ""}

        <div class="card-count" data-date="${event.event_at}"></div>
      </div>
    </article>
  `;
}

export function renderFeaturedEvent(event) {
  if (!event) {
    elements.featured.style.backgroundImage = "";

    elements.featured.innerHTML = `
      <div>
        <div class="eyebrow featured-label">Próximamente</div>
        <h2>Aún no hay evento destacado</h2>
        <p>El primer evento aprobado aparecerá aquí.</p>
      </div>
    `;

    return;
  }

  const validImagePath =
    /^assets\/images\/[\w./-]+\.(png|jpe?g|webp|gif|svg)$/i;

  elements.featured.style.backgroundImage =
    event.image_path && validImagePath.test(event.image_path)
      ? `linear-gradient(90deg, rgba(7, 9, 25, 0.82), rgba(7, 9, 25, 0.12)), url('${encodeURI(event.image_path)}')`
      : "";

  elements.featured.innerHTML = `
    <div>
      <div class="eyebrow featured-label">Evento destacado</div>
      <h2>${escapeHtml(event.title)}</h2>
      <p>${escapeHtml(event.description || "")}</p>
      <div class="countdown" data-date="${event.event_at}"></div>
    </div>
  `;
}

export function renderPublicEvents(events) {
  if (!events.length) {
    elements.events.innerHTML = `
      <div class="empty">Aún no hay más eventos publicados.</div>
    `;

    return;
  }

  elements.events.innerHTML = events
    .map((event) => createEventCard(event))
    .join("");
}

export function renderUserProposals(events) {
  elements.myEvents.innerHTML = events.length
    ? events.map((event) => createEventCard(event, true)).join("")
    : `<div class="empty">No tienes propuestas pendientes.</div>`;
}

export function renderAdminEvents(events) {
  if (!events.length) {
    elements.adminEvents.innerHTML = "<p>Aún no hay eventos.</p>";
    return;
  }

  elements.adminEvents.innerHTML = events.map((event) => `
    <div class="admin-item">
      <div>
        <strong>${escapeHtml(event.title)}</strong>
        <p>
          ${escapeHtml(event.description || "Sin descripción")}
          · ${translateStatus(event.status)}
        </p>
        <p>Imagen: ${escapeHtml(event.image_path || "sin asignar")}</p>
      </div>

      <div class="admin-buttons">
        <button class="btn btn-primary" data-action="approve" data-id="${event.id}">
          Aprobar
        </button>

        <button class="btn btn-light" data-action="feature" data-id="${event.id}">
          Destacar
        </button>

        <button class="btn btn-light" data-action="image" data-id="${event.id}">
          Imagen
        </button>

        <button class="btn btn-danger" data-action="reject" data-id="${event.id}">
          Rechazar
        </button>

        <button class="btn btn-danger" data-action="delete" data-id="${event.id}">
          Eliminar
        </button>
      </div>
    </div>
  `).join("");
}