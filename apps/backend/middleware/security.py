from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from fastapi import Request

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to inject HTTP security headers on all outgoing responses."""
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        
        # 1. HSTS (Strict-Transport-Security) — force HTTPS (63072000s = 2 years)
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        
        # 2. Referrer-Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # 3. Permissions-Policy
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()"
        
        # 4. X-Frame-Options (prevents Clickjacking)
        response.headers["X-Frame-Options"] = "DENY"
        
        # 5. X-Content-Type-Options (prevents MIME sniffing)
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # 6. X-XSS-Protection (enables browser's built-in XSS filter)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # 7. Content-Security-Policy (CSP) — lock down resources
        csp_rules = [
            "default-src 'self'",
            "img-src 'self' data: http: https: blob:",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "connect-src 'self' http://localhost:8000 http://localhost:8001 http://localhost:8002 https://api.openweather.org"
        ]
        response.headers["Content-Security-Policy"] = "; ".join(csp_rules)
        
        return response
