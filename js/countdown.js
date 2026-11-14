function getTimeValues(eventDate) {
  const difference = new Date(eventDate).getTime() - Date.now();

  if (difference <= 0) {
    return {
      isFinished: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }

  return {
    isFinished: false,
    days: Math.floor(difference / 86400000),
    hours: Math.floor((difference % 86400000) / 3600000),
    minutes: Math.floor((difference % 3600000) / 60000),
    seconds: Math.floor((difference % 60000) / 1000)
  };
}

function renderFeaturedCountdown(element, values) {
  if (values.isFinished) {
    element.textContent = "Finalizado";
    return;
  }

  const units = [
    ["Días", values.days],
    ["Horas", values.hours],
    ["Min", values.minutes],
    ["Seg", values.seconds]
  ];

  element.innerHTML = units.map(([label, value]) => `
    <div class="unit">
      <b>${value}</b>
      <small>${label}</small>
    </div>
  `).join("");
}

function renderCompactCountdown(element, values) {
  if (values.isFinished) {
    element.textContent = "Finalizado";
    return;
  }

  element.textContent =
    `${values.days}d ${values.hours}h ${values.minutes}m ${values.seconds}s`;
}

export function updateCountdowns() {
  const countdowns = document.querySelectorAll("[data-date]");

  countdowns.forEach((element) => {
    const values = getTimeValues(element.dataset.date);

    if (element.classList.contains("countdown")) {
      renderFeaturedCountdown(element, values);
      return;
    }

    renderCompactCountdown(element, values);
  });
}

export function startCountdowns() {
  updateCountdowns();

  return window.setInterval(() => {
    updateCountdowns();
  }, 1000);
}