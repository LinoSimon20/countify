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
          ? `<span class="status">${escapeHtml(event.status)}</span>`
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
        <div class="eyebrow featured-label">Coming soon</div>
        <h2>No featured event yet</h2>
        <p>The first approved event will appear here.</p>
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
      <div class="eyebrow featured-label">Featured event</div>
      <h2>${escapeHtml(event.title)}</h2>
      <p>${escapeHtml(event.description || "")}</p>
      <div class="countdown" data-date="${event.event_at}"></div>
    </div>
  `;
}

export function renderPublicEvents(events) {
  if (!events.length) {
    elements.events.innerHTML = `
      <div class="empty">There are no more published events yet.</div>
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
    : `<div class="empty">You do not have pending proposals.</div>`;
}

export function renderAdminEvents(events) {
  if (!events.length) {
    elements.adminEvents.innerHTML = "<p>No events yet.</p>";
    return;
  }

  elements.adminEvents.innerHTML = events.map((event) => `
    <div class="admin-item">
      <div>
        <strong>${escapeHtml(event.title)}</strong>
        <p>
          ${escapeHtml(event.description || "No description")}
          · ${escapeHtml(event.status)}
        </p>
        <p>Image: ${escapeHtml(event.image_path || "not assigned")}</p>
      </div>

      <div class="admin-buttons">
        <button class="btn btn-primary" data-action="approve" data-id="${event.id}">
          Approve
        </button>

        <button class="btn btn-light" data-action="feature" data-id="${event.id}">
          Feature
        </button>

        <button class="btn btn-light" data-action="image" data-id="${event.id}">
          Image
        </button>

        <button class="btn btn-danger" data-action="reject" data-id="${event.id}">
          Reject
        </button>

        <button class="btn btn-danger" data-action="delete" data-id="${event.id}">
          Delete
        </button>
      </div>
    </div>
  `).join("");
}