// app.js - Weather Dashboard using Open-Meteo (no API key)

const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

const $ = id => document.getElementById(id);
const statusEl = $('status');
const currentEl = $('current');
const forecastEl = $('forecast');
const currentContent = $('current-content');
const forecastContent = $('forecast-content');

async function geocode(city){
  const url = `${GEO_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  return data.results && data.results[0];
}

async function fetchWeather(lat, lon){
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current_weather: 'true',
    daily: 'temperature_2m_max,temperature_2m_min,weathercode',
    timezone: 'auto'
  });
  const url = `${WEATHER_API}?${params.toString()}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('Weather fetch failed');
  return await res.json();
}

function showStatus(message, isError=false){
  statusEl.classList.remove('hidden');
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#ffb4b4' : 'var(--muted)';
}

function hideStatus(){
  statusEl.classList.add('hidden');
}

function weatherCodeToText(code){
  // Minimal mapping for common codes
  const map = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Drizzle: Light',
    53: 'Drizzle: Moderate',
    55: 'Drizzle: Dense',
    61: 'Rain: Slight',
    63: 'Rain: Moderate',
    65: 'Rain: Heavy',
    71: 'Snow: Slight',
    73: 'Snow: Moderate',
    75: 'Snow: Heavy',
    95: 'Thunderstorm'
  };
  return map[code] || 'Unknown';
}

function renderCurrent(placeName, weather){
  currentContent.innerHTML = '';
  const t = Math.round(weather.current_weather.temperature);
  const speed = Math.round(weather.current_weather.windspeed);
  const wc = weather.current_weather.weathercode;

  const left = document.createElement('div');
  left.innerHTML = `<div class="temp">${t}°C</div><div class="details">${weather.timezone} • ${placeName}</div>`;

  const right = document.createElement('div');
  right.innerHTML = `<div class="details">${weatherCodeToText(wc)}</div><div class="details">Wind: ${speed} km/h</div>`;

  currentContent.appendChild(left);
  currentContent.appendChild(right);

  currentEl.classList.remove('hidden');
}

function renderForecast(daily){
  forecastContent.innerHTML = '';
  const dates = daily.time;
  const tmax = daily.temperature_2m_max;
  const tmin = daily.temperature_2m_min;
  const wcodes = daily.weathercode;

  for(let i=0;i<dates.length;i++){
    const d = document.createElement('div');
    d.className = 'day';
    const date = new Date(dates[i]);
    const dayName = date.toLocaleDateString(undefined,{weekday:'short'});
    d.innerHTML = `<div style="font-weight:600">${dayName}</div><div style="font-size:1.1rem">${Math.round(tmax[i])}° / ${Math.round(tmin[i])}°</div><div class="details">${weatherCodeToText(wcodes[i])}</div>`;
    forecastContent.appendChild(d);
  }
  forecastEl.classList.remove('hidden');
}

async function searchCity(city){
  try{
    showStatus('Searching location...');
    const place = await geocode(city);
    if(!place) throw new Error('Location not found');
    showStatus('Fetching weather...');
    const weather = await fetchWeather(place.latitude, place.longitude);
    hideStatus();
    renderCurrent(`${place.name}${place.country ? ', ' + place.country : ''}`, weather);
    renderForecast(weather.daily);
  }catch(err){
    showStatus(err.message, true);
    console.error(err);
  }
}

async function useGeolocation(){
  if(!navigator.geolocation){
    showStatus('Geolocation not available', true);
    return;
  }
  showStatus('Getting your location...');
  navigator.geolocation.getCurrentPosition(async pos =>{
    try{
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      showStatus('Fetching weather...');
      const weather = await fetchWeather(lat, lon);
      hideStatus();
      renderCurrent('Your location', weather);
      renderForecast(weather.daily);
    }catch(err){
      showStatus(err.message, true);
    }
  }, err =>{
    showStatus('Geolocation permission denied', true);
  });
}

// UI wiring
document.getElementById('search-btn').addEventListener('click', ()=>{
  const v = document.getElementById('city-input').value.trim();
  if(!v) return showStatus('Please enter a city', true);
  searchCity(v);
});

document.getElementById('city-input').addEventListener('keydown', e =>{
  if(e.key === 'Enter') document.getElementById('search-btn').click();
});

document.getElementById('geo-btn').addEventListener('click', ()=>{
  useGeolocation();
});

// Optional: load a default city on start
searchCity('Tokyo');
