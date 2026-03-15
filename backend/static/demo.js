const scenarioThemes = ["theme-wallet", "theme-esim", "theme-phone"];

const scenarios = {
  wallet: {
    label: "Wallet Heist",
    theme: "theme-wallet",
    attackTitle: "Wallet Heist",
    deviceTitle: "Wallet customer app",
    queue: "payments-risk",
    screenActionText: "Buy Now",
    safeActionButtonText: "User clicks Buy Now",
    attackActionButtonText: "Launch Wallet Attack",
    helperText:
      "Click Buy Now to run a safe wallet payment. Then click Launch Wallet Attack to send the risky payload and watch the app block it.",
    baseDevice: {
      user: "Aarav Patel",
      balance: "INR 84,220",
      alertLabel: "Protection active",
      alertTitle: "Wallet protection is ready for the next payment",
      mainMeta: "Wallet home",
      mainTitle: "Customer can buy or transfer safely",
      mainCopy: "The app is waiting for a real user action or an attack trigger from the console.",
      footer: "Waiting for user action",
      status: "Ready",
      tone: "watch",
      tiles: [
        {
          meta: "Merchant",
          title: "Orbit Gadgets",
          body: "A standard merchant checkout is ready for a protected payment."
        },
        {
          meta: "Amount",
          title: "INR 54,000",
          body: "The payment stays in review until the telecom risk check is complete."
        },
        {
          meta: "Protection",
          title: "SIM-backed trust",
          body: "The app will verify the device, SIM, carrier, and location before money moves."
        }
      ]
    },
    incident: {
      target: "Wallet payout rail",
      targetCopy: "The wallet flow can be approved for a real user or frozen if a SIM or eSIM attack appears.",
      action: "Waiting for user action",
      actionCopy: "Nothing happens until someone clicks Buy Now or launches the attacker flow.",
      queue: "payments-risk",
      queueCopy: "High-risk transfer cases will be routed to payments-risk."
    },
    baseline: {
      device_id: "demo-wallet-1",
      user_id: "wallet-user",
      phone_number: "+15551001001",
      imsi: "111",
      iccid: "AAA",
      carrier: "CarrierA",
      sim_type: "esim",
      esim_profile_id: "profile-a",
      trusted_geo_country: "IN"
    },
    safePayload: {
      device_id: "demo-wallet-1",
      user_id: "wallet-user",
      phone_number: "+15551001001",
      event_type: "money_transfer",
      imsi: "111",
      iccid: "AAA",
      carrier: "CarrierA",
      sim_type: "esim",
      esim_profile_id: "profile-a",
      ip_country: "IN",
      geo_country: "IN"
    },
    attackPayload: {
      device_id: "demo-wallet-1",
      user_id: "wallet-user",
      phone_number: "+15551001001",
      event_type: "money_transfer",
      imsi: "999",
      iccid: "ZZZ",
      carrier: "CarrierB",
      sim_type: "esim",
      esim_profile_id: "profile-z",
      recent_esim_download: true,
      port_out_request: true,
      failed_auth_count_24h: 8,
      device_integrity: "compromised",
      ip_country: "US",
      geo_country: "IN",
      hours_since_sim_change: 2
    },
    safePhases: [
      {
        label: "User",
        title: "Customer taps Buy Now",
        body: "The wallet opens a real payment check before sending money.",
        tone: "system",
        state: {
          alertLabel: "Payment review",
          alertTitle: "Checking wallet payment against trusted telecom identity",
          mainMeta: "Customer action",
          mainTitle: "Buy Now pressed",
          mainCopy: "The app is sending a live safe payment check to the backend.",
          footer: "Verifying wallet payment",
          status: "Customer action",
          tone: "watch"
        }
      },
      {
        label: "App",
        title: "SIMSentinel receives the safe wallet request",
        body: "The device, SIM, carrier, and location all match the trusted baseline.",
        tone: "defense",
        state: {
          alertLabel: "Safe check",
          alertTitle: "Trusted device and telecom profile confirmed",
          mainMeta: "Live assess call",
          mainTitle: "Sending safe wallet payload",
          mainCopy: "The backend is scoring the request before the payment is approved.",
          footer: "Awaiting allow decision",
          status: "Assessing",
          tone: "watch"
        }
      }
    ],
    attackPhases: [
      {
        label: "Attack",
        title: "Attacker steals wallet credentials and opens the payment screen",
        body: "A risky actor attempts to push the same wallet flow from a manipulated telecom identity.",
        tone: "attack",
        state: {
          alertLabel: "Suspicious session",
          alertTitle: "The wallet is seeing an unusual payment attempt",
          mainMeta: "Attack start",
          mainTitle: "A risky checkout request is entering the app",
          mainCopy: "The app keeps the payment in a guarded state while the console attack runs.",
          footer: "Monitoring attack flow",
          status: "Attack running",
          tone: "watch"
        }
      },
      {
        label: "Swap",
        title: "Carrier drift and eSIM swap appear on the same number",
        body: "The backend sees a fresh eSIM download, a port-out request, and telecom identity drift.",
        tone: "attack",
        state: {
          alertLabel: "eSIM risk",
          alertTitle: "Recent telecom changes detected on the account",
          mainMeta: "Telecom drift",
          mainTitle: "Trusted wallet identity no longer matches",
          mainCopy: "The app is now expecting a block or freeze response from the backend.",
          footer: "Escalating wallet risk",
          status: "Telecom drift",
          tone: "watch"
        }
      },
      {
        label: "Protect",
        title: "The app keeps the wallet flow paused until the backend responds",
        body: "No funds move while the live risk policy decides whether to allow, hold, or block the payment.",
        tone: "defense",
        state: {
          alertLabel: "Protection ready",
          alertTitle: "Wallet transfer is being evaluated live",
          mainMeta: "Decisioning",
          mainTitle: "Waiting for payments-risk verdict",
          mainCopy: "The app is ready to replace the checkout with a block screen if the risk is critical.",
          footer: "Awaiting wallet decision",
          status: "Awaiting verdict",
          tone: "watch"
        }
      }
    ]
  },
  esim: {
    label: "eSIM Clone",
    theme: "theme-esim",
    attackTitle: "eSIM Clone",
    deviceTitle: "Identity recovery app",
    queue: "account-recovery",
    screenActionText: "Start Recovery",
    safeActionButtonText: "User starts recovery",
    attackActionButtonText: "Launch eSIM Attack",
    helperText:
      "Click Start Recovery to run a normal recovery check. Then launch the eSIM attack to see the app hold the reset flow live.",
    baseDevice: {
      user: "Maya Singh",
      balance: "Recovery flow",
      alertLabel: "Protection active",
      alertTitle: "Recovery protection is ready for the next request",
      mainMeta: "Recovery home",
      mainTitle: "Customer can recover safely",
      mainCopy: "The app waits for a normal recovery start or an eSIM attack from the attacker console.",
      footer: "Waiting for user action",
      status: "Ready",
      tone: "watch",
      tiles: [
        {
          meta: "Account",
          title: "OTP recovery",
          body: "Recovery stays behind telecom and device trust checks."
        },
        {
          meta: "Channel",
          title: "Phone number verified",
          body: "The line is trusted until a suspicious eSIM event appears."
        },
        {
          meta: "Protection",
          title: "Guided recovery hold",
          body: "If the eSIM risk spikes, the app pauses reset actions and asks for stronger proof."
        }
      ]
    },
    incident: {
      target: "Recovery channel",
      targetCopy: "Recovery stays safe until someone triggers a normal reset or a cloned eSIM attack.",
      action: "Waiting for user action",
      actionCopy: "Nothing changes until the recovery flow or the attack flow is triggered.",
      queue: "account-recovery",
      queueCopy: "High-risk recovery cases will be routed to account-recovery."
    },
    baseline: {
      device_id: "demo-esim-1",
      user_id: "recovery-user",
      phone_number: "+15551001002",
      imsi: "654",
      iccid: "CCC",
      carrier: "CarrierA",
      sim_type: "esim",
      esim_profile_id: "profile-safe",
      trusted_geo_country: "IN"
    },
    safePayload: {
      device_id: "demo-esim-1",
      user_id: "recovery-user",
      phone_number: "+15551001002",
      event_type: "otp_reset",
      imsi: "654",
      iccid: "CCC",
      carrier: "CarrierA",
      sim_type: "esim",
      esim_profile_id: "profile-safe",
      ip_country: "IN",
      geo_country: "IN"
    },
    attackPayload: {
      device_id: "demo-esim-1",
      user_id: "recovery-user",
      phone_number: "+15551001002",
      event_type: "otp_reset",
      imsi: "654",
      iccid: "CCC",
      carrier: "CarrierA",
      sim_type: "esim",
      esim_profile_id: "profile-safe",
      recent_esim_download: true,
      otp_reset_requested: true,
      hours_since_sim_change: 60,
      ip_country: "IN",
      geo_country: "IN"
    },
    safePhases: [
      {
        label: "User",
        title: "Customer starts account recovery",
        body: "The user opens the normal OTP reset journey from a trusted device and line.",
        tone: "system",
        state: {
          alertLabel: "Recovery review",
          alertTitle: "Checking recovery request against the trusted eSIM profile",
          mainMeta: "Customer action",
          mainTitle: "Recovery started",
          mainCopy: "The app is asking the backend whether the phone number can continue into reset.",
          footer: "Verifying recovery flow",
          status: "Customer action",
          tone: "watch"
        }
      },
      {
        label: "App",
        title: "SIMSentinel receives the safe recovery request",
        body: "The recovery payload looks normal, so the app expects a safe allow response.",
        tone: "defense",
        state: {
          alertLabel: "Safe check",
          alertTitle: "Trusted recovery request confirmed",
          mainMeta: "Live assess call",
          mainTitle: "Sending safe recovery payload",
          mainCopy: "The app is waiting for a live backend decision before continuing.",
          footer: "Awaiting allow decision",
          status: "Assessing",
          tone: "watch"
        }
      }
    ],
    attackPhases: [
      {
        label: "Attack",
        title: "Attacker brings the number onto a fresh eSIM",
        body: "A cloned or recently moved eSIM is used to start the recovery path.",
        tone: "attack",
        state: {
          alertLabel: "eSIM event",
          alertTitle: "Fresh telecom activity found on the recovery channel",
          mainMeta: "Attack start",
          mainTitle: "Recovery request now looks suspicious",
          mainCopy: "The app is keeping the reset path in a guarded state while the backend checks the line.",
          footer: "Monitoring recovery attack",
          status: "Attack running",
          tone: "watch"
        }
      },
      {
        label: "Recover",
        title: "The cloned line is used to push an OTP reset",
        body: "The attack tries to take over the recovery flow before the legitimate customer notices.",
        tone: "attack",
        state: {
          alertLabel: "Recovery risk",
          alertTitle: "The app sees a reset request near recent eSIM movement",
          mainMeta: "Risk escalation",
          mainTitle: "Recovery is moving toward a hold state",
          mainCopy: "Reset actions are still paused while the backend applies the recovery policy.",
          footer: "Escalating recovery risk",
          status: "Recovery risk",
          tone: "watch"
        }
      },
      {
        label: "Protect",
        title: "The app prepares a protected hold screen",
        body: "The frontend is ready to pause recovery and ask for stronger proof from the real customer.",
        tone: "defense",
        state: {
          alertLabel: "Protection ready",
          alertTitle: "Recovery flow is being evaluated live",
          mainMeta: "Decisioning",
          mainTitle: "Waiting for account-recovery verdict",
          mainCopy: "The app will hold the reset flow if the live risk engine says the line cannot be trusted.",
          footer: "Awaiting recovery decision",
          status: "Awaiting verdict",
          tone: "watch"
        }
      }
    ]
  },
  phone: {
    label: "Phone Takeover",
    theme: "theme-phone",
    attackTitle: "Phone Takeover",
    deviceTitle: "Customer login app",
    queue: "identity-risk",
    screenActionText: "Sign In",
    safeActionButtonText: "User signs in",
    attackActionButtonText: "Launch Phone Attack",
    helperText:
      "Click Sign In to run a normal login. Then launch the phone attack to watch the app switch into a live challenge flow.",
    baseDevice: {
      user: "Jordan Lee",
      balance: "Login session",
      alertLabel: "Protection active",
      alertTitle: "Login protection is ready for the next session",
      mainMeta: "Login home",
      mainTitle: "Customer can sign in normally",
      mainCopy: "The app waits for a real sign-in click or a suspicious phone takeover attempt.",
      footer: "Waiting for user action",
      status: "Ready",
      tone: "watch",
      tiles: [
        {
          meta: "Access",
          title: "Customer sign-in",
          body: "Normal login remains fast when the device and SIM are trusted."
        },
        {
          meta: "Signal",
          title: "Device posture",
          body: "Unexpected device changes can move the user into a stronger challenge."
        },
        {
          meta: "Protection",
          title: "Step-up ready",
          body: "The app can challenge the session without silently failing or exposing the account."
        }
      ]
    },
    incident: {
      target: "Customer session",
      targetCopy: "The login can be allowed for a trusted customer or challenged if the phone looks compromised.",
      action: "Waiting for user action",
      actionCopy: "Nothing changes until the user signs in or the attack button is clicked.",
      queue: "identity-risk",
      queueCopy: "Risky phone sessions will be routed through identity-risk controls."
    },
    baseline: {
      device_id: "demo-phone-1",
      user_id: "login-user",
      phone_number: "+15551001003",
      imsi: "321",
      iccid: "BBB",
      carrier: "CarrierSafe",
      sim_type: "esim",
      esim_profile_id: "profile-safe",
      trusted_geo_country: "US"
    },
    safePayload: {
      device_id: "demo-phone-1",
      user_id: "login-user",
      phone_number: "+15551001003",
      event_type: "login",
      imsi: "321",
      iccid: "BBB",
      carrier: "CarrierSafe",
      sim_type: "esim",
      esim_profile_id: "profile-safe",
      ip_country: "US"
    },
    attackPayload: {
      device_id: "demo-phone-1",
      user_id: "login-user",
      phone_number: "+15551001003",
      event_type: "login",
      imsi: "321",
      iccid: "BBB",
      carrier: "CarrierSafe",
      sim_type: "esim",
      esim_profile_id: "profile-safe",
      failed_auth_count_24h: 5,
      device_integrity: "compromised",
      ip_country: "US"
    },
    safePhases: [
      {
        label: "User",
        title: "Customer taps Sign In",
        body: "The app starts a normal login with a live SIM and device trust check in the background.",
        tone: "system",
        state: {
          alertLabel: "Login review",
          alertTitle: "Checking the sign-in against the trusted device and eSIM profile",
          mainMeta: "Customer action",
          mainTitle: "Sign In pressed",
          mainCopy: "The app is sending the login request to the live backend before opening a session.",
          footer: "Verifying login",
          status: "Customer action",
          tone: "watch"
        }
      },
      {
        label: "App",
        title: "SIMSentinel receives the safe login request",
        body: "The device and telecom signals match the baseline, so the app expects a clean allow response.",
        tone: "defense",
        state: {
          alertLabel: "Safe check",
          alertTitle: "Trusted login request confirmed",
          mainMeta: "Live assess call",
          mainTitle: "Sending safe login payload",
          mainCopy: "The app is waiting for the live backend decision before creating a session.",
          footer: "Awaiting allow decision",
          status: "Assessing",
          tone: "watch"
        }
      }
    ],
    attackPhases: [
      {
        label: "Attack",
        title: "A suspicious phone session starts hammering the login screen",
        body: "The attacker tries to get through with repeated failures from a risky device.",
        tone: "attack",
        state: {
          alertLabel: "Auth burst",
          alertTitle: "Repeated login failures detected on this phone",
          mainMeta: "Attack start",
          mainTitle: "Login is entering a guarded path",
          mainCopy: "The app is narrowing the session while the backend checks the device posture.",
          footer: "Monitoring suspicious login",
          status: "Attack running",
          tone: "watch"
        }
      },
      {
        label: "Posture",
        title: "The device integrity signal fails during login",
        body: "The backend receives a compromised-device signal and the session stops looking trustworthy.",
        tone: "attack",
        state: {
          alertLabel: "Device posture",
          alertTitle: "The app no longer trusts the phone at face value",
          mainMeta: "Risk escalation",
          mainTitle: "The session is moving toward a challenge state",
          mainCopy: "The user will be guided into MFA instead of getting a full session immediately.",
          footer: "Escalating login risk",
          status: "Device compromised",
          tone: "watch"
        }
      },
      {
        label: "Protect",
        title: "The app prepares a guided MFA challenge",
        body: "The phone login stays live, but the app is ready to replace it with a stronger identity step.",
        tone: "defense",
        state: {
          alertLabel: "Protection ready",
          alertTitle: "Login is being evaluated live",
          mainMeta: "Decisioning",
          mainTitle: "Waiting for identity-risk verdict",
          mainCopy: "The app will challenge the session if the live risk engine sees a takeover pattern.",
          footer: "Awaiting login decision",
          status: "Awaiting verdict",
          tone: "watch"
        }
      }
    ]
  }
};

const elements = {
  heroVerdict: document.getElementById("hero-verdict"),
  heroQueue: document.getElementById("hero-queue"),
  demoStatus: document.getElementById("demo-status"),
  attackTitle: document.getElementById("attack-title"),
  attackFeed: document.getElementById("attack-feed"),
  phaseTrack: document.getElementById("phase-track"),
  safeActionButton: document.getElementById("safe-action-button"),
  attackActionButton: document.getElementById("attack-action-button"),
  resetButton: document.getElementById("reset-demo"),
  attackHelper: document.getElementById("attack-helper"),
  deviceTitle: document.getElementById("device-title"),
  deviceStatus: document.getElementById("device-status"),
  deviceFrame: document.getElementById("device-frame"),
  screenUser: document.getElementById("screen-user"),
  screenBalance: document.getElementById("screen-balance"),
  screenAlert: document.getElementById("screen-alert"),
  screenAlertTitle: document.getElementById("screen-alert-title"),
  screenMainMeta: document.getElementById("screen-main-meta"),
  screenMainTitle: document.getElementById("screen-main-title"),
  screenMainCopy: document.getElementById("screen-main-copy"),
  screenTiles: document.getElementById("screen-tiles"),
  screenPrimaryAction: document.getElementById("screen-primary-action"),
  screenFooterCta: document.getElementById("screen-footer-cta"),
  shieldStatus: document.getElementById("shield-status"),
  shieldBadge: document.getElementById("shield-badge"),
  riskScore: document.getElementById("risk-score"),
  riskSeverity: document.getElementById("risk-severity"),
  backendAction: document.getElementById("backend-action"),
  blockedList: document.getElementById("blocked-list"),
  checksList: document.getElementById("checks-list"),
  flagsList: document.getElementById("flags-list"),
  backendEvents: document.getElementById("backend-events"),
  backendAlerts: document.getElementById("backend-alerts"),
  backendLastAlert: document.getElementById("backend-last-alert"),
  incidentTarget: document.getElementById("incident-target"),
  incidentTargetCopy: document.getElementById("incident-target-copy"),
  incidentAction: document.getElementById("incident-action"),
  incidentActionCopy: document.getElementById("incident-action-copy"),
  incidentQueue: document.getElementById("incident-queue"),
  incidentQueueCopy: document.getElementById("incident-queue-copy"),
  incidentLiveState: document.getElementById("incident-live-state")
};

let currentScenario = "wallet";
let activeRunId = 0;
let busy = false;

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function getJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return response.json();
}

function labelize(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatIsoTime(value) {
  if (!value) {
    return "unknown time";
  }

  return value.replace("T", " ").replace("+00:00", " UTC");
}

function cloneState(baseState, overrides) {
  return {
    ...baseState,
    ...overrides,
    tiles: overrides && overrides.tiles ? overrides.tiles : baseState.tiles
  };
}

function decisionTone(decision) {
  if (decision === "allow") {
    return "allow";
  }
  if (decision === "challenge") {
    return "challenge";
  }
  if (decision === "hold") {
    return "hold";
  }
  return "block";
}

function renderList(container, items, fallback) {
  container.innerHTML = "";
  const safeItems = items && items.length ? items : [fallback];

  safeItems.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    container.appendChild(li);
  });
}

function renderTiles(tiles) {
  elements.screenTiles.innerHTML = tiles
    .map((tile) => `
      <article class="screen-tile">
        <span>${tile.meta}</span>
        <strong>${tile.title}</strong>
        <p>${tile.body}</p>
      </article>
    `)
    .join("");
}

function setBodyTheme(themeName) {
  document.body.classList.remove(...scenarioThemes);
  document.body.classList.add(themeName);
}

function setScenarioTabState(name) {
  document.querySelectorAll(".scenario-tab").forEach((button) => {
    const isActive = button.dataset.scenario === name;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function setBusy(nextBusy) {
  busy = nextBusy;
  elements.safeActionButton.disabled = nextBusy;
  elements.attackActionButton.disabled = nextBusy;
  elements.screenPrimaryAction.disabled = nextBusy;

  document.querySelectorAll(".scenario-tab").forEach((button) => {
    button.disabled = nextBusy;
  });
}

function setDemoStatus(text, tone) {
  elements.demoStatus.textContent = text;
  elements.demoStatus.className = `status-pill ${tone || ""}`.trim();
}

function setHero(verdict, queue, tone) {
  elements.heroVerdict.textContent = verdict;
  elements.heroVerdict.className = tone || "";
  elements.heroQueue.textContent = queue;
}

function setIncidentState(label, tone) {
  elements.incidentLiveState.textContent = label;
  const highlight = tone === "live" || tone === "running" ? "hot" : "";
  elements.incidentLiveState.className = `status-pill ${highlight} ${tone || ""}`.trim();
}

function renderPhaseTrack(phases, activeIndex) {
  elements.phaseTrack.innerHTML = phases
    .map((phase, index) => {
      let state = "";

      if (index < activeIndex) {
        state = "completed";
      } else if (index === activeIndex) {
        state = "active";
      }

      return `<div class="phase-pill ${state}" title="${phase.label}"></div>`;
    })
    .join("");
}

function applyDeviceState(state) {
  elements.screenUser.textContent = state.user;
  elements.screenBalance.textContent = state.balance;
  elements.deviceStatus.textContent = state.status;
  elements.deviceStatus.className = `device-status ${state.tone || ""}`.trim();
  elements.screenAlert.className = `screen-alert ${state.tone || ""}`.trim();
  elements.screenAlert.firstElementChild.textContent = state.alertLabel;
  elements.screenAlertTitle.textContent = state.alertTitle;
  elements.screenMainMeta.textContent = state.mainMeta;
  elements.screenMainTitle.textContent = state.mainTitle;
  elements.screenMainCopy.textContent = state.mainCopy;
  elements.screenFooterCta.textContent = state.footer;
  elements.deviceFrame.className = `device-frame ${state.tone || ""}`.trim();
  renderTiles(state.tiles);
}

function applyIncidentContent(incident) {
  elements.incidentTarget.textContent = incident.target;
  elements.incidentTargetCopy.textContent = incident.targetCopy;
  elements.incidentAction.textContent = incident.action;
  elements.incidentActionCopy.textContent = incident.actionCopy;
  elements.incidentQueue.textContent = incident.queue;
  elements.incidentQueueCopy.textContent = incident.queueCopy;
}

function addFeedLine(entry, tone) {
  const line = document.createElement("article");
  line.className = `attack-line ${tone || ""}`.trim();
  line.innerHTML = `
    <span>${new Date().toLocaleTimeString()} - ${entry.label}</span>
    <strong>${entry.title}</strong>
    <p>${entry.body}</p>
  `;
  elements.attackFeed.appendChild(line);

  const container = elements.attackFeed.parentElement;
  container.scrollTop = container.scrollHeight;
}

function finalFooterForDecision(decision) {
  if (decision === "allow") {
    return "The customer can continue through the normal app flow";
  }
  if (decision === "challenge") {
    return "The user must complete stronger verification to continue";
  }
  if (decision === "hold") {
    return "Sensitive actions are paused until review is complete";
  }
  return "Critical actions are blocked and extra protections are active";
}

function finalIncidentAction(result) {
  if (result.decision === "allow") {
    return "Flow approved";
  }
  if (result.decision === "challenge") {
    return "Identity challenge launched";
  }
  if (result.decision === "hold") {
    return "Sensitive flow paused";
  }
  return "Critical actions blocked";
}

function buildResultTiles(result) {
  const checks = result.flow_policy.required_checks.length
    ? result.flow_policy.required_checks.map(labelize).join(", ")
    : "No extra checks";
  const blocked = result.flow_policy.blocked_actions.length
    ? result.flow_policy.blocked_actions.map(labelize).join(", ")
    : "No actions blocked";
  const flags = result.flags.length ? result.flags.map(labelize).join(", ") : "No active flags";

  return [
    {
      meta: "Decision",
      title: result.decision.toUpperCase(),
      body: result.flow_policy.user_message
    },
    {
      meta: "Checks",
      title: checks,
      body: "These checks come directly from the backend flow policy."
    },
    {
      meta: "Flags",
      title: flags,
      body: `Risk ${result.risk}/99 with ${result.severity} severity.`
    },
    {
      meta: "Backend action",
      title: labelize(result.flow_policy.backend_action),
      body: `Queue: ${result.flow_policy.review_queue}`
    }
  ];
}

function applyAssessmentResult(scenario, result) {
  const tone = decisionTone(result.decision);
  const verdict = result.decision.toUpperCase();

  elements.shieldStatus.textContent = labelize(result.severity);
  elements.shieldStatus.className = `shield-status ${tone}`.trim();
  elements.shieldBadge.textContent = verdict;
  elements.shieldBadge.className = `shield-badge ${tone}`.trim();
  elements.riskScore.textContent = String(result.risk);
  elements.riskSeverity.textContent = result.severity;
  elements.backendAction.textContent = result.flow_policy.backend_action;

  renderList(
    elements.blockedList,
    result.flow_policy.blocked_actions.map(labelize),
    "No blocked actions"
  );
  renderList(
    elements.checksList,
    result.flow_policy.required_checks.map(labelize),
    "No extra checks"
  );
  renderList(
    elements.flagsList,
    result.flags.map(labelize),
    "No active flags"
  );

  setHero(verdict, result.flow_policy.review_queue, tone);
  setDemoStatus(labelize(result.decision), tone);
  setIncidentState(finalIncidentAction(result), tone);

  applyDeviceState(
    cloneState(scenario.baseDevice, {
      alertLabel: labelize(result.decision),
      alertTitle: result.flow_policy.user_message,
      mainMeta: "Backend action",
      mainTitle: labelize(result.flow_policy.backend_action),
      mainCopy: `Risk ${result.risk}/99, ${result.severity} severity, decision ${result.decision}.`,
      footer: finalFooterForDecision(result.decision),
      status: labelize(result.decision),
      tone,
      tiles: buildResultTiles(result)
    })
  );

  applyIncidentContent({
    target: scenario.incident.target,
    targetCopy: scenario.incident.targetCopy,
    action: finalIncidentAction(result),
    actionCopy: result.flow_policy.user_message,
    queue: result.flow_policy.review_queue,
    queueCopy: `Backend action: ${labelize(result.flow_policy.backend_action)}`
  });

  addFeedLine(
    {
      label: "Protect",
      title: `${verdict} returned from the live backend`,
      body: `SIMSentinel returned ${result.flow_policy.backend_action} and updated the app in real time.`
    },
    "defense"
  );
}

function showErrorState(error) {
  setHero("ERROR", "demo-runtime", "block");
  setDemoStatus("Error", "block");
  setIncidentState("Demo issue", "block");
  elements.shieldStatus.textContent = "Error";
  elements.shieldStatus.className = "shield-status block";
  elements.shieldBadge.textContent = "ERROR";
  elements.shieldBadge.className = "shield-badge block";
  elements.riskScore.textContent = "--";
  elements.riskSeverity.textContent = "error";
  elements.backendAction.textContent = "demo_failed";
  renderList(elements.blockedList, ["Simulation unavailable"], "Simulation unavailable");
  renderList(elements.checksList, ["Inspect server state"], "Inspect server state");
  renderList(elements.flagsList, ["DEMO_ERROR"], "DEMO_ERROR");
  elements.backendLastAlert.textContent = `The live demo hit an error: ${String(error)}`;

  addFeedLine(
    {
      label: "Error",
      title: "The live backend call failed",
      body: String(error)
    },
    "error"
  );
}

async function ensureBaseline(scenario) {
  if (!scenario.baseline) {
    return;
  }

  await getJson("/enroll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scenario.baseline)
  });
}

async function loadLiveBackendState(result) {
  const stats = await getJson("/stats");
  elements.backendEvents.textContent = String(stats.events || 0);
  elements.backendAlerts.textContent = String(stats.alerts || 0);

  const shouldLoadAlert = result && (result.severity === "high" || result.severity === "critical");

  if (shouldLoadAlert) {
    const alerts = await getJson("/alerts?limit=1");
    if (alerts.items && alerts.items.length) {
      const latest = alerts.items[0];
      elements.backendLastAlert.textContent =
        `${labelize(latest.severity)} alert at ${formatIsoTime(latest.time)}. ` +
        `Flow: ${labelize(latest.flow_type)}. Action: ${labelize(latest.flow_backend_action || latest.action)}.`;
      return;
    }
  }

  if (result) {
    elements.backendLastAlert.textContent =
      result.severity === "high" || result.severity === "critical"
        ? "The backend completed a high-risk decision, but no alert record was returned."
        : `No alert was created because the ${result.decision} decision was handled directly inside the app.`;
    return;
  }

  elements.backendLastAlert.textContent =
    "The backend is ready. Click the user flow or the attack button to create live events.";
}

function renderScenarioControls(scenario) {
  elements.safeActionButton.textContent = scenario.safeActionButtonText;
  elements.attackActionButton.textContent = scenario.attackActionButtonText;
  elements.attackHelper.textContent = scenario.helperText;
  elements.screenPrimaryAction.textContent = scenario.screenActionText;
}

function renderBaseScene(scenario) {
  setBodyTheme(scenario.theme);
  setScenarioTabState(currentScenario);
  renderScenarioControls(scenario);
  elements.attackTitle.textContent = scenario.attackTitle;
  elements.deviceTitle.textContent = scenario.deviceTitle;
  elements.deviceStatus.textContent = scenario.baseDevice.status;
  elements.deviceStatus.className = `device-status ${scenario.baseDevice.tone}`.trim();
  elements.screenAlert.className = `screen-alert ${scenario.baseDevice.tone}`.trim();
  elements.deviceFrame.className = `device-frame ${scenario.baseDevice.tone}`.trim();
  elements.shieldStatus.textContent = "Armed";
  elements.shieldStatus.className = "shield-status watch";
  elements.shieldBadge.textContent = "READY";
  elements.shieldBadge.className = "shield-badge watch";
  elements.riskScore.textContent = "--";
  elements.riskSeverity.textContent = "waiting";
  elements.backendAction.textContent = "waiting_for_click";
  renderList(elements.blockedList, [], "Blocked actions will appear here");
  renderList(elements.checksList, [], "Required checks will appear here");
  renderList(elements.flagsList, [], "Detection flags will appear here");
  setHero("READY", scenario.queue, "watch");
  setDemoStatus("Click the user or attack button", "ready");
  setIncidentState("Idle", "ready");
  applyDeviceState(scenario.baseDevice);
  applyIncidentContent(scenario.incident);
  elements.attackFeed.innerHTML = "";
  renderPhaseTrack([], -1);
}

async function runFlow(mode) {
  const scenario = scenarios[currentScenario];
  const phases = mode === "safe" ? scenario.safePhases : scenario.attackPhases;
  const payload = mode === "safe" ? scenario.safePayload : scenario.attackPayload;
  const runId = ++activeRunId;

  setBusy(true);
  renderBaseScene(scenario);

  addFeedLine(
    {
      label: "Ready",
      title: mode === "safe" ? "Customer flow started" : "Attack flow started",
      body:
        mode === "safe"
          ? "The demo is running a real app action against the live backend."
          : "The demo is now sending the attack pattern through the live backend."
    },
    mode === "safe" ? "system" : "attack"
  );

  try {
    await ensureBaseline(scenario);
    if (runId !== activeRunId) {
      return;
    }

    addFeedLine(
      {
        label: "Baseline",
        title: "Trusted baseline prepared",
        body: "The live backend has a known-good SIM or eSIM profile for comparison."
      },
      "defense"
    );

    for (let index = 0; index < phases.length; index += 1) {
      if (runId !== activeRunId) {
        return;
      }

      const phase = phases[index];
      renderPhaseTrack(phases, index);
      applyDeviceState(cloneState(scenario.baseDevice, phase.state));
      addFeedLine(
        {
          label: phase.label,
          title: phase.title,
          body: phase.body
        },
        phase.tone
      );
      setDemoStatus(`Step ${index + 1} of ${phases.length}`, "running");
      setIncidentState(mode === "safe" ? "User flow live" : "Attack flow live", "running");
      await sleep(mode === "safe" ? 500 : 700);
    }

    if (runId !== activeRunId) {
      return;
    }

    addFeedLine(
      {
        label: "API",
        title: "Calling /assess with the live app payload",
        body: "The frontend is now waiting for the real backend decision."
      },
      "defense"
    );
    setDemoStatus("Assessing", "running");

    const result = await getJson("/assess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (runId !== activeRunId) {
      return;
    }

    renderPhaseTrack(phases, phases.length);
    applyAssessmentResult(scenario, result);
    await loadLiveBackendState(result);
  } catch (error) {
    if (runId !== activeRunId) {
      return;
    }

    showErrorState(error);
    try {
      await loadLiveBackendState();
    } catch (nestedError) {
      elements.backendLastAlert.textContent = `Live backend refresh failed: ${String(nestedError)}`;
    }
  } finally {
    if (runId === activeRunId) {
      setBusy(false);
    }
  }
}

function resetScenario(name = currentScenario) {
  currentScenario = name;
  activeRunId += 1;
  setBusy(false);
  renderBaseScene(scenarios[currentScenario]);

  addFeedLine(
    {
      label: "Ready",
      title: `${scenarios[currentScenario].label} demo armed`,
      body: scenarios[currentScenario].helperText
    },
    "system"
  );

  loadLiveBackendState().catch((error) => {
    elements.backendLastAlert.textContent = `Live backend refresh failed: ${String(error)}`;
  });
}

function bindEvents() {
  document.querySelectorAll(".scenario-tab").forEach((button) => {
    button.addEventListener("click", () => {
      if (busy) {
        return;
      }
      resetScenario(button.dataset.scenario);
    });
  });

  elements.safeActionButton.addEventListener("click", () => {
    runFlow("safe");
  });

  elements.attackActionButton.addEventListener("click", () => {
    runFlow("attack");
  });

  elements.screenPrimaryAction.addEventListener("click", () => {
    runFlow("safe");
  });

  elements.resetButton.addEventListener("click", () => {
    resetScenario(currentScenario);
  });
}

function boot() {
  bindEvents();
  resetScenario(currentScenario);
}

boot();
