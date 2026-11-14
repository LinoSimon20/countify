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
  forgotPassword: document.querySelector("#forgotPassword"),
  toast: document.querySelector("#toast"),
  userLabel: document.querySelector("#userLabel"),
  adminEvents: document.querySelector("#adminEvents"),
  adminPanel: document.querySelector("#adminPanel"),
  email: document.querySelector("#email"),
  password: document.querySelector("#password"),
  profileFields: document.querySelector("#profileFields"),
  firstName: document.querySelector("#firstName"),
  lastName: document.querySelector("#lastName"),
  username: document.querySelector("#username"),
  usernameStatus: document.querySelector("#usernameStatus"),
  confirmPasswordField: document.querySelector("#confirmPasswordField"),
  confirmSignUpPassword: document.querySelector("#confirmSignUpPassword"),
  eventTitle: document.querySelector("#eventTitle"),
  eventDate: document.querySelector("#eventDate"),
  eventDescription: document.querySelector("#eventDescription"),
  passwordDialog: document.querySelector("#passwordDialog"),
  passwordForm: document.querySelector("#passwordForm"),
  newPassword: document.querySelector("#newPassword"),
  confirmPassword: document.querySelector("#confirmPassword")
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

export function openPasswordDialog() {
  elements.passwordDialog.showModal();
}

export function closePasswordDialog() {
  elements.passwordDialog.close();
}

export function setAuthMode(isSignUp) {
  elements.authTitle.textContent = isSignUp
    ? "Crear una cuenta"
    : "Entrar a Countify";

  elements.authHint.textContent = isSignUp
    ? "Completa tus datos para crear tu cuenta."
    : "Ingresa con tu cuenta.";

  elements.switchAuth.textContent = isSignUp
    ? "Ya tengo una cuenta"
    : "Crear una cuenta";

  elements.profileFields.hidden = !isSignUp;
  elements.confirmPasswordField.hidden = !isSignUp;

  elements.firstName.required = isSignUp;
  elements.lastName.required = isSignUp;
  elements.username.required = isSignUp;
  elements.confirmSignUpPassword.required = isSignUp;

  elements.password.autocomplete = isSignUp
    ? "new-password"
    : "current-password";

  const submitButton = elements.authForm.querySelector(
    'button[type="submit"]'
  );

  submitButton.textContent = isSignUp
    ? "Crear cuenta"
    : "Entrar";
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