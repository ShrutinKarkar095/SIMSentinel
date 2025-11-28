# SIMSentinel — SIM Swap Detection Backend  
A telecom-aware security engine that detects SIM-swap fraud using IMSI, ICCID, and carrier changes.

SIMSentinel provides a simple API that mobile apps can call to:
- Register a known-good SIM identity (`/enroll`)
- Send periodic SIM snapshots (`/telemetry`)
- Receive a risk score and recommended action

This backend is lightweight, fully offline-capable, and easy to integrate with Android/iOS applications.

---

## Features
- Baseline SIM identity storage
- Real-time SIM anomaly detection
- Risk scoring (IMSI/ICCID/Carrier)
- Logging of all telemetry events
- Fully documented API (Swagger)
- Mobile stubs for Android & iOS

---

## Quick Start (Windows)

