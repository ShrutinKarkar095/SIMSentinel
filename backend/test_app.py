from pathlib import Path
import tempfile
import unittest

import app as app_module
from fastapi import HTTPException
from fastapi.responses import FileResponse


class SIMSentinelApiTests(unittest.TestCase):
    def setUp(self):
        self._original_paths = (
            app_module.LOG_DIR,
            app_module.CSV_PATH,
            app_module.BASELINE_JSONL,
            app_module.ALERTS_JSONL,
        )

        self._temp_dir = tempfile.TemporaryDirectory()
        log_dir = Path(self._temp_dir.name) / "logs"
        log_dir.mkdir()

        app_module.LOG_DIR = log_dir
        app_module.CSV_PATH = log_dir / "backend_events.csv"
        app_module.BASELINE_JSONL = log_dir / "baselines.jsonl"
        app_module.ALERTS_JSONL = log_dir / "alerts.jsonl"

        app_module.CSV_PATH.touch()
        app_module.BASELINE_JSONL.touch()
        app_module.ALERTS_JSONL.touch()

    def tearDown(self):
        (
            app_module.LOG_DIR,
            app_module.CSV_PATH,
            app_module.BASELINE_JSONL,
            app_module.ALERTS_JSONL,
        ) = self._original_paths
        self._temp_dir.cleanup()

    def test_health_check(self):
        response = app_module.health()

        self.assertEqual(response["status"], "ok")
        self.assertIn("time", response)
        self.assertEqual(response["version"], app_module.app.version)

    def test_preview_route_returns_html_file(self):
        response = app_module.preview()

        self.assertIsInstance(response, FileResponse)
        self.assertTrue(str(response.path).endswith("preview.html"))

    def test_demo_route_returns_html_file(self):
        response = app_module.demo()

        self.assertIsInstance(response, FileResponse)
        self.assertTrue(str(response.path).endswith("demo.html"))

    def test_enroll_and_assess_low_risk_session(self):
        enroll_response = app_module.enroll(
            {
                "device_id": "dev-100",
                "user_id": "user-100",
                "phone_number": "+15550000001",
                "imsi": "111",
                "iccid": "AAA",
                "carrier": "Jio",
                "sim_type": "esim",
                "trusted_geo_country": "IN",
                "esim_profile_id": "profile-a",
            }
        )

        self.assertEqual(enroll_response["status"], "enrolled")

        body = app_module.telemetry(
            {
                "device_id": "dev-100",
                "user_id": "user-100",
                "event_type": "login",
                "imsi": "111",
                "iccid": "AAA",
                "carrier": "Jio",
                "sim_type": "esim",
                "esim_profile_id": "profile-a",
                "ip_country": "IN",
            }
        )

        self.assertEqual(body["risk"], 0)
        self.assertEqual(body["severity"], "low")
        self.assertEqual(body["action"], "monitor")
        self.assertEqual(body["decision"], "allow")
        self.assertTrue(body["integration"]["allow_now"])
        self.assertTrue(body["baseline_found"])
        self.assertEqual(body["flow_policy"]["flow_type"], "login")
        self.assertEqual(body["flow_policy"]["backend_action"], "allow_login")

    def test_assess_esim_swap_attack_and_alerts(self):
        app_module.enroll(
            {
                "device_id": "dev-200",
                "user_id": "user-200",
                "phone_number": "+15550000002",
                "imsi": "111",
                "iccid": "AAA",
                "carrier": "CarrierA",
                "sim_type": "esim",
                "trusted_geo_country": "IN",
                "esim_profile_id": "profile-a",
            }
        )

        body = app_module.assess(
            {
                "device_id": "dev-200",
                "user_id": "user-200",
                "event_type": "money_transfer",
                "phone_number": "+15550000002",
                "imsi": "999",
                "iccid": "ZZZ",
                "carrier": "CarrierB",
                "sim_type": "esim",
                "esim_profile_id": "profile-z",
                "recent_esim_download": True,
                "port_out_request": True,
                "failed_auth_count_24h": 8,
                "device_integrity": "compromised",
                "ip_country": "US",
                "geo_country": "IN",
                "hours_since_sim_change": 2,
            }
        )

        self.assertEqual(body["severity"], "critical")
        self.assertEqual(body["decision"], "block")
        self.assertEqual(body["action"], "require_step_up")
        self.assertIn("IMSI_CHANGE", body["flags"])
        self.assertIn("RECENT_ESIM_DOWNLOAD", body["flags"])
        self.assertTrue(body["integration"]["block_sensitive_actions"])
        self.assertTrue(body["integration"]["notify_security_team"])
        self.assertEqual(body["flow_policy"]["flow_type"], "wallet_transfer")
        self.assertEqual(body["flow_policy"]["backend_action"], "block_transfer_and_freeze_wallet")
        self.assertIn("wallet_transfer", body["flow_policy"]["blocked_actions"])

        alerts_body = app_module.alerts()
        self.assertEqual(alerts_body["count"], 1)
        self.assertEqual(alerts_body["items"][0]["device_id"], "dev-200")
        self.assertEqual(alerts_body["items"][0]["severity"], "critical")
        self.assertEqual(alerts_body["items"][0]["flow_type"], "wallet_transfer")

    def test_admin_access_flow_requires_hardware_mfa_on_medium_risk(self):
        body = app_module.assess(
            {
                "device_id": "admin-1",
                "user_id": "ops-user",
                "event_type": "admin_access",
                "failed_auth_count_24h": 5,
                "device_integrity": "unknown",
            }
        )

        self.assertEqual(body["severity"], "medium")
        self.assertEqual(body["decision"], "challenge")
        self.assertEqual(body["flow_policy"]["flow_type"], "admin_access")
        self.assertEqual(body["flow_policy"]["backend_action"], "require_phishing_resistant_mfa")
        self.assertIn("phishing_resistant_mfa", body["flow_policy"]["required_checks"])

    def test_flow_policy_templates_are_available(self):
        response = app_module.integrations_flow_policies()

        self.assertEqual(response["count"], 4)
        self.assertIn("login", response["items"])
        self.assertIn("wallet_transfer", response["items"])
        self.assertIn("otp_reset", response["items"])
        self.assertIn("admin_access", response["items"])

    def test_missing_device_id_returns_clean_400(self):
        with self.assertRaises(HTTPException) as context:
            app_module.telemetry({"event_type": "login"})

        self.assertEqual(context.exception.status_code, 400)
        self.assertEqual(context.exception.detail, "device_id is required")


if __name__ == "__main__":
    unittest.main()
