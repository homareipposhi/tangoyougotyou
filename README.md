# Weather Dashboard

This is a simple Weather Dashboard implemented as a single-page app (HTML/CSS/JS) that uses Open-Meteo for weather data. No API key is required.

Features
- Search by city name (uses Open-Meteo geocoding)
- Use browser geolocation to fetch weather for your current location
- Shows current temperature, wind speed and a 7-day forecast

APIs used
- Geocoding: https://geocoding-api.open-meteo.com/v1/search
- Weather: https://api.open-meteo.com/v1/forecast

How to run

1. Clone the repo:

   git clone https://github.com/homareipposhi/tangoyougotyou.git
   cd tangoyougotyou

2. Open index.html in your browser, or serve with a simple HTTP server (recommended for geolocation to work):

   python3 -m http.server 8000
   # then open http://localhost:8000 in your browser

Notes & next steps
- This is a minimal starter. Possible improvements:
  - Add icons for weather codes
  - Add unit toggle (Celsius / Fahrenheit)
  - Improve error handling and caching
  - Add automated tests and CI

License
This project is MIT-licensed (see LICENSE in the repository).
