const form = document.getElementById("login-form");
const submitButton = document.getElementById("login-submit");
const statusNode = document.getElementById("login-status");
const statusCopyNode = document.getElementById("login-status-copy");
const statusCard = document.getElementById("login-status-card");
const nextPageLabel = document.getElementById("next-page-label");
const identityInput = document.getElementById("identity-input");
const stagePills = Array.from(document.querySelectorAll("[data-stage-pill]"));

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
const nextPageName = describeNextPage(nextPage);

function setStageState(activeIndex, completedUntil = -1) {
  stagePills.forEach((pill, index) => {
    pill.classList.toggle("active", index === activeIndex);
    pill.classList.toggle("complete", index <= completedUntil);
  });
}

function refreshIdleState() {
  const identity = identityInput.value.trim();
  const subject = identity || "this account";

  statusCard.classList.remove("processing", "success");
  statusNode.textContent = "Secure handoff ready";
  statusCopyNode.textContent = `SIMSentinel will verify ${subject}, check device and eSIM trust, and then open ${nextPageName}.`;
  setStageState(0);
}

window.addEventListener("DOMContentLoaded", () => {
  window.requestAnimationFrame(() => {
    document.body.classList.add("page-ready");
  });
});

nextPageLabel.textContent = nextPageName;
refreshIdleState();

identityInput.addEventListener("input", refreshIdleState);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const identity = identityInput.value.trim() || "customer";

  submitButton.disabled = true;
  submitButton.classList.add("loading");
  submitButton.textContent = "Running Trust Checks...";
  statusCard.classList.remove("success");
  statusCard.classList.add("processing");
  statusNode.textContent = "Identity and device checks running";
  statusCopyNode.textContent = `Verifying ${identity} before opening ${nextPageName}. SIM, eSIM, and device trust checks are active now.`;
  setStageState(1, 0);

  window.setTimeout(() => {
    statusCard.classList.remove("processing");
    statusCard.classList.add("success");
    statusNode.textContent = "Login approved";
    statusCopyNode.textContent = `${identity} passed the protected handoff and is being redirected to ${nextPageName} now.`;
    submitButton.textContent = "Redirecting...";
    setStageState(2, 1);
  }, 420);

  window.setTimeout(() => {
    window.location.href = nextPage;
  }, 1150);
});
