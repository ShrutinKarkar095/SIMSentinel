const form = document.getElementById("login-form");
const submitButton = document.getElementById("login-submit");
const statusNode = document.getElementById("login-status");
const statusCopyNode = document.getElementById("login-status-copy");
const statusCard = document.getElementById("login-status-card");
const nextPageLabel = document.getElementById("next-page-label");
const identityInput = document.getElementById("identity-input");

function resolveNextPage() {
  const params = new URLSearchParams(window.location.search);
  const nextPage = params.get("next");

  if (!nextPage || !nextPage.startsWith("/")) {
    return "/demo";
  }

  return nextPage;
}

function describeNextPage(nextPage) {
  if (nextPage === "/demo") {
    return "Live Demo";
  }
  if (nextPage === "/preview") {
    return "Preview";
  }
  return nextPage.replace("/", "").replace(/[-_]/g, " ") || "Next Page";
}

const nextPage = resolveNextPage();
nextPageLabel.textContent = describeNextPage(nextPage);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const identity = identityInput.value.trim() || "customer";

  submitButton.disabled = true;
  submitButton.classList.add("loading");
  submitButton.textContent = "Signing In...";
  statusCard.classList.add("success");
  statusNode.textContent = "Login approved";
  statusCopyNode.textContent = `${identity} is being redirected to the protected experience now.`;

  window.setTimeout(() => {
    window.location.href = nextPage;
  }, 900);
});
