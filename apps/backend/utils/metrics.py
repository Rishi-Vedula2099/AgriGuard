import time
from collections import defaultdict
from typing import Dict

# In-memory metrics storage
_api_requests_total = defaultdict(int)
_api_request_duration_sum = defaultdict(float)
_api_request_duration_count = defaultdict(int)

_ml_requests_total = defaultdict(int)
_ml_request_duration_sum = defaultdict(float)
_ml_request_duration_count = defaultdict(int)

_rate_limit_violations = defaultdict(int)
_upload_failures = defaultdict(int)

class MetricsTracker:
    """In-memory metrics tracker that exports Prometheus text format."""

    @staticmethod
    def track_api_request(method: str, path: str, status_code: int, duration_seconds: float):
        key = f'method="{method}",path="{path}",status="{status_code}"'
        _api_requests_total[key] += 1
        _api_request_duration_sum[key] += duration_seconds
        _api_request_duration_count[key] += 1

    @staticmethod
    def track_ml_request(endpoint: str, status: str, duration_seconds: float):
        key = f'endpoint="{endpoint}",status="{status}"'
        _ml_requests_total[key] += 1
        _ml_request_duration_sum[key] += duration_seconds
        _ml_request_duration_count[key] += 1

    @staticmethod
    def track_rate_limit(path: str):
        key = f'path="{path}"'
        _rate_limit_violations[key] += 1

    @staticmethod
    def track_upload_failure(reason: str):
        key = f'reason="{reason}"'
        _upload_failures[key] += 1

    @staticmethod
    def get_prometheus_metrics() -> str:
        """Expose standard Prometheus text format."""
        lines = []

        # 1. API Requests Total
        lines.append("# HELP agriguard_api_requests_total Total HTTP requests handled by backend.")
        lines.append("# TYPE agriguard_api_requests_total counter")
        for labels, count in _api_requests_total.items():
            lines.append(f"agriguard_api_requests_total{{{labels}}} {count}")

        # 2. API Request Duration
        lines.append("# HELP agriguard_api_request_duration_seconds_sum Cumulative sum of API request latency.")
        lines.append("# TYPE agriguard_api_request_duration_seconds_sum counter")
        for labels, val in _api_request_duration_sum.items():
            lines.append(f"agriguard_api_request_duration_seconds_sum{{{labels}}} {val:.6f}")

        lines.append("# HELP agriguard_api_request_duration_seconds_count Count of API request latency observations.")
        lines.append("# TYPE agriguard_api_request_duration_seconds_count counter")
        for labels, count in _api_request_duration_count.items():
            lines.append(f"agriguard_api_request_duration_seconds_count{{{labels}}} {count}")

        # 3. ML Request Duration
        lines.append("# HELP agriguard_ml_requests_total Total requests sent to ML service.")
        lines.append("# TYPE agriguard_ml_requests_total counter")
        for labels, count in _ml_requests_total.items():
            lines.append(f"agriguard_ml_requests_total{{{labels}}} {count}")

        lines.append("# HELP agriguard_ml_request_duration_seconds_sum Cumulative sum of ML request latency.")
        lines.append("# TYPE agriguard_ml_request_duration_seconds_sum counter")
        for labels, val in _ml_request_duration_sum.items():
            lines.append(f"agriguard_ml_request_duration_seconds_sum{{{labels}}} {val:.6f}")

        # 4. Rate limiting violations (429s)
        lines.append("# HELP agriguard_rate_limit_violations_total Total 429 rate limit exceeded occurrences.")
        lines.append("# TYPE agriguard_rate_limit_violations_total counter")
        for labels, count in _rate_limit_violations.items():
            lines.append(f"agriguard_rate_limit_violations_total{{{labels}}} {count}")

        # 5. Upload failures
        lines.append("# HELP agriguard_upload_failures_total Total failed file uploads.")
        lines.append("# TYPE agriguard_upload_failures_total counter")
        for labels, count in _upload_failures.items():
            lines.append(f"agriguard_upload_failures_total{{{labels}}} {count}")

        return "\n".join(lines) + "\n"
