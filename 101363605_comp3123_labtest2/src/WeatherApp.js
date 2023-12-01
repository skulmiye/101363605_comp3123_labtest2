import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherApp.css';

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState('');
  const [error, setError] = useState(null);
  const API_KEY = '81399076169302a4f442b2366b5e62f1';

  const fetchWeatherData = async () => {
    try {
      const response = await axios.get(
        `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      setWeatherData(response.data);
      setError(null);
    } catch (error) {
      setWeatherData(null);
      setError('City not found. Please try again.');
    }
  };

  const handleSearch = () => {
    if (city.trim() !== '') {
      fetchWeatherData();
    } else {
      setError('Please enter a city name.');
    }
  };

  const getDayOfWeek = (timestamp) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(timestamp * 1000);
    return daysOfWeek[date.getDay()];
  };

  const groupForecastByDay = () => {
    const groupedForecast = {};
    weatherData.list.forEach((forecast) => {
      const date = forecast.dt_txt.split(' ')[0];
      if (!groupedForecast[date]) {
        groupedForecast[date] = [];
      }
      groupedForecast[date].push(forecast);
    });
  
    // Filter out the forecast for the current day
    const filteredForecast = Object.keys(groupedForecast)
      .filter((date) => new Date(date) > new Date());
  
    // Get the next 6 days
    const next6Days = filteredForecast.slice(0, 6);
  
    // Create a new object with forecast for the next 6 days
    const next6DaysForecast = next6Days.reduce((acc, date) => {
      acc[date] = groupedForecast[date];
      return acc;
    }, {});
  
    return next6DaysForecast;
  };

  useEffect(() => {
    if (weatherData) {
      const groupedForecast = groupForecastByDay();
      console.log(groupedForecast);
    }
  }, [weatherData]);

  return (
    <div className="weather-app" style={{ textAlign: 'center' }}>
      <h1>Weather App</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {error && <p className="error-message">{error}</p>}
      {weatherData && (
        <div className="weather-container">
          <div className="current-weather">
            <h2>
              {weatherData.city.name}, {weatherData.city.country}
            </h2>
            <h3>{getDayOfWeek(weatherData.list[0].dt)}</h3>
            <img
              src={`http://openweathermap.org/img/wn/${weatherData.list[0].weather[0].icon}.png`}
              alt="Weather Icon"
            />
            <p><strong>Temperature:</strong> {weatherData.list[0].main.temp} °C</p>
            <p><strong>Min Temperature:</strong> {weatherData.list[0].main.temp_min} °C</p>
            <p><strong>Max Temperature:</strong> {weatherData.list[0].main.temp_max} °C</p>
            <p><strong>Feels Like:</strong> {weatherData.list[0].main.feels_like} °C</p>
            <p><strong>Wind Speed:</strong> {weatherData.list[0].wind.speed} m/s</p>
          </div>
  
          {weatherData && Object.keys(groupForecastByDay()).length > 1 && (
            <div className="weekly-forecast">
              <h2 style={{ textAlign: 'center' }}>Weekly Forecast</h2>
              <div className="forecast-days">
                {Object.keys(groupForecastByDay())
                  .filter((date) => new Date(date) > new Date()) // Filter out the current day
                  .map((date, index) => {
                    console.log(date);
                    const dayForecast = groupForecastByDay()[date][0];
                    return (
                      <div key={index} className="forecast-day">
                        <h3>{getDayOfWeek(dayForecast.dt)}</h3>
                        <img
                          src={`http://openweathermap.org/img/wn/${dayForecast.weather[0].icon}.png`}
                          alt="Weather Icon"
                        />
                        <p><strong>Min Temperature:</strong> {dayForecast.main.temp_min} °C</p>
                        <p><strong>Max Temperature:</strong> {dayForecast.main.temp_max} °C</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
  
};

export default WeatherApp;

