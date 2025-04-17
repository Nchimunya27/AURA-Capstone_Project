// Weather API Integration for Welcome Bar
document.addEventListener('DOMContentLoaded', function() {
    // Your AccuWeather API Key 
    const API_KEY = 'ZSeUUg773HffY5IkWK9gqn3NQiNgTw5I'; 
    // Function to add weather container to the welcome bar
    function addWeatherContainer() {
      // First check if the date-weather-container exists, if not create it
      let dateElement = document.querySelector('.current-date');
      let dateWeatherContainer = document.querySelector('.date-weather-container');
      
      if (!dateElement) {
        console.error('Date element not found');
        return null;
      }
      
      // If date-weather-container doesn't exist, create it and wrap the date
      if (!dateWeatherContainer) {
        // Create the container
        dateWeatherContainer = document.createElement('div');
        dateWeatherContainer.className = 'date-weather-container';
        
        // Get the parent of date element (welcome-section)
        const welcomeSection = dateElement.parentNode;
        
        // Replace date element with new container
        welcomeSection.removeChild(dateElement);
        dateWeatherContainer.appendChild(dateElement);
        welcomeSection.appendChild(dateWeatherContainer);
      }
      
      // Now create the weather container
      const weatherContainer = document.createElement('div');
      weatherContainer.className = 'weather-info';
      weatherContainer.innerHTML = `
        <img src="" alt="Weather" class="weather-icon">
        <span class="weather-temp"></span>
        <span class="weather-condition"></span>
      `;
      
      // Add the weather container to the date-weather container
      dateWeatherContainer.appendChild(weatherContainer);
      
      return weatherContainer;
    }
    
    // Initialize weather functionality
    function initWeather() {
      // Add weather container to the header
      const weatherContainer = addWeatherContainer();
      
      if (!weatherContainer) {
        return;
      }
      
      // Try to get cached location first
      const cachedLocationKey = localStorage.getItem('weatherLocationKey');
      
      if (cachedLocationKey) {
        // Use cached location key
        getCurrentWeather(cachedLocationKey, weatherContainer);
      } else {
        // Get user's location or use default
        getUserLocation(weatherContainer);
      }
    }
    
    // Get user's location using browser geolocation
    function getUserLocation(weatherContainer) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            getLocationKey(position.coords.latitude, position.coords.longitude, weatherContainer);
          },
          error => {
            console.log('Geolocation error:', error);
            // Use Winter Park, Florida as default
            getLocationKey(28.5999, -81.3392, weatherContainer);
          }
        );
      } else {
        console.log('Geolocation not supported');
        // Use Winter Park, Florida as default
        getLocationKey(28.5999, -81.3392, weatherContainer);
      }
    }
    
    // Get AccuWeather location key based on coordinates
    function getLocationKey(latitude, longitude, weatherContainer) {
      const url = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${API_KEY}&q=${latitude},${longitude}`;
      
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Save location key to localStorage
          const locationKey = data.Key;
          localStorage.setItem('weatherLocationKey', locationKey);
          localStorage.setItem('weatherLocationName', data.LocalizedName);
          
          // Get current weather conditions
          getCurrentWeather(locationKey, weatherContainer);
        })
        .catch(error => {
          console.error('Error fetching location key:', error);
          
          // Try to use cached location key if available
          const cachedLocationKey = localStorage.getItem('weatherLocationKey');
          if (cachedLocationKey) {
            getCurrentWeather(cachedLocationKey, weatherContainer);
          } else {
            displayWeatherError(weatherContainer);
          }
        });
    }
    
    // Get current weather conditions
    function getCurrentWeather(locationKey, weatherContainer) {
      const url = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${API_KEY}`;
      
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data && data.length > 0) {
            // Display current weather
            displayWeather(data[0], weatherContainer);
            
            // Cache weather data with timestamp
            localStorage.setItem('weatherData', JSON.stringify({
              data: data[0],
              timestamp: Date.now()
            }));
          }
        })
        .catch(error => {
          console.error('Error fetching weather:', error);
          
          // Try to use cached weather data if available
          const cachedWeather = localStorage.getItem('weatherData');
          if (cachedWeather) {
            try {
              const weatherData = JSON.parse(cachedWeather);
              // Only use cached data if it's less than 1 hour old
              if (Date.now() - weatherData.timestamp < 3600000) {
                displayWeather(weatherData.data, weatherContainer);
                return;
              }
            } catch (e) {
              console.error('Error parsing cached weather data:', e);
            }
          }
          
          displayWeatherError(weatherContainer);
        });
    }
    
    // Display weather information
    function displayWeather(weatherData, weatherContainer) {
      if (!weatherContainer) return;
      
      const iconElement = weatherContainer.querySelector('.weather-icon');
      const tempElement = weatherContainer.querySelector('.weather-temp');
      const conditionElement = weatherContainer.querySelector('.weather-condition');
      
      // Get temperature in Fahrenheit
      const temperature = Math.round(weatherData.Temperature.Imperial.Value);
      
      // Get weather condition
      const weatherText = weatherData.WeatherText;
      
      // Get icon number (with leading zero if needed)
      const iconNum = weatherData.WeatherIcon < 10 ? 
        `0${weatherData.WeatherIcon}` : weatherData.WeatherIcon;
      
      // Set icon URL - using AccuWeather icon set
      iconElement.src = `https://developer.accuweather.com/sites/default/files/${iconNum}-s.png`;
      iconElement.alt = weatherText;
      
      // Set temperature
      tempElement.textContent = `${temperature}°F`;
      
      // Set condition text - keep it short
      conditionElement.textContent = weatherText;
      
      // Show the weather container
      weatherContainer.style.display = 'flex';
    }
    
    // Display weather error
    function displayWeatherError(weatherContainer) {
      if (!weatherContainer) return;
      
      weatherContainer.innerHTML = `
        <span class="weather-error">Weather unavailable</span>
      `;
      
      // Show the weather container
      weatherContainer.style.display = 'flex';
    }
    
    // Initialize weather functionality after a slight delay to ensure DOM is ready
    setTimeout(initWeather, 500);
    
    // Update weather every 30 minutes
    setInterval(function() {
      const weatherContainer = document.querySelector('.weather-info');
      if (!weatherContainer) {
        // Try to add the container if it doesn't exist
        const newContainer = addWeatherContainer();
        if (newContainer) {
          const cachedLocationKey = localStorage.getItem('weatherLocationKey');
          if (cachedLocationKey) {
            getCurrentWeather(cachedLocationKey, newContainer);
          } else {
            getUserLocation(newContainer);
          }
        }
      } else {
        // Update existing container
        const cachedLocationKey = localStorage.getItem('weatherLocationKey');
        if (cachedLocationKey) {
          getCurrentWeather(cachedLocationKey, weatherContainer);
        } else {
          getUserLocation(weatherContainer);
        }
      }
    }, 1800000); // 30 minutes
  });