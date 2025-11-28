# SIMSentinel — Day 5 Technical Log  
_Date: 2025-11-25_  

## 1. Objective

Day 5 focused on turning the prototype backend into a more realistic SIM-swap detection service by:

- Adding a `/enroll` endpoint for device baseline capture.
- Keeping `/telemetry` for ongoing risk checks against the baseline.
- Implementing a simple, explainable risk-scoring model with actions (`monitor`, `soft_challenge`, `require_step_up`).
- Verifying end-to-end behavior locally in VS Code on Windows with a virtual environment.

---

## 2. Backend Changes (FastAPI)

### 2.1 File: `backend/app.py`

**Key updates:**

- New models:
  - `Enrollment` (device_id, imsi, iccid, carrier)
  - `Telemetry` (device_id, imsi, iccid, carrier)
- New storage files in `backend/logs/`:
  - `baselines.jsonl` — one JSON line per device baseline.
  - `backend_events.csv` — CSV log of telemetry evaluations.
- New endpoint: `POST /enroll`
  - Purpose: capture or update the *baseline* SIM identity for a device.
  - Behavior: upsert the device’s IMSI, ICCID, carrier into `baselines.jsonl`.
  - Response: `{"status":"enrolled","device_id": "<id>"}`

- Existing endpoint: `POST /telemetry` (enhanced)
  - Fetches baseline for `device_id` from `baselines.jsonl`.
  - Computes risk and flags via `score_risk()`.
  - Logs each evaluation to `backend_events.csv`.

- New endpoint: `GET /stats`
  - Returns total event count and number of high-risk events (risk ≥ 60).

- Health endpoint: `GET /health`
  - Used to confirm the server is alive and code is loaded correctly.

---

## 3. Risk Model (Day 5)

Function: `score_risk(current: dict, baseline: dict | None) -> dict`

Rules:

- If **no baseline exists**:
  - `risk = 10`
  - `flags = ["NO_BASELINE"]`
  - `action = "monitor"`
- If baseline exists:
  - IMSI changed → `+40`, flag `IMSI_CHANGE`
  - ICCID changed → `+40`, flag `ICCID_CHANGE`
  - Carrier changed → `+20`, flag `CARRIER_CHANGE`

Risk → Action mapping:

- `0–19` → `action = "monitor"`
- `20–59` → `action = "soft_challenge"`
- `60–99` → `action = "require_step_up"`
- Score is capped at 99.

Example:

- Baseline: `imsi=111`, `iccid=AAA`
- Telemetry: `imsi=333`, `iccid=BBB`
  - Risk: 40 (IMSI) + 40 (ICCID) = 80
  - Flags: `["IMSI_CHANGE","ICCID_CHANGE"]`
  - Action: `require_step_up`

---

## 4. Local Environment (Windows, VS Code)

- Folder: `D:\Bharat\Vrutika\SIMSentinel_Full_Project_Day3_Day4`
- Virtual environment:

  ```powershell
  py -m venv venv
  .\venv\Scripts\Activate.ps1
  py -m pip install fastapi uvicorn python-dotenv pydantic
