// Fetches real-world external weather data from Open-Meteo API
// Free, no API key required, completely separate from Student Mood
export async function getRealWeather(lat = 13.7563, lon = 100.5018) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FBangkok`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch weather');
    const data = await res.json();
    
    const code = data.current?.weather_code || 0;
    const temp = Math.round(data.current?.temperature_2m || 30);
    const humidity = data.current?.relative_humidity_2m || 65;
    const wind = data.current?.wind_speed_10m || 5;

    // Decode WMO weather code
    let condition = 'ท้องฟ้าแจ่มใส';
    let icon = '☀️';

    if (code === 0) {
      condition = 'ท้องฟ้าแจ่มใส ปลอดโปร่ง';
      icon = '☀️';
    } else if (code <= 3) {
      condition = 'มีเมฆบางส่วน อากาศดี';
      icon = '🌤️';
    } else if (code <= 48) {
      condition = 'มีหมอกบาง ทัศนวิสัยดี';
      icon = '🌫️';
    } else if (code <= 67) {
      condition = 'มีฝนตกปรอยๆ ชุ่มฉ่ำ';
      icon = '🌦️';
    } else if (code <= 82) {
      condition = 'ฝนตกในพื้นที่';
      icon = '🌧️';
    } else {
      condition = 'มีฝนฟ้าคะนอง';
      icon = '⛈️';
    }

    return {
      temp,
      humidity,
      wind,
      condition,
      icon,
      location: 'กรุงเทพฯ (สถานศึกษา)',
      updatedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error) {
    console.warn('Real weather fetch fallback:', error);
    return {
      temp: 31,
      humidity: 68,
      wind: 8,
      condition: 'มีเมฆบางส่วน ลมพัดสบาย',
      icon: '🌤️',
      location: 'กรุงเทพฯ (สถานศึกษา)',
      updatedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };
  }
}
