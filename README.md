# SIMSentinel

SIMSentinel is an embeddable eSIM swap and telecom threat-detection service.
You can attach it to a mobile app, web app, admin panel, wallet, banking flow, or any backend system that needs to decide whether a SIM-related event looks safe, suspicious, or dangerous.

## What It Does

- Stores a trusted SIM or eSIM baseline for each device with `POST /enroll`
- Scores live events with `POST /telemetry` or `POST /assess`
- Detects high-risk signals such as:
  - IMSI change
  - ICCID change
  - carrier change
  - eSIM profile change
  - recent eSIM download
  - port-out request
  - compromised device integrity
  - failed-auth spikes
  - country mismatch
- Returns an integration-ready decision your app can use immediately:
  - `allow`
  - `challenge`
  - `hold`
  - `block`
- Returns a flow-specific playbook for:
  - login
  - wallet transfer
  - OTP reset
  - admin access
- Writes high-risk alerts to `backend/logs/alerts.jsonl`

## API Endpoints

- `GET /`
  - Service metadata
- `GET /preview`
  - Animated browser preview for the product UI
- `GET /health`
  - Liveness and version
- `POST /enroll`
  - Store or update a trusted baseline
- `POST /telemetry`
  - Evaluate a SIM snapshot from a device
- `POST /assess`
  - Evaluate a broader app or backend security event
- `GET /alerts`
  - Fetch recent high-risk alerts
- `GET /integrations/default-policy`
  - Decision mapping for attaching this service to other systems
- `GET /integrations/flow-policies`
  - Built-in playbooks for login, wallet transfer, OTP reset, and admin access
- `GET /stats`
  - Event and alert counters

## Example Flow

1. Enroll the trusted SIM or eSIM profile for a device.
2. Send an event during login, password reset, payout, or account recovery.
3. Read the returned `risk`, `severity`, `action`, and `integration.decision`.
4. Read `flow_policy.backend_action` to know the exact action for that app flow.
5. Let your app continue, step up verification, hold the action, or block it.

## Example Requests

### Enroll a Baseline

```bash
curl -X POST http://127.0.0.1:8080/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "dev-200",
    "user_id": "user-200",
    "phone_number": "+15550000002",
    "imsi": "111",
    "iccid": "AAA",
    "carrier": "CarrierA",
    "sim_type": "esim",
    "esim_profile_id": "profile-a",
    "trusted_geo_country": "IN"
  }'
```

### Assess a High-Risk eSIM Swap Event

```bash
curl -X POST http://127.0.0.1:8080/assess \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "dev-200",
    "user_id": "user-200",
    "event_type": "money_transfer",
    "imsi": "999",
    "iccid": "ZZZ",
    "carrier": "CarrierB",
    "sim_type": "esim",
    "esim_profile_id": "profile-z",
    "recent_esim_download": true,
    "port_out_request": true,
    "failed_auth_count_24h": 8,
    "device_integrity": "compromised",
    "ip_country": "US",
    "geo_country": "IN",
    "hours_since_sim_change": 2
  }'
```

## Example Response

```json
{
  "device_id": "dev-200",
  "risk": 99,
  "severity": "critical",
  "action": "require_step_up",
  "decision": "block",
  "flags": [
    "IMSI_CHANGE",
    "ICCID_CHANGE",
    "CARRIER_CHANGE",
    "ESIM_PROFILE_CHANGE",
    "RECENT_ESIM_DOWNLOAD"
  ],
  "integration": {
    "decision": "block",
    "allow_now": false,
    "allow_after_step_up": false,
    "block_sensitive_actions": true,
    "notify_user": true,
    "notify_security_team": true
  },
  "flow_policy": {
    "flow_type": "wallet_transfer",
    "backend_action": "block_transfer_and_freeze_wallet",
    "review_queue": "payments-risk"
  }
}
```

## Attach To Any App Or System

Use the returned `integration.decision` like this:

- `allow`: continue normally
- `challenge`: ask for MFA, OTP, or customer verification
- `hold`: pause password resets, payouts, or beneficiary changes
- `block`: stop the flow and send it to manual review

Use the returned `flow_policy.backend_action` like this:

- `allow_login`: create a normal session
- `require_login_mfa`: request MFA before login completes
- `block_transfer_and_freeze_wallet`: stop payout or transfer actions
- `hold_otp_reset`: pause recovery until a human review completes
- `require_phishing_resistant_mfa`: enforce hardware-backed MFA for admin users

This makes the service usable from:

- Android and iOS apps
- login or identity platforms
- fintech or wallet backends
- telecom self-care apps
- admin and enterprise access systems

Sample Android and iOS clients are included in:

- `mobile/andriod/SimDetect.kt`
- `mobile/ios_stubs/CarrierDetect.swift`

## Product Preview

After starting the backend, open:

```text
http://127.0.0.1:8080/preview
```

The preview page includes:

- animated SIMSentinel dashboard visuals
- live stats from `/stats`
- built-in flow playbooks from `/integrations/flow-policies`
- one-click scenario simulator for login, wallet transfer, OTP reset, and admin access

## Deploy To Your Cloud

This project is already Docker-ready, so the easiest production deployment path is to host it as a containerized web service.

### What You Need

- A GitHub repo with this code pushed to it
- A cloud service that can deploy Docker containers
- A public URL from your cloud provider

### Recommended Deployment Steps

1. Push the code to GitHub.
2. In your cloud provider, create a new web service, app service, container app, or Cloud Run style service.
3. Connect that service to your GitHub repository, or upload the repo as a Docker build context.
4. Set the project root to the repository root, where the `Dockerfile` lives.
5. Let the cloud build from the included `Dockerfile`.
6. Expose the service publicly.
7. After deploy, open:
   - `/demo`
   - `/preview`
   - `/docs`
   - `/health`

### If Your Cloud Asks For Manual Settings

- Build method: `Dockerfile`
- Container port: `8080`
- Health check path: `/health`
- Start command:

```text
python -m uvicorn backend.app:app --host 0.0.0.0 --port $PORT
```

If your platform uses the provided `Dockerfile`, you usually do not need to enter the start command manually.

### Important Production Note

The app currently writes baselines, alerts, and event data to local files inside `backend/logs`.
On many cloud platforms, the container filesystem is temporary.

That means:

- data may reset after restart or redeploy
- alerts and baselines may be lost unless you attach persistent storage

For a real production setup, use one of these:

- a persistent disk or volume
- a database for baselines and alerts
- object storage for exported logs

## Run Locally

```powershell
py -m venv venv
.\venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
cd backend
py -m uvicorn app:app --host 0.0.0.0 --port 8080 --reload
```

Or use:

```powershell
.\start_backend.bat
```

## Tests

```powershell
.\venv\Scripts\python -m unittest discover -s backend -p "test_app.py"
```
