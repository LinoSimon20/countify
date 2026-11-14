export const elements = {
  authButton: document.querySelector("#authButton"),
  authDialog: document.querySelector("#authDialog"),
  authForm: document.querySelector("#authForm"),
  authHint: document.querySelector("#authHint"),
  authTitle: document.querySelector("#authTitle"),
  eventDialog: document.querySelector("#eventDialog"),
  eventForm: document.querySelector("#eventForm"),
  featured: document.querySelector("#featured"),
  events: document.querySelector("#events"),
  myEvents: document.querySelector("#myEvents"),
  mySection: document.querySelector("#mySection"),
  proposeButton: document.querySelector("#proposeButton"),
  switchAuth: document.querySelector("#switchAuth"),
  toast: document.querySelector("#toast"),
  userLabel: document.querySelector("#userLabel"),
  adminEvents: document.querySelector("#adminEvents"),
  adminPanel: document.querySelector("#adminPanel")
};

export function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 3600);
}

export function openAuthDialog() {
  elements.authDialog.showModal();
}

export function closeAuthDialog() {
  elements.authDialog.close();
}

export function openEventDialog() {
  elements.eventDialog.showModal();
}

export function closeEventDialog() {
  elements.eventDialog.close();
}

export function setAuthMode(isSignUp) {
  elements.authTitle.textContent = isSignUp
    ? "Create an account"
    : "Sign in to Countify";

  elements.authHint.textContent = isSignUp
    ? "We will send an email so you can confirm your account."
    : "Sign in with your Countify account.";

  elements.switchAuth.textContent = isSignUp
    ? "I already have an account"
    : "Create an account";
}

export function setUserInterface(session) {
  const isSignedIn = Boolean(session);

  elements.userLabel.textContent = isSignedIn
    ? session.user.email
    : "";

  elements.authButton.textContent = isSignedIn
    ? "Sign out"
    : "Sign in";
}

export function toggleAdminPanel(isAdmin) {
  elements.adminPanel.classList.toggle("active", isAdmin);
}