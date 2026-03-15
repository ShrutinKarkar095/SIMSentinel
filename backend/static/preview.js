const scenarios = {
  wallet: {
    label: "Wallet attack simulation",
    baseline: {
      device_id: "preview-wallet-1",
      user_id: "wallet-user",
      phone_number: "+15551000001",
      imsi: "111",
      iccid: "AAA",
      carrier: "CarrierA",
      sim_type: "esim",
      esim_profile_id: "profile-a",
      trusted_geo_country: "IN"
    },
    payload: {
      device_id: "preview-wallet-1",
      user_id: "wallet-user",
      phone_number: "+15551000001",
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
    }
  },
  login: {
    label: "Clean login simulation",
    baseline: {
      device_id: "preview-login-1",
      user_id: "login-user",
      phone_number: "+15551000002",
      imsi: "321",
      iccid: "BBB",
      carrier: "CarrierSafe",
      sim_type: "esim",
      esim_profile_id: "profile-safe",
      trusted_geo_country: "US"
    },
    payload: {
      device_id: "preview-login-1",
      user_id: "login-user",
      phone_number: "+15551000002",
      event_type: "login",
      imsi: "321",
      iccid: "BBB",
      carrier: "CarrierSafe",
      sim_type: "esim",
      esim_profile_id: "profile-safe",
      ip_country: "US"
    }
  },
  otp: {
    label: "OTP reset threat simulation",
    baseline: {
      device_id: "preview-otp-1",
      user_id: "recover-user",
      phone_number: "+15551000003",
      imsi: "654",
      iccid: "CCC",
      carrier: "CarrierA",
      sim_type: "physical",
      trusted_geo_country: "IN"
    },
    payload: {
      device_id: "preview-otp-1",
      user_id: "recover-user",
      phone_number: "+15551000003",
      event_type: "otp_reset",
      imsi: "654",
      iccid: "CCC",
      carrier: "CarrierA",
      sim_type: "esim",
      recent_esim_download: true,
      otp_reset_requested: true,
      ip_country: "SG",
      geo_country: "IN",
      hours_since_sim_change: 5
    }
  },
  admin: {
    label: "Admin access challenge simulation",
    payload: {
      device_id: "preview-admin-1",
      user_id: "ops-admin",
      event_type: "admin_access",
      failed_auth_count_24h: 5,
      device_integrity: "unknown"
    }
  }
};

const experienceModes = {
  mobile: {
    screenKicker: "Mobile journey",
    screenTitle: "Secure account overview",
    screenSubtitle: "Monitor device trust, recent SIM activity, and approvals from one calm home screen.",
    screenState: "Stable",
    screenStateAction: "Review alerts only if something changes",
    storyTitle: "Mobile-first trust center",
    storyBody: "This looks like a polished consumer app. A user opens the app, checks trust status, and can tap into alerts, approvals, or recovery flows without feeling lost.",
    storyNavigation: "Bottom tabs with Home, Guard, Activity, and Help.",
    storyBestFor: "Wallets, banking apps, telecom self-care apps.",
    storyPrimaryAction: "Check status, approve safe activity, and react fast to SIM-risk alerts.",
    storySteps: [
      "Open the app and land on the home dashboard.",
      "Tap Guard to inspect the current device and SIM trust state.",
      "If an alert appears, open it and follow the guided challenge or hold message.",
      "Return to Activity to see what was blocked, challenged, or approved."
    ],
    cards: [
      {
        title: "Device trust score",
        meta: "Updated 12 sec ago",
        body: "Your main card shows whether the device and eSIM profile still match the trusted baseline."
      },
      {
        title: "Recent SIM events",
        meta: "2 monitored actions",
        body: "Users can see if a profile download, carrier drift, or SIM replacement happened recently."
      },
      {
        title: "Action center",
        meta: "Tap to review",
        body: "If something risky happened, the app clearly explains why a login or transfer is being challenged."
      }
    ],
    cta: "Open protection center",
    nav: ["Home", "Guard", "Activity", "Help"],
    activeNav: "Guard",
    statusLabel: "Protected"
  },
  banking: {
    screenKicker: "Banking console",
    screenTitle: "Transfer risk workspace",
    screenSubtitle: "Fraud analysts and operations teams can monitor high-value flows before money moves.",
    screenState: "High risk hold",
    screenStateAction: "Freeze outgoing transfers",
    storyTitle: "Banking-style operations console",
    storyBody: "This version feels like a fintech or bank operations product. It is less about the customer and more about clear queues, investigation panels, and payment controls.",
    storyNavigation: "Left-side priorities, central case view, and payout controls.",
    storyBestFor: "Banks, wallets, payout platforms, remittance tools.",
    storyPrimaryAction: "Pause transfers and review the exact SIM-risk reason before release.",
    storySteps: [
      "Open the transfer queue from the banking dashboard.",
      "Select a flagged payment and inspect the SIM, carrier, and device signals.",
      "Follow the backend action, such as block transfer or request stronger identity proof.",
      "Approve, hold, or escalate the case to payments-risk review."
    ],
    cards: [
      {
        title: "Queued transfer",
        meta: "INR 54,000 pending",
        body: "The analyst sees the transfer value, recent account behavior, and the reason the move was paused."
      },
      {
        title: "Risk evidence",
        meta: "11 reason codes",
        body: "The case card groups IMSI change, eSIM swap, country mismatch, and recent port-out pressure."
      },
      {
        title: "Case action",
        meta: "One-click hold",
        body: "Teams can freeze payout, notify the customer, and route the case to the payments-risk queue."
      }
    ],
    cta: "Open case review",
    nav: ["Queue", "Cases", "Wallets", "Reports"],
    activeNav: "Cases",
    statusLabel: "Ops review"
  },
  admin: {
    screenKicker: "Admin security",
    screenTitle: "Privileged access gate",
    screenSubtitle: "Operations and security teams see a high-signal dashboard before granting sensitive access.",
    screenState: "Challenge required",
    screenStateAction: "Require hardware MFA",
    storyTitle: "Admin and SOC dashboard",
    storyBody: "This version is designed for internal operators. It feels more like a SOC or admin portal, with stronger visual urgency and clearer access control states.",
    storyNavigation: "Section rail for incidents, access requests, devices, and policies.",
    storyBestFor: "Enterprise admin panels, security operations centers, internal tools.",
    storyPrimaryAction: "Challenge privileged users and approve only after stronger device posture checks.",
    storySteps: [
      "Open the access request from the incidents or privileged access queue.",
      "Review failed auth bursts, device integrity, and step-up requirements.",
      "Enforce phishing-resistant MFA or deny access until review is complete.",
      "Track the final outcome in the SOC-admin-risk review queue."
    ],
    cards: [
      {
        title: "Access request",
        meta: "Admin write scope",
        body: "The dashboard shows when a privileged action is requested from an untrusted or unknown device."
      },
      {
        title: "Identity challenge",
        meta: "Hardware MFA required",
        body: "The system makes the next step obvious instead of expecting the operator to guess what to do."
      },
      {
        title: "Incident routing",
        meta: "SOC queue active",
        body: "Critical actions are blocked and sent directly to the incident response workflow."
      }
    ],
    cta: "Review access policy",
    nav: ["Incidents", "Access", "Devices", "Policies"],
    activeNav: "Access",
    statusLabel: "Restricted"
  }
};

const walkthroughFlows = {
  login: {
    label: "Mobile login flow",
    mode: "mobile",
    steps: [
      {
        badge: "Login start",
        title: "Open the app and begin sign in",
        tone: "allow",
        stateLabel: "Allow path",
        copy: "The customer lands on a clean sign-in screen with trust signals already working in the background.",
        panels: [
          { meta: "Screen", title: "Welcome back", body: "The main action is simple: sign in or continue with a saved session." },
          { meta: "Signal", title: "Background device check", body: "The app silently collects IMSI, ICCID, carrier, and device-integrity signals." },
          { meta: "Navigation", title: "Home to Guard", body: "If the user wants details, they can open the Guard area for more context." }
        ],
        userTitle: "Normal sign-in entry",
        userCopy: "The user sees a familiar login flow without fraud jargon or confusing language.",
        systemTitle: "Collect telecom signals",
        systemCopy: "The frontend prepares a payload for `/assess` before session creation is finalized.",
        navigationTip: "Start at Home, then only show deeper security screens when risk is elevated."
      },
      {
        badge: "Risk evaluation",
        title: "Run the SIM and device trust check",
        tone: "allow",
        stateLabel: "Live check",
        copy: "The backend compares the current device state with the enrolled baseline and decides whether the session is safe.",
        panels: [
          { meta: "API call", title: "POST /assess", body: "The app sends event type `login` with current SIM and location signals." },
          { meta: "Decision", title: "Allow, challenge, hold, or block", body: "The response tells the app exactly which path to take next." },
          { meta: "Policy", title: "flow_policy.backend_action", body: "The UI uses the backend action to show the correct next screen." }
        ],
        userTitle: "Quick protected loading state",
        userCopy: "The user sees a brief security check, similar to a payment or identity verification moment.",
        systemTitle: "Map decision to UI",
        systemCopy: "If the result is allow, the app can create the full session. If not, it routes into challenge or hold UI.",
        navigationTip: "Keep this step short and automatic so the user feels protected, not interrupted."
      },
      {
        badge: "Approved session",
        title: "Take the user to the protected dashboard",
        tone: "allow",
        stateLabel: "Session approved",
        copy: "For a clean login, the user lands on the main account overview with a visible trust status and recent activity feed.",
        panels: [
          { meta: "Result", title: "Session created", body: "The user receives a normal session with recent activity visible." },
          { meta: "Confidence", title: "Trust badge", body: "A clear safe state reassures the user their device is recognized." },
          { meta: "Audit", title: "Security activity", body: "Background SIM checks can be shown in an activity or guard timeline." }
        ],
        userTitle: "Safe account dashboard",
        userCopy: "The user sees a stable overview and can continue with normal activity.",
        systemTitle: "Persist telemetry and session policy",
        systemCopy: "The backend logs the check and the UI keeps a short summary for audit visibility.",
        navigationTip: "From here, let the user move between Home, Guard, Activity, and Help."
      },
      {
        badge: "Review activity",
        title: "Let the user inspect what happened",
        tone: "allow",
        stateLabel: "Transparency",
        copy: "The app can optionally show the last SIM check, trust score, and a short explanation of why the session was approved.",
        panels: [
          { meta: "Timeline", title: "Latest security check", body: "Show when the check happened and which device was verified." },
          { meta: "Controls", title: "Recovery options", body: "Users can report a suspicious SIM change or lock the account if needed." },
          { meta: "Education", title: "Help center", body: "A short explanation teaches the user what eSIM swap protection does." }
        ],
        userTitle: "Understandable security visibility",
        userCopy: "The user can verify that the app is watching for SIM swap threats without needing backend knowledge.",
        systemTitle: "Build trust through transparency",
        systemCopy: "Use the dashboard and activity tab to explain actions already taken by the risk engine.",
        navigationTip: "This is a good place for a Help or Learn More link."
      }
    ]
  },
  wallet: {
    label: "Wallet transfer flow",
    mode: "banking",
    steps: [
      {
        badge: "Transfer start",
        title: "User begins a sensitive transfer",
        tone: "allow",
        stateLabel: "Transfer draft",
        copy: "The customer or operator enters amount, recipient, and transfer details from the wallet or payouts area.",
        panels: [
          { meta: "Customer action", title: "Submit transfer", body: "The user confirms amount and beneficiary details." },
          { meta: "Safety hook", title: "Pre-send assess call", body: "Before the money moves, the app sends a risk evaluation request." },
          { meta: "UI pattern", title: "Confirmation checkpoint", body: "The screen keeps the user in a review state until the backend replies." }
        ],
        userTitle: "Normal transfer entry",
        userCopy: "The flow looks like a normal payment confirmation screen until a risk signal is found.",
        systemTitle: "Protect the payout path",
        systemCopy: "The app calls `/assess` with `event_type: money_transfer` before the final transfer commit.",
        navigationTip: "Keep this under Payments or Wallets, then route risky requests into a case-review lane."
      },
      {
        badge: "Risk spike",
        title: "Detect the eSIM swap and freeze the action",
        tone: "block",
        stateLabel: "Critical block",
        copy: "The backend spots IMSI drift, carrier changes, recent eSIM download, and location mismatch, then blocks the transfer.",
        panels: [
          { meta: "Decision", title: "block_transfer_and_freeze_wallet", body: "The wallet page is replaced with a hold or block state immediately." },
          { meta: "Reason", title: "Critical telecom risk", body: "The UI can reference recent SIM change, eSIM profile swap, and device compromise." },
          { meta: "Queue", title: "payments-risk", body: "The case is routed for review and the customer is notified." }
        ],
        userTitle: "Blocked transfer screen",
        userCopy: "The customer sees that the transfer is paused for security review, not that the app is broken.",
        systemTitle: "Freeze money movement",
        systemCopy: "The backend action tells the app to stop transfer, payout, and beneficiary-change actions instantly.",
        navigationTip: "Replace the transfer form with a clear status screen and next-step guidance."
      },
      {
        badge: "User guidance",
        title: "Show the customer what happens next",
        tone: "hold",
        stateLabel: "Awaiting review",
        copy: "The UI explains the hold, prompts the customer to confirm identity, and points them to support or verification options.",
        panels: [
          { meta: "Message", title: "We paused this transfer", body: "The app explains that a recent telecom risk signal triggered the hold." },
          { meta: "Action", title: "Verify identity", body: "The user is offered stronger verification or support callback next steps." },
          { meta: "Visibility", title: "Safe account actions", body: "Balance view remains available while risky actions stay blocked." }
        ],
        userTitle: "Clear hold state",
        userCopy: "The customer understands which actions are still safe and which are temporarily unavailable.",
        systemTitle: "Enforce blocked action list",
        systemCopy: "The app uses `flow_policy.blocked_actions` to disable payout, transfer, and beneficiary-change controls.",
        navigationTip: "Put the next action in one clear button, such as Verify identity or Contact support."
      },
      {
        badge: "Analyst review",
        title: "Move the case into operations review",
        tone: "hold",
        stateLabel: "Manual review",
        copy: "Operations or fraud teams open the case and inspect all reason codes before deciding whether to release or keep the hold.",
        panels: [
          { meta: "Analyst view", title: "Case evidence", body: "Show the IMSI, ICCID, location, and device signals in one evidence panel." },
          { meta: "Decisioning", title: "Approve or continue freeze", body: "The analyst decides whether funds can move after identity confirmation." },
          { meta: "Audit", title: "Timeline", body: "Every action is tracked in the activity and case history timeline." }
        ],
        userTitle: "Back-office case handoff",
        userCopy: "The customer side remains calm while the analyst side gets full risk context.",
        systemTitle: "Route to payments-risk",
        systemCopy: "The review queue from `flow_policy.review_queue` tells the organization exactly where this case belongs.",
        navigationTip: "Link the customer-facing hold page to an internal analyst case ID."
      }
    ]
  },
  otp: {
    label: "OTP recovery flow",
    mode: "mobile",
    steps: [
      {
        badge: "Recovery entry",
        title: "User starts account recovery or OTP reset",
        tone: "allow",
        stateLabel: "Recovery start",
        copy: "The customer taps Forgot password or OTP reset and expects a normal recovery journey.",
        panels: [
          { meta: "Entry", title: "Recovery choice", body: "The user selects OTP reset, password reset, or device recovery." },
          { meta: "Signals", title: "Telecom context", body: "The app still collects current SIM and device state before letting recovery continue." },
          { meta: "Design", title: "Calm guidance", body: "Keep the screen simple so the user stays oriented." }
        ],
        userTitle: "A familiar recovery start",
        userCopy: "The recovery screen should not feel different until the risk engine decides it must intervene.",
        systemTitle: "Assess recovery like a sensitive action",
        systemCopy: "Treat account recovery as a high-risk event because it can be abused after SIM swap attempts.",
        navigationTip: "Place recovery under Help or Sign in, then route into guarded recovery states only when needed."
      },
      {
        badge: "Recovery risk",
        title: "Detect recent SIM change during recovery",
        tone: "hold",
        stateLabel: "Recovery hold",
        copy: "The engine spots recent eSIM activity or a SIM-type change and pauses recovery before OTP ownership can be abused.",
        panels: [
          { meta: "Decision", title: "hold_otp_reset", body: "The app pauses the reset flow and asks for a stronger identity route." },
          { meta: "Flags", title: "Recent eSIM download", body: "Risk reasons are available even if the user does not see every technical detail." },
          { meta: "Protection", title: "Stop takeover", body: "Password reset and MFA reset remain blocked until review." }
        ],
        userTitle: "Recovery paused for safety",
        userCopy: "The user is clearly told that recovery is paused to protect the account after a SIM-risk event.",
        systemTitle: "Block recovery completion",
        systemCopy: "Use the blocked-action list to disable password reset, OTP reset, and MFA reset completion.",
        navigationTip: "Do not loop the user. Move them to one clear alternate verification screen."
      },
      {
        badge: "Alternate identity path",
        title: "Offer safer recovery options",
        tone: "challenge",
        stateLabel: "Identity check",
        copy: "The app switches to a higher-trust path, like existing-device approval, support PIN, or face match.",
        panels: [
          { meta: "Option", title: "Existing trusted device", body: "Approve from another trusted device if one is available." },
          { meta: "Option", title: "Support-assisted check", body: "Ask for a support PIN or human verification route." },
          { meta: "Option", title: "Carrier validation", body: "Use external or carrier-backed evidence if your system supports it." }
        ],
        userTitle: "Safer verification choices",
        userCopy: "The user is guided to a path that proves identity without trusting the current SIM alone.",
        systemTitle: "Challenge before release",
        systemCopy: "The backend action and required checks help you choose the right recovery UI without inventing rules in the frontend.",
        navigationTip: "Keep only one or two strong options visible so the recovery path stays understandable."
      },
      {
        badge: "Resolved outcome",
        title: "Complete recovery only after verification",
        tone: "allow",
        stateLabel: "Recovery approved",
        copy: "After the stronger identity check passes, the app can safely allow the reset flow to continue.",
        panels: [
          { meta: "Resolution", title: "Manual or step-up approval", body: "Recovery is released after stronger evidence is accepted." },
          { meta: "Audit", title: "Activity log", body: "The customer and support team can see why recovery was delayed." },
          { meta: "Confidence", title: "Safer account state", body: "The user regains access without relying on a potentially hijacked SIM." }
        ],
        userTitle: "Protected recovery completion",
        userCopy: "The user finishes recovery with confidence that the account was not exposed during a risky telecom event.",
        systemTitle: "Record the resolution",
        systemCopy: "Log the recovery outcome and keep the activity history visible for support and audit trails.",
        navigationTip: "End the flow on a success screen with a clear prompt to review security settings."
      }
    ]
  },
  admin: {
    label: "Admin access flow",
    mode: "admin",
    steps: [
      {
        badge: "Access request",
        title: "Operator requests privileged access",
        tone: "allow",
        stateLabel: "Access request",
        copy: "An internal user opens the admin portal and tries to access a privileged screen or sensitive write action.",
        panels: [
          { meta: "Entry", title: "Privileged route", body: "The admin opens a page that requires stronger trust than a normal session." },
          { meta: "Telemetry", title: "Security posture", body: "The portal captures device posture, auth history, and current telecom context." },
          { meta: "Design", title: "SOC-style clarity", body: "The screen should feel operational, not consumer-facing." }
        ],
        userTitle: "Visible privileged boundary",
        userCopy: "The operator understands they are entering a more sensitive area with stronger requirements.",
        systemTitle: "Run `/assess` for admin access",
        systemCopy: "The backend treats admin access as a distinct flow with stricter challenge and block policies.",
        navigationTip: "Use an Access or Incidents section so privileged requests feel separate from normal tools."
      },
      {
        badge: "Security challenge",
        title: "Trigger phishing-resistant MFA",
        tone: "challenge",
        stateLabel: "Strong MFA",
        copy: "If auth failures spike or device integrity is unknown, the app demands stronger phishing-resistant MFA before access continues.",
        panels: [
          { meta: "Backend action", title: "require_phishing_resistant_mfa", body: "The portal routes directly into hardware-backed MFA or equivalent controls." },
          { meta: "Signal", title: "Unknown device posture", body: "The system does not trust admin claims from an unknown device without proof." },
          { meta: "UX", title: "Clear next step", body: "Operators know exactly which action is needed to continue." }
        ],
        userTitle: "Challenge screen for internal users",
        userCopy: "Even internal users get a clear, guided path instead of a vague access denied message.",
        systemTitle: "Enforce hardware-backed identity",
        systemCopy: "The required-checks list tells the frontend which security gates must be completed.",
        navigationTip: "Use one high-visibility challenge card rather than scattering security prompts across the page."
      },
      {
        badge: "Posture review",
        title: "Review device and access evidence",
        tone: "challenge",
        stateLabel: "Evidence review",
        copy: "The screen can show why the challenge happened, including auth spikes, device posture, and requested scope.",
        panels: [
          { meta: "Evidence", title: "Reason codes", body: "Expose operator-safe reasons for the challenge without overwhelming the screen." },
          { meta: "Scope", title: "Requested permissions", body: "Show whether the user wants read-only access or privileged writes." },
          { meta: "Ops", title: "Escalation lane", body: "Security teams can inspect the same context in their own review queue." }
        ],
        userTitle: "Explain the challenge",
        userCopy: "Internal operators are more likely to comply when the app explains why stronger proof is required.",
        systemTitle: "Tie UX to review queue",
        systemCopy: "Use `soc-admin-risk` or your internal queue name to connect the UI to the review workflow.",
        navigationTip: "Good internal UX reduces panic and speeds up security compliance."
      },
      {
        badge: "Final outcome",
        title: "Grant limited access or block and escalate",
        tone: "block",
        stateLabel: "Controlled access",
        copy: "The flow ends by either granting tightly scoped access after challenge success or blocking the request and paging security.",
        panels: [
          { meta: "Success path", title: "Limited admin access", body: "If verification passes, you can issue a constrained session or read-only mode." },
          { meta: "Failure path", title: "Block and alert SOC", body: "Critical risk should block access and trigger incident response." },
          { meta: "Audit", title: "Trace everything", body: "Every admin access outcome should be visible in your audit and security timelines." }
        ],
        userTitle: "Clear final state",
        userCopy: "The operator either knows access was granted with limits or sees a direct escalation message.",
        systemTitle: "Enforce least privilege",
        systemCopy: "Even success can be scoped. The UI does not need to treat access as all or nothing.",
        navigationTip: "End on an explicit outcome screen instead of silently redirecting the operator."
      }
    ]
  }
};

const elements = {
  flowGrid: document.getElementById("flow-grid"),
  statEvents: document.getElementById("stat-events"),
  statMedium: document.getElementById("stat-medium"),
  statHigh: document.getElementById("stat-high"),
  statCritical: document.getElementById("stat-critical"),
  simStatus: document.getElementById("sim-status"),
  resultTitle: document.getElementById("result-title"),
  decisionChip: document.getElementById("decision-chip"),
  resultRisk: document.getElementById("result-risk"),
  resultSeverity: document.getElementById("result-severity"),
  resultAction: document.getElementById("result-action"),
  riskMeterBar: document.getElementById("risk-meter-bar"),
  requiredChecks: document.getElementById("required-checks"),
  blockedActions: document.getElementById("blocked-actions"),
  flagList: document.getElementById("flag-list"),
  resultConsole: document.getElementById("result-console"),
  heroDecision: document.getElementById("hero-decision"),
  heroQueue: document.getElementById("hero-queue"),
  phoneFrame: document.getElementById("phone-frame"),
  screenKicker: document.getElementById("screen-kicker"),
  screenTitle: document.getElementById("screen-title"),
  screenSubtitle: document.getElementById("screen-subtitle"),
  screenState: document.getElementById("screen-state"),
  screenStateAction: document.getElementById("screen-state-action"),
  screenCards: document.getElementById("screen-cards"),
  screenCta: document.getElementById("screen-cta"),
  screenNav: document.getElementById("screen-nav"),
  screenStatus: document.getElementById("screen-status"),
  storyTitle: document.getElementById("story-title"),
  storyBody: document.getElementById("story-body"),
  storyNavigation: document.getElementById("story-navigation"),
  storyBestFor: document.getElementById("story-best-for"),
  storyPrimaryAction: document.getElementById("story-primary-action"),
  storySteps: document.getElementById("story-steps"),
  walkthroughPill: document.getElementById("walkthrough-pill"),
  walkthroughFlowName: document.getElementById("walkthrough-flow-name"),
  walkthroughScreenBadge: document.getElementById("walkthrough-screen-badge"),
  walkthroughScreenTitle: document.getElementById("walkthrough-screen-title"),
  walkthroughStateChip: document.getElementById("walkthrough-state-chip"),
  walkthroughScreenCopy: document.getElementById("walkthrough-screen-copy"),
  walkthroughScreenPanels: document.getElementById("walkthrough-screen-panels"),
  walkthroughUserTitle: document.getElementById("walkthrough-user-title"),
  walkthroughUserCopy: document.getElementById("walkthrough-user-copy"),
  walkthroughSystemTitle: document.getElementById("walkthrough-system-title"),
  walkthroughSystemCopy: document.getElementById("walkthrough-system-copy"),
  walkthroughNavigationTip: document.getElementById("walkthrough-navigation-tip"),
  walkthroughProgress: document.getElementById("walkthrough-progress"),
  walkthroughPrev: document.getElementById("walkthrough-prev"),
  walkthroughNext: document.getElementById("walkthrough-next"),
  simulatorSection: document.getElementById("simulator")
};

let currentWalkthroughFlow = "login";
let currentWalkthroughStep = 0;

async function getJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return response.json();
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

function animateNumber(node, target) {
  const current = Number(node.textContent) || 0;
  const steps = 18;
  let frame = 0;
  const delta = (target - current) / steps;

  const tick = () => {
    frame += 1;
    if (frame >= steps) {
      node.textContent = String(target);
      return;
    }
    node.textContent = String(Math.round(current + delta * frame));
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

async function loadStats() {
  const stats = await getJson("/stats");
  animateNumber(elements.statEvents, stats.events || 0);
  animateNumber(elements.statMedium, stats.medium_risk || 0);
  animateNumber(elements.statHigh, stats.high_risk || 0);
  animateNumber(elements.statCritical, stats.critical_risk || 0);
}

function describeFlowDecision(template) {
  const challenge = template.decisions.challenge;
  const block = template.decisions.block;
  return `
    <article class="flow-card">
      <p class="eyebrow">${template.review_queue}</p>
      <h4>${template.display_name}</h4>
      <p>${challenge.user_message}</p>
      <div class="flow-chip-row">
        <span class="flow-chip">${challenge.backend_action}</span>
        <span class="flow-chip">${block.backend_action}</span>
      </div>
    </article>
  `;
}

async function loadFlowCards() {
  const response = await getJson("/integrations/flow-policies");
  elements.flowGrid.innerHTML = Object.values(response.items)
    .map((template) => describeFlowDecision(template))
    .join("");
}

function updateDecisionChip(decision) {
  elements.decisionChip.textContent = decision.toUpperCase();
  elements.decisionChip.className = `decision-chip ${decision}`;
}

function setSimulatorStatus(text, tone) {
  elements.simStatus.textContent = text;
  elements.simStatus.className = `pill ${tone}`;
}

function focusSimulatorPanel() {
  if (!elements.simulatorSection) {
    return;
  }

  elements.simulatorSection.classList.remove("demo-focus");
  elements.simulatorSection.scrollIntoView({ behavior: "smooth", block: "start" });

  requestAnimationFrame(() => {
    elements.simulatorSection.classList.add("demo-focus");
    window.setTimeout(() => {
      elements.simulatorSection.classList.remove("demo-focus");
    }, 1200);
  });
}

function renderExperienceMode(modeName) {
  const mode = experienceModes[modeName];
  if (!mode) {
    return;
  }

  document.querySelectorAll(".mode-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === modeName);
  });

  elements.phoneFrame.className = `phone-frame mode-${modeName}`;
  elements.screenKicker.textContent = mode.screenKicker;
  elements.screenTitle.textContent = mode.screenTitle;
  elements.screenSubtitle.textContent = mode.screenSubtitle;
  elements.screenState.textContent = mode.screenState;
  elements.screenStateAction.textContent = mode.screenStateAction;
  elements.screenStatus.textContent = mode.statusLabel;
  elements.storyTitle.textContent = mode.storyTitle;
  elements.storyBody.textContent = mode.storyBody;
  elements.storyNavigation.textContent = mode.storyNavigation;
  elements.storyBestFor.textContent = mode.storyBestFor;
  elements.storyPrimaryAction.textContent = mode.storyPrimaryAction;
  elements.screenCta.textContent = mode.cta;

  elements.screenCards.innerHTML = mode.cards
    .map((card) => `
      <article class="screen-card">
        <span>${card.meta}</span>
        <strong>${card.title}</strong>
        <p>${card.body}</p>
      </article>
    `)
    .join("");

  elements.screenNav.innerHTML = mode.nav
    .map((item) => `
      <div class="screen-nav-item ${item === mode.activeNav ? "active" : ""}">
        ${item}
      </div>
    `)
    .join("");

  elements.storySteps.innerHTML = mode.storySteps
    .map((step) => `<li>${step}</li>`)
    .join("");
}

function renderWalkthroughFlow(flowName, stepIndex = 0) {
  const flow = walkthroughFlows[flowName];
  if (!flow) {
    return;
  }

  currentWalkthroughFlow = flowName;
  currentWalkthroughStep = Math.max(0, Math.min(stepIndex, flow.steps.length - 1));

  document.querySelectorAll(".journey-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.flow === flowName);
  });

  renderExperienceMode(flow.mode);

  const step = flow.steps[currentWalkthroughStep];
  elements.walkthroughPill.textContent = `Step ${currentWalkthroughStep + 1} of ${flow.steps.length}`;
  elements.walkthroughFlowName.textContent = flow.label;
  elements.walkthroughScreenBadge.textContent = step.badge;
  elements.walkthroughScreenTitle.textContent = step.title;
  elements.walkthroughStateChip.textContent = step.stateLabel;
  elements.walkthroughStateChip.className = `walkthrough-state-chip ${step.tone}`;
  elements.walkthroughScreenCopy.textContent = step.copy;
  elements.walkthroughUserTitle.textContent = step.userTitle;
  elements.walkthroughUserCopy.textContent = step.userCopy;
  elements.walkthroughSystemTitle.textContent = step.systemTitle;
  elements.walkthroughSystemCopy.textContent = step.systemCopy;
  elements.walkthroughNavigationTip.textContent = step.navigationTip;

  elements.walkthroughScreenPanels.innerHTML = step.panels
    .map((panel) => `
      <article class="walkthrough-mini-card">
        <span>${panel.meta}</span>
        <strong>${panel.title}</strong>
        <p>${panel.body}</p>
      </article>
    `)
    .join("");

  elements.walkthroughProgress.innerHTML = flow.steps
    .map((flowStep, index) => `
      <button
        class="walkthrough-progress-button ${index === currentWalkthroughStep ? "active" : ""}"
        type="button"
        data-step="${index}"
        title="${flowStep.title}"
      >
        ${String(index + 1).padStart(2, "0")}
      </button>
    `)
    .join("");

  elements.walkthroughPrev.disabled = currentWalkthroughStep === 0;
  elements.walkthroughNext.textContent = currentWalkthroughStep === flow.steps.length - 1 ? "Restart" : "Next Step";
}

async function runScenario(name) {
  const scenario = scenarios[name];
  if (!scenario) {
    return;
  }

  document.querySelectorAll(".scenario-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.scenario === name);
  });

  renderWalkthroughFlow(name, 0);

  setSimulatorStatus("Running", "warm");
  elements.resultTitle.textContent = scenario.label;
  elements.resultRisk.textContent = "...";
  elements.resultSeverity.textContent = "running";
  elements.resultAction.textContent = "loading_demo";
  elements.riskMeterBar.style.width = "4%";
  elements.decisionChip.textContent = "RUN";
  elements.decisionChip.className = "decision-chip";
  elements.resultConsole.textContent = "Running simulation...";

  try {
    if (scenario.baseline) {
      await getJson("/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenario.baseline)
      });
    }

    const result = await getJson("/assess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scenario.payload)
    });

    updateDecisionChip(result.decision);
    elements.resultRisk.textContent = String(result.risk);
    elements.resultSeverity.textContent = result.severity;
    elements.resultAction.textContent = result.flow_policy.backend_action;
    elements.riskMeterBar.style.width = `${Math.max(6, result.risk)}%`;
    elements.heroDecision.textContent = result.decision.toUpperCase();
    elements.heroQueue.textContent = result.flow_policy.review_queue;

    renderList(elements.requiredChecks, result.flow_policy.required_checks, "No extra checks");
    renderList(elements.blockedActions, result.flow_policy.blocked_actions, "No blocked actions");
    renderList(elements.flagList, result.flags, "No active flags");
    elements.resultConsole.textContent = JSON.stringify(result, null, 2);

    setSimulatorStatus("Live", "danger");
    await loadStats();
  } catch (error) {
    updateDecisionChip("block");
    elements.resultSeverity.textContent = "error";
    elements.resultAction.textContent = "preview_failed";
    renderList(elements.requiredChecks, ["Inspect server logs"], "Inspect server logs");
    renderList(elements.blockedActions, ["Simulation unavailable"], "Simulation unavailable");
    renderList(elements.flagList, ["PREVIEW_ERROR"], "PREVIEW_ERROR");
    elements.resultConsole.textContent = String(error);
    setSimulatorStatus("Error", "danger");
  }
}

async function boot() {
  await Promise.all([loadStats(), loadFlowCards()]);
  renderWalkthroughFlow("login", 0);

  const runPrimaryScenario = document.getElementById("run-primary-scenario");
  if (runPrimaryScenario) {
    runPrimaryScenario.addEventListener("click", () => {
      focusSimulatorPanel();
      runScenario("wallet");
    });
  }
  document.querySelectorAll(".scenario-button").forEach((button) => {
    button.addEventListener("click", () => runScenario(button.dataset.scenario));
  });
  document.querySelectorAll(".mode-button").forEach((button) => {
    button.addEventListener("click", () => renderExperienceMode(button.dataset.mode));
  });
  document.querySelectorAll(".journey-button").forEach((button) => {
    button.addEventListener("click", () => renderWalkthroughFlow(button.dataset.flow, 0));
  });

  elements.walkthroughPrev.addEventListener("click", () => {
    renderWalkthroughFlow(currentWalkthroughFlow, currentWalkthroughStep - 1);
  });

  elements.walkthroughNext.addEventListener("click", () => {
    const totalSteps = walkthroughFlows[currentWalkthroughFlow].steps.length;
    if (currentWalkthroughStep >= totalSteps - 1) {
      renderWalkthroughFlow(currentWalkthroughFlow, 0);
      return;
    }
    renderWalkthroughFlow(currentWalkthroughFlow, currentWalkthroughStep + 1);
  });

  elements.walkthroughProgress.addEventListener("click", (event) => {
    const target = event.target.closest(".walkthrough-progress-button");
    if (!target) {
      return;
    }
    renderWalkthroughFlow(currentWalkthroughFlow, Number(target.dataset.step));
  });

  runScenario("wallet");
}

boot().catch((error) => {
  elements.resultConsole.textContent = String(error);
  setSimulatorStatus("Error", "danger");
});
