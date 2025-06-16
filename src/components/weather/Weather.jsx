

import React, { useEffect, useState } from 'react'
import styles from './Weather.module.css'


const Weather = ({ theme }) => {
    const [selectedSuggestion, setSelectedSuggestion] = useState("");

    const [suggestions, setSuggestions] = useState([]);
    const [debouncedInput, setDebouncedInput] = useState("");
    const [data, setdata] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cityInput, setCityInput] = useState("");
    const [searchHistory, setSearchHistory] = useState(() => {
        const savedhistory = localStorage.getItem("searchHistory");
        return savedhistory ? JSON.parse(savedhistory) : [];
    });
    const [favorites, setFavorites] = useState(() => {
        const savedFavourite = localStorage.getItem("favorites");
        return savedFavourite ? JSON.parse(savedFavourite) : [];
    });

    function toggleFavorite(city) {
        let updated;
        if (favorites.includes(city)) {
          updated = favorites.filter(c => c !== city);
        } else {
          if (favorites.length >= 3) return alert("Max 3 favorites allowed");
          updated = [...favorites, city];
        }
        setFavorites(updated);
        localStorage.setItem("favorites", JSON.stringify(updated));
      }
      
    useEffect(() => (localStorage.setItem("searchHistory", JSON.stringify(searchHistory))), [searchHistory]);
    useEffect(() => (localStorage.setItem("favorites", JSON.stringify(favorites))), [favorites]);
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        setdata(null);
        try {
            const city = cityInput.split(",")[0].trim() || "delhi";
            const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error("Weather data not found");
            }
            const jsonData = await response.json();
            const updatedHistory = [jsonData.name, ...searchHistory.filter(c => c !== jsonData.name)].slice(0, 5);
            setSearchHistory(updatedHistory);
            setdata(jsonData);
            setSelectedSuggestion("");

        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!data) {
            handleSubmit();
          }
    }, []);

        const fetchSuggestions = async () => {
            if (!debouncedInput.trim()) {
                setSuggestions([]);
                return;
            }
            try {
              const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
                const response = await fetch(
                    `https://api.openweathermap.org/geo/1.0/direct?q=${debouncedInput}&limit=5&appid=${apiKey}`
                );
                const cities = await response.json();
                if (Array.isArray(cities)) {
                    setSuggestions(cities);
                } else {
                    setSuggestions([]);
                }
            } catch (err) {
                console.error("Failed to fetch city suggestions:", err);
                setSuggestions([]);
            }
        };
        useEffect(() => {
        fetchSuggestions();
    }, [debouncedInput]);
    
     
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedInput(cityInput);
        }, 300);

        return () => clearTimeout(timer);
    }, [cityInput]);

    useEffect(() => {
        if (data) window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [data]);
    
    const handleLocationClick = () => {
        if (!navigator.geolocation) {
          return setError({ message: "Geolocation is not supported" });
        }
      
        setLoading(true);
        setError(null);
        setdata(null);
      
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const apiKey = "ba909ad025584565445216f6e6d1d564";
              const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
              const response = await fetch(url);
              if (!response.ok) throw new Error("Failed to fetch weather for your location");
      
              const jsonData = await response.json();
              const updatedHistory = [jsonData.name, ...searchHistory.filter(c => c !== jsonData.name)].slice(0, 5);
              setSearchHistory(updatedHistory);
              setdata(jsonData);
              setCityInput(`${jsonData.name}, ${jsonData.sys?.country || ""}`);
              setSelectedSuggestion("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            } catch (err) {
              setError(err);
            } finally {
              setLoading(false);
            }
          },
          (error) => {
            setLoading(false);
            switch (error.code) {
              case error.PERMISSION_DENIED:
                setError({ message: "Permission denied. Please allow location access." });
                break;
              case error.POSITION_UNAVAILABLE:
                setError({ message: "Location info unavailable." });
                break;
              case error.TIMEOUT:
                setError({ message: "Location request timed out." });
                break;
              default:
                setError({ message: "Failed to get your location." });
            }
          }
        );
      };
      
      
     

  return (
    <div className={`${styles.weatherContainer} ${styles[theme]}`}>
          <h1>weather search</h1>
          <form
               onSubmit={(e) => {
                e.preventDefault();
                if (!cityInput.trim()) return alert("Please enter a city name");
                  handleSubmit();
                  setSuggestions([]);
                 }}
               >
                  <input
                      type="text"
                      onChange={(e)=>setCityInput(e.target.value)}
                      id='city'
                      name='city'
                      value={cityInput}
                      required
                      placeholder='Enter city...'
              />
              <button
  type="button"
  onClick={handleLocationClick}
  className={styles.locationButton}
>
  📍 Use My Location
</button>
            {suggestions.length > 0 && (
  <ul className="suggestionList">
  {suggestions.map((item, index) => (
    <li
      key={index}
      onClick={() => {
        const cityName = `${item.name}, ${item.country}`;
          setCityInput(cityName);
          setSuggestions([]); 
        handleSubmit();
      }}
    >
      {item.name}, {item.state}, {item.country}
    </li>
  ))}
</ul>
)}
              
             <button type='submit' >Search</button>
          </form>
    
          {loading && <div className={styles.loading} >Loading...</div>}
          {error && <div className={styles.error} >Error : {error.message }</div>}
          <div className= {styles.weatherDisplay}>
          {data ? (
               <div>
                    <h2>Weather in {data.name}</h2>
                    <p>Temperature: {data.main && Math.round(data.main.temp)}°C</p>
                      <p>Condition: {data.weather && data.weather[0].description}</p>
                      <img src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`} alt="weather icon" />
                      <p>Humidity: {data.main.humidity}%</p>
                      <p>Wind: {data.wind.speed} m/s</p>
                      
                </div>
        ) : (
          !loading && <h2>No Data Yet</h2>
        )}

          </div>
          <div className={styles.history}>
                     <h3>Recent Searches</h3>
                         {searchHistory.map((city) => (
                     <div key={city} className={styles.cityItem}>
                      <span onClick={() => setCityInput(city)}>{city}</span>
                    <button onClick={() => toggleFavorite(city)}>
                      {favorites.includes(city) ? "⭐" : "☆"}
                         </button>
                        </div>
                      ))}
            </div>
        
    </div>
  )
}

export default Weather;


