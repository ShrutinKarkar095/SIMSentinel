from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_health_check():
    """Ensure /health endpoint returns status ok"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_telemetry_endpoint():
    """Ensure /telemetry endpoint processes valid data"""
    payload = {
        "user_id": "user_test",
        "event_type": "sim_change",
        "imsi": "111",
        "baseline_imsi": "222",
        "iccid": "abc",
        "baseline_iccid": "abc"
    }
    response = client.post("/telemetry", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk" in data
    assert "action" in data
    assert "flags" in data
