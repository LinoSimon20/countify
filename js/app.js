import {
  getCurrentSession,
  isCurrentUserAdmin,
  sendPasswordRecoveryEmail,
  signIn,
  signOut,
  signUp,
  updatePassword,
  watchAuthState
} from "./auth.js";

import {
  approveEvent,
  deleteEvent,
  rejectEvent,
  setEventImage,
  setFeaturedEvent
} from "./admin.js";

import {
  startCountdowns,
  updateCountdowns
} from "./countdown.js";

import {
  createEvent,
  fetchEvents,
  subscribeToEventChanges,
  unsubscribeFromEventChanges
} from "./events.js";

import {
  renderAdminEvents,
  renderFeaturedEvent,
  renderPublicEvents,
  renderUserProposals
} from "./event-view.js";

import {
  isUsernameAvailable,
  isValidUsername,
  normalizeUsername
} from "./profiles.js";

import {
  closeAuthDialog,
  closeEventDialog,
  closePasswordDialog,
  elements,
  openAuthDialog,
  openEventDialog,
  openPasswordDialog,
  setAuthMode,
  setUserInterface,
  showToast,
  toggleAdminPanel
} from "./ui.js";

const state = {
  eventChannel: null,
  events: [],
  isAdmin: false,
  isSignUp: false,
  session: null,
  usernameCheckTimer: null
};

function getErrorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
}

function isPasswordSetupUrl() {
  const hashParameters = new URLSearchParams(
    window.location.hash.slice(1)
  );

  const queryParameters = new URLSearchParams(
    window.location.search
  );

  const type =
    hashParameters.get("type") ||
    queryParameters.get("type");

  return type === "invite" || type === "recovery";
}

function showPasswordDialog() {
  if (!elements.passwordDialog.open) {
    openPasswordDialog();
  }
}

function setUsernameStatus(message) {
  elements.usernameStatus.textContent = message;
}

async function validateUsernameAvailability() {
  const username = normalizeUsername(elements.username.value);

  elements.username.value = username;

  if (!username) {
    setUsernameStatus("");
    return false;
  }

  if (!isValidUsername(username)) {
    setUsernameStatus(
      "Usa de 3 a 30 caracteres: minúsculas, números o guion bajo."
    );

    return false;
  }

  setUsernameStatus("Comprobando disponibilidad...");

  try {
    const available = await isUsernameAvailable(username);

    if (normalizeUsername(elements.username.value) !== username) {
      return false;
    }

    setUsernameStatus(
      available
        ? "Usuario disponible."
        : "Ese usuario ya está en uso."
    );

    return available;
  } catch (error) {
    setUsernameStatus("No se pudo comprobar el usuario.");
    return false;
  }
}

async function updateSessionState(session) {
  state.session = session;
  state.isAdmin = session
    ? await isCurrentUserAdmin()
    : false;

  setUserInterface(session);
  toggleAdminPanel(state.isAdmin);
}

function renderApplication() {
  const approvedEvents = state.events.filter(
    (event) => event.status === "approved"
  );

  const featuredEvent =
    approvedEvents.find((event) => event.is_featured) ||
    approvedEvents[0];

  const secondaryEvents = approvedEvents.filter(
    (event) => event.id !== featuredEvent?.id
  );

  renderFeaturedEvent(featuredEvent);
  renderPublicEvents(secondaryEvents);

  elements.mySection.hidden = !state.session;

  if (state.session) {
    const userProposals = state.events.filter(
      (event) =>
        event.created_by === state.session.user.id &&
        event.status !== "approved"
    );

    renderUserProposals(userProposals);
  }

  if (state.isAdmin) {
    renderAdminEvents(state.events);
  }

  updateCountdowns();
}

async function refreshEvents() {
  try {
    state.events = await fetchEvents();
    renderApplication();
  } catch (error) {
    showToast(`Unable to load events: ${getErrorMessage(error)}`);
  }
}

async function refreshApplication(session) {
  try {
    await updateSessionState(session);
    await refreshEvents();
  } catch (error) {
    showToast(`Unable to update session: ${getErrorMessage(error)}`);
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const credentials = {
    email: elements.email.value.trim(),
    password: elements.password.value
  };

  try {
    if (state.isSignUp) {
      const firstName = elements.firstName.value.trim();
      const lastName = elements.lastName.value.trim();
      const username = normalizeUsername(elements.username.value);
      const confirmation = elements.confirmSignUpPassword.value;

      if (!firstName || !lastName || !username) {
        showToast("Completa todos los datos de tu perfil.");
        return;
      }

      if (credentials.password !== confirmation) {
        showToast("Las contraseñas no coinciden.");
        return;
      }

      const isAvailable = await validateUsernameAvailability();

      if (!isAvailable) {
        showToast("Elige otro nombre de usuario.");
        return;
      }

      await signUp({
        ...credentials,
        firstName,
        lastName,
        username,
        redirectTo: window.location.origin + window.location.pathname
      });

      showToast("Revisa tu correo para confirmar tu cuenta.");
    } else {
      await signIn(credentials);
      showToast("Bienvenido a Countify.");
    }

    elements.authForm.reset();
    setUsernameStatus("");
    closeAuthDialog();
  } catch (error) {
    showToast(getErrorMessage(error));
  }
}

async function handlePasswordRecovery(event) {
  event.preventDefault();

  const email = elements.email.value.trim();

  if (!email) {
    showToast("Enter your email address first.");
    return;
  }

  try {
    await sendPasswordRecoveryEmail({
      email,
      redirectTo: window.location.origin + window.location.pathname
    });

    closeAuthDialog();

    showToast("Check your email for the password reset link.");
  } catch (error) {
    showToast(getErrorMessage(error));
  }
}

async function handlePasswordSubmit(event) {
  event.preventDefault();

  const password = elements.newPassword.value;
  const confirmation = elements.confirmPassword.value;

  if (password !== confirmation) {
    showToast("Passwords do not match.");
    return;
  }

  try {
    await updatePassword(password);

    elements.passwordForm.reset();
    closePasswordDialog();

    showToast("Your password was saved.");
  } catch (error) {
    showToast(getErrorMessage(error));
  }
}

async function handleEventSubmit(event) {
  event.preventDefault();

  if (!state.session) {
    showToast("Sign in before proposing an event.");
    openAuthDialog();
    return;
  }

  try {
    await createEvent({
      title: elements.eventTitle.value,
      description: elements.eventDescription.value,
      eventAt: elements.eventDate.value,
      userId: state.session.user.id
    });

    elements.eventForm.reset();
    closeEventDialog();
    showToast("Your event proposal was sent for review.");

    await refreshEvents();
  } catch (error) {
    showToast(getErrorMessage(error));
  }
}

async function handleAdminAction(event) {
  const button = event.target.closest("[data-action]");

  if (!button || !state.isAdmin) {
    return;
  }

  const { action, id } = button.dataset;

  try {
    if (action === "approve") {
      await approveEvent(id);
      showToast("Event approved.");
    }

    if (action === "reject") {
      await rejectEvent(id);
      showToast("Event rejected.");
    }

    if (action === "feature") {
      await setFeaturedEvent(id);
      showToast("Featured event updated.");
    }

    if (action === "image") {
      const imagePath = window.prompt(
        "Internal image path, for example: assets/images/event.webp"
      );

      if (!imagePath) {
        return;
      }

      await setEventImage(id, imagePath.trim());
      showToast("Event image updated.");
    }

    if (action === "delete") {
      const confirmed = window.confirm(
        "Do you want to permanently delete this event?"
      );

      if (!confirmed) {
        return;
      }

      await deleteEvent(id);
      showToast("Event deleted.");
    }

    await refreshEvents();
  } catch (error) {
    showToast(getErrorMessage(error));
  }
}

function bindInterfaceEvents() {
  elements.authButton.addEventListener("click", async () => {
    if (state.session) {
      try {
        await signOut();
        showToast("You signed out.");
      } catch (error) {
        showToast(getErrorMessage(error));
      }

      return;
    }

    state.isSignUp = false;
    setAuthMode(state.isSignUp);
    openAuthDialog();
  });

  elements.switchAuth.addEventListener("click", (event) => {
    event.preventDefault();

    state.isSignUp = !state.isSignUp;
    setAuthMode(state.isSignUp);
  });

  elements.username.addEventListener("input", () => {
    if (!state.isSignUp) {
      return;
    }

    window.clearTimeout(state.usernameCheckTimer);

    elements.username.value = normalizeUsername(
      elements.username.value
    );

    state.usernameCheckTimer = window.setTimeout(() => {
      validateUsernameAvailability();
    }, 400);
  });

  elements.forgotPassword.addEventListener(
    "click",
    handlePasswordRecovery
  );

  elements.proposeButton.addEventListener("click", () => {
    if (!state.session) {
      state.isSignUp = false;
      setAuthMode(state.isSignUp);
      openAuthDialog();
      showToast("Sign in before proposing an event.");
      return;
    }

    openEventDialog();
  });

  elements.authForm.addEventListener("submit", handleAuthSubmit);
  elements.passwordForm.addEventListener("submit", handlePasswordSubmit);
  elements.eventForm.addEventListener("submit", handleEventSubmit);
  elements.adminEvents.addEventListener("click", handleAdminAction);
}

function watchApplicationChanges() {
  watchAuthState(async (event, session) => {
    await refreshApplication(session);

    if (
      event === "PASSWORD_RECOVERY" ||
      (event === "SIGNED_IN" && isPasswordSetupUrl())
    ) {
      showPasswordDialog();
    }
  });

  state.eventChannel = subscribeToEventChanges(refreshEvents);
}

async function initializeApplication() {
  setAuthMode(false);
  bindInterfaceEvents();
  startCountdowns();

    const session = await getCurrentSession();

    await refreshApplication(session);

    if (session && isPasswordSetupUrl()) {
      showPasswordDialog();
    }

    watchApplicationChanges();
}

window.addEventListener("beforeunload", () => {
  unsubscribeFromEventChanges(state.eventChannel);
});

initializeApplication();