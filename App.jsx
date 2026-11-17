import { useEffect, useState } from "react";
import "./App.css";
import {
  getWeather,
  getWeatherDescription,
} from "./services/weatherService";

function App() {
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);

  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  useEffect(() => {
    window.electronAPI.onWeatherClosed(() => {
      setIsWeatherOpen(false);
    });
  }, []);

  const getCurrentLocation = () => {
    // Clear previous data immediately
    setLocation(null);
    setLocationName(null);
    setWeather(null);

    setLocationError("");
    setWeatherError("");

    setIsLoadingLocation(true);
    setIsLoadingWeather(false);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported.");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocation({
          latitude,
          longitude,
        });

        window.electronAPI
          .getLocationName(latitude, longitude)
          .then((locationData) => {
            console.log("Location name:", locationData);
            setLocationName(locationData);
          })
          .catch((error) => {
            console.error("Location name error:", error);
          });

        setIsLoadingLocation(false);

        setIsLoadingWeather(true);
        setWeatherError("");

        getWeather(latitude, longitude)
          .then((weatherData) => {
            setWeather(weatherData);
          })
          .catch((error) => {
            console.error("Weather error:", error);
            setWeatherError("Unable to fetch weather.");
          })
          .finally(() => {
            setIsLoadingWeather(false);
          });

        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);
      },

      (error) => {
        console.error("Location error:", error);

        setLocationError("Unable to get your location.");
        setIsLoadingLocation(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleWeatherClick = () => {
    if (isWeatherOpen) {
      window.electronAPI.closeWeather();
      setIsWeatherOpen(false);
    } else {
      window.electronAPI.openWeather();
      setIsWeatherOpen(true);

      getCurrentLocation();
    }
  };

  return (
    <div className={`weather-container ${isWeatherOpen ? "open" : ""}`}>
      <button
        className="weather-button"
        onClick={handleWeatherClick}
      >
        <img
          src="/weather-icon.png"
          alt="Weather"
          className="weather-icon"
        />
      </button>

      {isWeatherOpen && (
        <div className="weather-card">
          <div className="weather-header">
            <h2>Weather Update</h2>

            <button
              className={`refresh-button ${isLoadingLocation || isLoadingWeather ? "refreshing" : ""
                }`}
              onClick={getCurrentLocation}
              disabled={isLoadingLocation || isLoadingWeather}
            >
              ↻
            </button>
          </div>

          <div className="weather-content">
            {isLoadingLocation && (
              <p>Getting your location...</p>
            )}

            {locationError && (
              <p className="error-message">
                {locationError}
              </p>
            )}

            {isLoadingWeather && (
              <p>Getting weather...</p>
            )}

            {weatherError && (
              <p className="error-message">
                {weatherError}
              </p>
            )}

            {weather && (
              <div className="weather-details">

                {locationName && (
                  <div className="location-name">
                    📍 {locationName.name}
                    {locationName.state && `, ${locationName.state}`}
                  </div>
                )}

                <div className="weather-main-icon">
                  <img
                    src="/weather-icon.png"
                    alt={getWeatherDescription(weather.weatherCode)}
                  />
                </div>

                <div className="temperature">
                  {weather.temperature}°C
                </div>

                <div className="condition">
                  {getWeatherDescription(weather.weatherCode)}
                </div>

                <div className="weather-info-grid">

                  <div className="weather-info-card">
                    <div className="info-icon">💧</div>

                    <div className="info-label">
                      Humidity
                    </div>

                    <div className="info-value">
                      {weather.humidity}%
                    </div>
                  </div>

                  <div className="weather-info-card">
                    <div className="info-icon">💨</div>

                    <div className="info-label">
                      Wind
                    </div>

                    <div className="info-value">
                      {weather.windSpeed} km/h
                    </div>
                  </div>

                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;