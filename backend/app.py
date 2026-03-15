from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import csv
import json
import os

from dotenv import load_dotenv
from fastapi import Body, FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
LOG_DIR = Path(os.getenv("LOG_DIR", "backend/logs"))
LOG_DIR.mkdir(parents=True, exist_ok=True)
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)
PREVIEW_HTML = STATIC_DIR / "preview.html"
DEMO_HTML = STATIC_DIR / "demo.html"
LOGIN_HTML = STATIC_DIR / "login.html"

CSV_PATH = LOG_DIR / os.getenv("CSV_FILENAME", "backend_events.csv")
BASELINE_JSONL = LOG_DIR / "baselines.jsonl"
ALERTS_JSONL = LOG_DIR / "alerts.jsonl"

for file_path in [CSV_PATH, BASELINE_JSONL, ALERTS_JSONL]:
    if not file_path.exists():
        file_path.touch()

app = FastAPI(title="SIMSentinel API", version="0.8.0-flow-playbooks")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

BASELINE_FIELDS = [
    "device_id",
    "user_id",
    "tenant_id",
    "phone_number",
    "imsi",
    "iccid",
    "carrier",
    "sim_type",
    "esim_profile_id",
    "trusted_geo_country",
]

FLOW_ALIASES = {
    "login": "login",
    "signin": "login",
    "money_transfer": "wallet_transfer",
    "wallet_transfer": "wallet_transfer",
    "wallet_withdrawal": "wallet_transfer",
    "beneficiary_change": "wallet_transfer",
    "payout": "wallet_transfer",
    "password_reset": "otp_reset",
    "otp_reset": "otp_reset",
    "admin_access": "admin_access",
}

SENSITIVE_EVENTS = set(FLOW_ALIASES.keys())

FLOW_POLICY_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "generic": {
        "display_name": "Generic protected flow",
        "review_queue": "security-triage",
        "decisions": {
            "allow": {
                "backend_action": "allow_request",
                "user_message": "Request approved.",
                "required_checks": [],
                "allowed_actions": ["continue_request"],
                "blocked_actions": [],
            },
            "challenge": {
                "backend_action": "require_step_up_check",
                "user_message": "Extra verification is required before this action can continue.",
                "required_checks": ["mfa", "recent_device_check"],
                "allowed_actions": ["continue_after_step_up"],
                "blocked_actions": [],
            },
            "hold": {
                "backend_action": "pause_request_for_review",
                "user_message": "This action has been paused for additional review.",
                "required_checks": ["manual_review", "customer_callback"],
                "allowed_actions": [],
                "blocked_actions": ["sensitive_request"],
            },
            "block": {
                "backend_action": "block_request",
                "user_message": "This action has been blocked until a security review is completed.",
                "required_checks": ["manual_review"],
                "allowed_actions": [],
                "blocked_actions": ["sensitive_request", "account_recovery"],
            },
        },
    },
    "login": {
        "display_name": "Login protection",
        "review_queue": "identity-risk",
        "decisions": {
            "allow": {
                "backend_action": "allow_login",
                "user_message": "Login approved.",
                "required_checks": [],
                "allowed_actions": ["issue_full_session"],
                "blocked_actions": [],
            },
            "challenge": {
                "backend_action": "require_login_mfa",
                "user_message": "Please complete MFA before we continue the login.",
                "required_checks": ["app_mfa", "carrier_otp"],
                "allowed_actions": ["issue_short_session_after_step_up"],
                "blocked_actions": [],
            },
            "hold": {
                "backend_action": "temporary_login_hold",
                "user_message": "Login was paused because of a recent SIM or eSIM risk signal.",
                "required_checks": ["manual_review", "carrier_callback"],
                "allowed_actions": [],
                "blocked_actions": ["login", "password_reset"],
            },
            "block": {
                "backend_action": "deny_login_and_lock_recovery",
                "user_message": "Login is blocked until the security team verifies this device and SIM change.",
                "required_checks": ["manual_review"],
                "allowed_actions": [],
                "blocked_actions": ["login", "password_reset", "device_change"],
            },
        },
    },
    "wallet_transfer": {
        "display_name": "Wallet transfer protection",
        "review_queue": "payments-risk",
        "decisions": {
            "allow": {
                "backend_action": "allow_transfer",
                "user_message": "Transfer approved.",
                "required_checks": [],
                "allowed_actions": ["wallet_transfer", "beneficiary_change"],
                "blocked_actions": [],
            },
            "challenge": {
                "backend_action": "step_up_transfer",
                "user_message": "Verify this transfer with stronger checks before it can continue.",
                "required_checks": ["transaction_pin", "device_binding_check", "carrier_otp"],
                "allowed_actions": ["approve_low_value_after_step_up"],
                "blocked_actions": ["instant_payout"],
            },
            "hold": {
                "backend_action": "hold_transfer_and_freeze_beneficiary",
                "user_message": "Transfers are paused while we review the recent SIM or eSIM change.",
                "required_checks": ["manual_review", "customer_callback"],
                "allowed_actions": ["balance_view"],
                "blocked_actions": ["wallet_transfer", "wallet_withdrawal", "beneficiary_change", "payout"],
            },
            "block": {
                "backend_action": "block_transfer_and_freeze_wallet",
                "user_message": "Transfers are blocked until the customer passes a manual verification review.",
                "required_checks": ["manual_review", "fraud_team_approval"],
                "allowed_actions": ["balance_view"],
                "blocked_actions": ["wallet_transfer", "wallet_withdrawal", "beneficiary_change", "payout", "otp_reset"],
            },
        },
    },
    "otp_reset": {
        "display_name": "OTP reset protection",
        "review_queue": "account-recovery",
        "decisions": {
            "allow": {
                "backend_action": "allow_otp_reset",
                "user_message": "Recovery can continue.",
                "required_checks": [],
                "allowed_actions": ["otp_reset", "password_reset"],
                "blocked_actions": [],
            },
            "challenge": {
                "backend_action": "require_identity_recovery_checks",
                "user_message": "Please confirm your identity before we reset OTP or recovery settings.",
                "required_checks": ["existing_device_approval", "support_pin_or_face_match"],
                "allowed_actions": ["otp_reset_after_step_up"],
                "blocked_actions": ["mfa_reset_completion"],
            },
            "hold": {
                "backend_action": "hold_otp_reset",
                "user_message": "Recovery is paused until we verify the SIM or eSIM change.",
                "required_checks": ["manual_review", "carrier_validation"],
                "allowed_actions": [],
                "blocked_actions": ["otp_reset", "password_reset", "mfa_reset"],
            },
            "block": {
                "backend_action": "block_otp_reset_and_lock_recovery",
                "user_message": "Recovery is blocked until a human review confirms the account owner.",
                "required_checks": ["manual_review", "fraud_team_approval"],
                "allowed_actions": [],
                "blocked_actions": ["otp_reset", "password_reset", "mfa_reset", "device_change"],
            },
        },
    },
    "admin_access": {
        "display_name": "Admin access protection",
        "review_queue": "soc-admin-risk",
        "decisions": {
            "allow": {
                "backend_action": "allow_admin_access",
                "user_message": "Admin access approved.",
                "required_checks": [],
                "allowed_actions": ["admin_access", "privileged_write_actions"],
                "blocked_actions": [],
            },
            "challenge": {
                "backend_action": "require_phishing_resistant_mfa",
                "user_message": "Complete phishing-resistant MFA before admin access is granted.",
                "required_checks": ["phishing_resistant_mfa", "device_posture_check"],
                "allowed_actions": ["read_only_admin_after_step_up"],
                "blocked_actions": ["privileged_write_actions"],
            },
            "hold": {
                "backend_action": "deny_privileged_actions_pending_review",
                "user_message": "Admin access is paused while the security team reviews this session.",
                "required_checks": ["manual_review", "security_team_approval"],
                "allowed_actions": [],
                "blocked_actions": ["admin_access", "role_change", "key_rotation"],
            },
            "block": {
                "backend_action": "block_admin_access_and_page_soc",
                "user_message": "Admin access is blocked and the security team has been alerted.",
                "required_checks": ["incident_response"],
                "allowed_actions": [],
                "blocked_actions": ["admin_access", "role_change", "key_rotation", "secrets_access"],
            },
        },
    },
}


def now_utc_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def clean_text(value: Any) -> Optional[str]:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def normalized_text(value: Any) -> Optional[str]:
    text = clean_text(value)
    return text.lower() if text else None


def resolve_flow_type(data: Dict[str, Any]) -> str:
    event_type = normalized_text(data.get("event_type"))
    if event_type in FLOW_ALIASES:
        return FLOW_ALIASES[event_type]
    if to_bool(data.get("otp_reset_requested")):
        return "otp_reset"
    return "generic"


def to_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "y", "on"}
    if isinstance(value, (int, float)):
        return value != 0
    return False


def to_int(value: Any) -> Optional[int]:
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def read_jsonl(path: Path) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            rows.append(json.loads(line))
    return rows


def build_baseline_record(data: Dict[str, Any]) -> Dict[str, Any]:
    record: Dict[str, Any] = {}
    for field_name in BASELINE_FIELDS:
        cleaned_value = clean_text(data.get(field_name))
        if cleaned_value is not None:
            record[field_name] = cleaned_value
    return record


def upsert_baseline(rec: Dict[str, Any]) -> None:
    device_id = rec["device_id"]
    rows = read_jsonl(BASELINE_JSONL)
    found = False

    for row in rows:
        if row.get("device_id") != device_id:
            continue
        for key, value in rec.items():
            if key == "device_id":
                continue
            if value is not None:
                row[key] = value
        row["updated_at"] = now_utc_iso()
        found = True
        break

    if not found:
        new_row = dict(rec)
        new_row["created_at"] = now_utc_iso()
        rows.append(new_row)

    with BASELINE_JSONL.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row) + "\n")


def fetch_baseline(device_id: str) -> Optional[Dict[str, Any]]:
    for row in read_jsonl(BASELINE_JSONL):
        if row.get("device_id") == device_id:
            return row
    return None


def score_risk(current: Dict[str, Any], baseline: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    risk = 0
    flags: List[str] = []
    recommendations: List[str] = []

    def add(points: int, flag: str, recommendation: str) -> None:
        nonlocal risk
        risk += points
        if flag not in flags:
            flags.append(flag)
        if recommendation and recommendation not in recommendations:
            recommendations.append(recommendation)

    if not baseline:
        add(15, "NO_BASELINE", "Enroll a trusted baseline before relying on SIM-backed trust.")

    comparisons = [
        ("imsi", 40, "IMSI_CHANGE", "Treat IMSI changes as high-risk identity changes."),
        ("iccid", 35, "ICCID_CHANGE", "Treat ICCID changes as likely SIM replacement events."),
        ("carrier", 20, "CARRIER_CHANGE", "Re-verify the carrier before approving sensitive actions."),
        ("sim_type", 20, "SIM_TYPE_CHANGE", "Confirm when the device switches between physical SIM and eSIM."),
        (
            "esim_profile_id",
            30,
            "ESIM_PROFILE_CHANGE",
            "Inspect the eSIM profile swap before trusting the session.",
        ),
    ]

    if baseline:
        for field_name, points, flag, recommendation in comparisons:
            current_value = normalized_text(current.get(field_name))
            baseline_value = normalized_text(baseline.get(field_name))
            if current_value and baseline_value and current_value != baseline_value:
                add(points, flag, recommendation)

    if to_bool(current.get("recent_esim_download")):
        add(25, "RECENT_ESIM_DOWNLOAD", "Apply extra verification after a recent eSIM download.")

    if to_bool(current.get("port_out_request")):
        add(30, "PORT_OUT_REQUEST", "Escalate sessions that follow a port-out request.")

    if to_bool(current.get("otp_reset_requested")):
        add(15, "OTP_RESET_REQUESTED", "Review OTP reset attempts that occur near SIM changes.")

    failed_auth_count = to_int(current.get("failed_auth_count_24h")) or 0
    if failed_auth_count >= 10:
        add(20, "AUTH_FAILURE_BURST", "Slow down or challenge repeated failed authentication attempts.")
    elif failed_auth_count >= 5:
        add(10, "AUTH_FAILURE_SPIKE", "Add a step-up challenge when authentication failures spike.")

    device_integrity = normalized_text(current.get("device_integrity"))
    if device_integrity == "compromised":
        add(25, "DEVICE_INTEGRITY_FAILED", "Do not trust SIM evidence from a compromised device.")
    elif device_integrity == "unknown":
        add(10, "DEVICE_INTEGRITY_UNKNOWN", "Ask the client app for a stronger device attestation signal.")

    ip_country = normalized_text(current.get("ip_country"))
    geo_country = normalized_text(
        current.get("geo_country") or current.get("trusted_geo_country") or (baseline or {}).get("trusted_geo_country")
    )
    if ip_country and geo_country and ip_country != geo_country:
        add(15, "COUNTRY_MISMATCH", "Challenge sessions whose network location differs from the trusted region.")

    hours_since_sim_change = to_int(current.get("hours_since_sim_change"))
    if hours_since_sim_change is not None:
        if hours_since_sim_change <= 24:
            add(25, "SIM_CHANGE_WITHIN_24H", "Freeze sensitive actions for 24 hours after a SIM change.")
        elif hours_since_sim_change <= 72:
            add(10, "SIM_CHANGE_WITHIN_72H", "Keep higher scrutiny for the first 72 hours after a SIM change.")

    event_type = normalized_text(current.get("event_type"))
    if event_type in SENSITIVE_EVENTS and risk >= 20:
        add(10, "SENSITIVE_FLOW", "Protect sensitive account flows with stronger verification.")

    risk = min(risk, 99)

    if risk < 20:
        severity = "low"
        action = "monitor"
        decision = "allow"
    elif risk < 50:
        severity = "medium"
        action = "soft_challenge"
        decision = "challenge"
    elif risk < 80:
        severity = "high"
        action = "require_step_up"
        decision = "hold"
    else:
        severity = "critical"
        action = "require_step_up"
        decision = "block"

    integration = {
        "decision": decision,
        "allow_now": decision == "allow",
        "allow_after_step_up": severity in {"medium", "high"},
        "block_sensitive_actions": severity in {"high", "critical"},
        "notify_user": severity in {"medium", "high", "critical"},
        "notify_security_team": severity in {"high", "critical"},
        "case_priority": severity if severity != "low" else "none",
        "session_max_age_minutes": {
            "low": 1440,
            "medium": 30,
            "high": 10,
            "critical": 0,
        }[severity],
        "reason_codes": flags,
    }

    if severity == "medium":
        recommendations.append("Require MFA, OTP confirmation, or a carrier-backed verification step.")
    if severity == "high":
        recommendations.extend(
            [
                "Pause password resets, payouts, and beneficiary changes until the user passes step-up verification.",
                "Open a security investigation ticket for analyst review.",
            ]
        )
    if severity == "critical":
        recommendations.extend(
            [
                "Block the transaction or recovery flow until a human review is completed.",
                "Send an out-of-band notification to the customer and the security team.",
            ]
        )

    deduped_recommendations: List[str] = []
    for item in recommendations:
        if item not in deduped_recommendations:
            deduped_recommendations.append(item)

    return {
        "risk": risk,
        "severity": severity,
        "flags": flags,
        "action": action,
        "decision": decision,
        "recommended_controls": deduped_recommendations,
        "integration": integration,
    }


def build_flow_policy(data: Dict[str, Any], result: Dict[str, Any]) -> Dict[str, Any]:
    flow_type = resolve_flow_type(data)
    template = FLOW_POLICY_TEMPLATES.get(flow_type, FLOW_POLICY_TEMPLATES["generic"])
    decision_template = template["decisions"][result["decision"]]

    return {
        "flow_type": flow_type,
        "display_name": template["display_name"],
        "decision": result["decision"],
        "backend_action": decision_template["backend_action"],
        "user_message": decision_template["user_message"],
        "required_checks": list(decision_template["required_checks"]),
        "allowed_actions": list(decision_template["allowed_actions"]),
        "blocked_actions": list(decision_template["blocked_actions"]),
        "review_queue": template["review_queue"],
        "case_tags": [flow_type, result["severity"], *result["flags"]],
    }


def append_csv(row: Dict[str, Any]) -> None:
    write_header = not CSV_PATH.stat().st_size
    with CSV_PATH.open("a", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "time",
                "device_id",
                "imsi",
                "iccid",
                "carrier",
                "baseline_imsi",
                "baseline_iccid",
                "baseline_carrier",
                "risk",
                "action",
                "flags",
            ],
        )
        if write_header:
            writer.writeheader()
        writer.writerow(row)


def append_alert(alert: Dict[str, Any]) -> None:
    with ALERTS_JSONL.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(alert) + "\n")


def build_assessment(data: Dict[str, Any], source: str) -> Dict[str, Any]:
    device_id = clean_text(data.get("device_id"))
    if not device_id:
        raise HTTPException(status_code=400, detail="device_id is required")

    sanitized = dict(data)
    sanitized["device_id"] = device_id
    baseline = fetch_baseline(device_id)
    result = score_risk(sanitized, baseline)
    flow_policy = build_flow_policy(sanitized, result)
    evaluated_at = now_utc_iso()

    csv_row = {
        "time": evaluated_at,
        "device_id": device_id,
        "imsi": clean_text(sanitized.get("imsi")),
        "iccid": clean_text(sanitized.get("iccid")),
        "carrier": clean_text(sanitized.get("carrier")),
        "baseline_imsi": baseline.get("imsi") if baseline else None,
        "baseline_iccid": baseline.get("iccid") if baseline else None,
        "baseline_carrier": baseline.get("carrier") if baseline else None,
        "risk": result["risk"],
        "action": result["action"],
        "flags": ",".join(result["flags"]),
    }
    append_csv(csv_row)

    assessment = {
        "evaluated_at": evaluated_at,
        "source": source,
        "device_id": device_id,
        "baseline_found": baseline is not None,
        "risk": result["risk"],
        "severity": result["severity"],
        "flags": result["flags"],
        "action": result["action"],
        "decision": result["decision"],
        "recommended_controls": result["recommended_controls"],
        "integration": result["integration"],
        "flow_policy": flow_policy,
    }

    if clean_text(sanitized.get("user_id")):
        assessment["user_id"] = clean_text(sanitized.get("user_id"))
    if clean_text(sanitized.get("event_type")):
        assessment["event_type"] = clean_text(sanitized.get("event_type"))
    if clean_text(sanitized.get("phone_number")):
        assessment["phone_number"] = clean_text(sanitized.get("phone_number"))

    if result["severity"] in {"high", "critical"}:
        append_alert(
            {
                "time": evaluated_at,
                "source": source,
                "device_id": device_id,
                "risk": result["risk"],
                "severity": result["severity"],
                "action": result["action"],
                "decision": result["decision"],
                "flags": result["flags"],
                "user_id": clean_text(sanitized.get("user_id")),
                "event_type": clean_text(sanitized.get("event_type")),
                "flow_type": flow_policy["flow_type"],
                "flow_backend_action": flow_policy["backend_action"],
            }
        )

    return assessment


@app.get("/")
def root() -> Dict[str, Any]:
    return {
        "service": "SIMSentinel",
        "description": "Embeddable eSIM swap and telecom threat detection service.",
        "version": app.version,
    }


@app.get("/preview", include_in_schema=False)
def preview() -> FileResponse:
    return FileResponse(PREVIEW_HTML)


@app.get("/demo", include_in_schema=False)
def demo() -> FileResponse:
    return FileResponse(DEMO_HTML)


@app.get("/login", include_in_schema=False)
def login_page() -> FileResponse:
    return FileResponse(LOGIN_HTML)


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"status": "ok", "time": now_utc_iso(), "version": app.version}


@app.post("/enroll")
def enroll(data: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    device_id = clean_text(data.get("device_id"))
    if not device_id:
        raise HTTPException(status_code=400, detail="device_id is required")

    record = build_baseline_record(data)
    record["device_id"] = device_id
    upsert_baseline(record)

    return {
        "status": "enrolled",
        "device_id": device_id,
        "baseline_fields": sorted(record.keys()),
        "message": "Trusted SIM or eSIM baseline stored successfully.",
    }


@app.post("/telemetry")
def telemetry(data: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    return build_assessment(data, source="telemetry")


@app.post("/assess")
def assess(data: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    return build_assessment(data, source="assess")


@app.get("/alerts")
def alerts(limit: int = 20, severity: Optional[str] = None) -> Dict[str, Any]:
    normalized_severity = normalized_text(severity)
    rows = read_jsonl(ALERTS_JSONL)
    if normalized_severity:
        rows = [row for row in rows if normalized_text(row.get("severity")) == normalized_severity]
    recent_rows = list(reversed(rows))[: max(limit, 0)]
    return {"count": len(recent_rows), "items": recent_rows}


@app.get("/integrations/default-policy")
def integrations_default_policy() -> Dict[str, Any]:
    return {
        "service": "SIMSentinel Universal Adapter",
        "attach_to": [
            "mobile banking apps",
            "wallets and payment gateways",
            "consumer identity platforms",
            "telecom self-care apps",
            "admin or enterprise access portals",
        ],
        "required_fields": ["device_id"],
        "supported_flows": ["login", "wallet_transfer", "otp_reset", "admin_access"],
        "recommended_fields": [
            "user_id",
            "event_type",
            "phone_number",
            "imsi",
            "iccid",
            "carrier",
            "sim_type",
            "esim_profile_id",
            "recent_esim_download",
            "device_integrity",
            "failed_auth_count_24h",
            "ip_country",
            "hours_since_sim_change",
        ],
        "decision_mapping": {
            "allow": "Let the app continue normally.",
            "challenge": "Require MFA or extra customer verification.",
            "hold": "Pause sensitive actions and send the case for review.",
            "block": "Stop the flow until a human review clears the event.",
        },
    }


@app.get("/integrations/flow-policies")
def integrations_flow_policies(flow_type: Optional[str] = None) -> Dict[str, Any]:
    requested_flow = normalized_text(flow_type)
    if requested_flow:
        resolved_flow = FLOW_ALIASES.get(requested_flow, requested_flow)
        template = FLOW_POLICY_TEMPLATES.get(resolved_flow)
        if not template:
            raise HTTPException(status_code=404, detail="flow_type not found")
        return {"flow_type": resolved_flow, "template": template}

    templates = {key: value for key, value in FLOW_POLICY_TEMPLATES.items() if key != "generic"}
    return {"count": len(templates), "items": templates}


@app.get("/stats")
def stats() -> Dict[str, Any]:
    total = 0
    medium = 0
    high = 0
    critical = 0

    with CSV_PATH.open("r", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            total += 1
            risk = to_int(row.get("risk")) or 0
            if risk >= 80:
                critical += 1
            elif risk >= 50:
                high += 1
            elif risk >= 20:
                medium += 1

    alert_count = len(read_jsonl(ALERTS_JSONL))

    return {
        "events": total,
        "medium_risk": medium,
        "high_risk": high,
        "critical_risk": critical,
        "alerts": alert_count,
    }
