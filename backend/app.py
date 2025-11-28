# backend/app.py  (Day 5)
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
import os, csv, json

load_dotenv()

LOG_DIR = Path(os.getenv("LOG_DIR", "backend/logs"))
LOG_DIR.mkdir(parents=True, exist_ok=True)
CSV_PATH = LOG_DIR / os.getenv("CSV_FILENAME", "backend_events.csv")
BASELINE_JSONL = LOG_DIR / "baselines.jsonl"
ALERTS_JSONL = LOG_DIR / "alerts.jsonl"
for f in [CSV_PATH, BASELINE_JSONL, ALERTS_JSONL]:
    if not f.exists():
        f.touch()

app = FastAPI(title="SIMSentinel API", version="0.5.0-Day5")

class Enrollment(BaseModel):
    device_id: str = Field(..., min_length=3)
    imsi: Optional[str] = None
    iccid: Optional[str] = None
    carrier: Optional[str] = None

class Telemetry(BaseModel):
    device_id: str = Field(..., min_length=3)
    imsi: Optional[str] = None
    iccid: Optional[str] = None
    carrier: Optional[str] = None

def upsert_baseline(rec: Dict[str, Any]) -> None:
    device = rec["device_id"]
    rows = []
    found = False
    with BASELINE_JSONL.open("r") as f:
        for line in f:
            if not line.strip():
                continue
            row = json.loads(line)
            if row.get("device_id") == device:
                row.update({
                    "imsi": rec.get("imsi"),
                    "iccid": rec.get("iccid"),
                    "carrier": rec.get("carrier"),
                    "updated_at": datetime.utcnow().isoformat()
                })
                found = True
            rows.append(row)
    if not found:
        rec["created_at"] = datetime.utcnow().isoformat()
        rows.append(rec)
    with BASELINE_JSONL.open("w") as f:
        for r in rows:
            f.write(json.dumps(r) + "\n")

def fetch_baseline(device_id: str) -> Optional[Dict[str, Any]]:
    with BASELINE_JSONL.open("r") as f:
        for line in f:
            if not line.strip():
                continue
            row = json.loads(line)
            if row.get("device_id") == device_id:
                return row
    return None

def score_risk(current: Dict[str, Any], baseline: Optional[Dict]) -> Dict[str, Any]:
    risk = 0
    flags: List[str] = []

    if not baseline:
        return {"risk": 10, "flags": ["NO_BASELINE"], "action": "monitor"}

    if current.get("imsi") and baseline.get("imsi") and current["imsi"] != baseline["imsi"]:
        risk += 40
        flags.append("IMSI_CHANGE")

    if current.get("iccid") and baseline.get("iccid") and current["iccid"] != baseline["iccid"]:
        risk += 40
        flags.append("ICCID_CHANGE")

    if current.get("carrier") and baseline.get("carrier") and current["carrier"] != baseline["carrier"]:
        risk += 20
        flags.append("CARRIER_CHANGE")

    if risk < 20:
        action = "monitor"
    elif risk < 60:
        action = "soft_challenge"
    else:
        action = "require_step_up"

    return {"risk": min(risk, 99), "flags": flags, "action": action}

def append_csv(row: Dict[str, Any]) -> None:
    write_header = not CSV_PATH.stat().st_size
    with CSV_PATH.open("a", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=[
                "time","device_id","imsi","iccid","carrier",
                "baseline_imsi","baseline_iccid","baseline_carrier",
                "risk","action","flags"
            ]
        )
        if write_header: 
            w.writeheader()
        w.writerow(row)

@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}

@app.post("/enroll")
def enroll(data: Enrollment):
    upsert_baseline({
        "device_id": data.device_id,
        "imsi": data.imsi,
        "iccid": data.iccid,
        "carrier": data.carrier
    })
    return {"status": "enrolled", "device_id": data.device_id}

@app.post("/telemetry")
def telemetry(data: Telemetry):
    baseline = fetch_baseline(data.device_id)
    result = score_risk(data.dict(), baseline)

    row = {
        "time": datetime.utcnow().isoformat(),
        "device_id": data.device_id,
        "imsi": data.imsi,
        "iccid": data.iccid,
        "carrier": data.carrier,
        "baseline_imsi": baseline.get("imsi") if baseline else None,
        "baseline_iccid": baseline.get("iccid") if baseline else None,
        "baseline_carrier": baseline.get("carrier") if baseline else None,
        "risk": result["risk"],
        "action": result["action"],
        "flags": ",".join(result["flags"])
    }
    append_csv(row)
    return result

@app.get("/stats")
def stats():
    total = 0
    high = 0
    with CSV_PATH.open() as f:
        r = csv.DictReader(f)
        for row in r:
            total += 1
            try:
                if int(row.get("risk", 0)) >= 60:
                    high += 1
            except:
                pass
    return {"events": total, "high_risk": high}
