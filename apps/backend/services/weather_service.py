"""
AgriGuard Weather Service — Interface with OpenWeatherMap API
"""
import httpx
from typing import Dict, Any, Optional
from config import get_settings

settings = get_settings()

class WeatherService:
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5"

    async def get_current_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fetch current weather for a specific location."""
        if self.api_key == "your_openweather_api_key" or not self.api_key:
            return self._get_mock_weather()

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/weather",
                    params={
                        "lat": lat,
                        "lon": lon,
                        "appid": self.api_key,
                        "units": "metric"
                    },
                    timeout=5.0
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Error fetching weather: {e}")
                return self._get_mock_weather()

    async def get_forecast(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fetch 5-day forecast."""
        if self.api_key == "your_openweather_api_key" or not self.api_key:
             return {"message": "Mock forecast data placeholder"}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/forecast",
                    params={
                        "lat": lat,
                        "lon": lon,
                        "appid": self.api_key,
                        "units": "metric"
                    },
                    timeout=5.0
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Error fetching forecast: {e}")
                return {}

    def _get_mock_weather(self) -> Dict[str, Any]:
        """Return realistic mock weather for demo mode."""
        return {
            "coord": {"lon": 77.5946, "lat": 12.9716},
            "weather": [{"id": 801, "main": "Clouds", "description": "few clouds", "icon": "02d"}],
            "main": {
                "temp": 28.5,
                "feels_like": 30.2,
                "temp_min": 27.0,
                "temp_max": 30.0,
                "pressure": 1012,
                "humidity": 65
            },
            "name": "Local Field (Demo)",
            "cod": 200
        }

# Singleton instance
weather_service = WeatherService()
