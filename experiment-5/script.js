const $ = id => document.getElementById(id);
const CODES = {0:['Clear sky','☀️'],1:['Mainly clear','🌤️'],2:['Partly cloudy','⛅'],3:['Overcast','☁️'],45:['Fog','🌫️'],48:['Fog','🌫️'],
  51:['Light drizzle','🌦️'],53:['Drizzle','🌦️'],55:['Heavy drizzle','🌧️'],61:['Light rain','🌧️'],63:['Rain','🌧️'],65:['Heavy rain','🌧️'],
  71:['Light snow','🌨️'],73:['Snow','🌨️'],75:['Heavy snow','❄️'],80:['Rain showers','🌦️'],81:['Rain showers','🌧️'],82:['Violent showers','⛈️'],95:['Thunderstorm','⛈️'],96:['Thunderstorm, hail','⛈️'],99:['Thunderstorm, hail','⛈️']};

function show(text, isError = false) { $('msg').textContent = text; $('msg').className = isError ? 'error' : ''; }

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Unable to fetch weather information.');
  return res.json();
}

async function getWeather(city) {
  show('Loading weather information...'); $('out').hidden = true;
  try {
    // Step 1: Geocoding API -> latitude + longitude
    const geo = await getJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    if (!geo.results || !geo.results.length) throw new Error('City not found.');
    const { name, country, latitude, longitude } = geo.results[0];
    // Step 2: Weather API -> current conditions
    const w = await getJSON(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code&timezone=auto`);
    const c = w.current, [desc, emoji] = CODES[c.weather_code] || ['Unknown', '🌡️'];
    $('place').textContent = `${name}, ${country}`; $('emoji').textContent = emoji;
    $('temp').textContent = `${Math.round(c.temperature_2m)}°C`; $('desc').textContent = desc;
    $('feels').textContent = `${Math.round(c.apparent_temperature)}°C`; $('hum').textContent = `${c.relative_humidity_2m}%`;
    $('wind').textContent = `${c.wind_speed_10m} km/h`; $('pres').textContent = `${Math.round(c.surface_pressure)} hPa`;
    $('out').hidden = false; show('');
  } catch (err) { show(err.message, true); console.error(err); }
}

$('form').addEventListener('submit', e => { e.preventDefault(); const city = $('city').value.trim(); if (city) getWeather(city); });
