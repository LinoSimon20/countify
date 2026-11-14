import {
  getCurrentSession,
  isCurrentUserAdmin,
  signIn,
  signOut,
  signUp,
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
  closeAuthDialog,
  closeEventDialog,
  elements,
  openAuthDialog,
  openEventDialog,
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
  session: null
};

function getErrorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
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
      await signUp({
        ...credentials,
        redirectTo: window.location.origin + window.location.pathname
      });

      showToast("Check your email to confirm your account.");
    } else {
      await signIn(credentials);
      showToast("Welcome to Countify.");
    }

    elements.authForm.reset();
    closeAuthDialog();
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
  elements.eventForm.addEventListener("submit", handleEventSubmit);
  elements.adminEvents.addEventListener("click", handleAdminAction);
}

function watchApplicationChanges() {
  watchAuthState(async (_event, session) => {
    await refreshApplication(session);
  });

  state.eventChannel = subscribeToEventChanges(refreshEvents);
}

async function initializeApplication() {
  setAuthMode(false);
  bindInterfaceEvents();
  startCountdowns();

  const session = await getCurrentSession();

  await refreshApplication(session);
  watchApplicationChanges();
}

window.addEventListener("beforeunload", () => {
  unsubscribeFromEventChanges(state.eventChannel);
});

initializeApplication();