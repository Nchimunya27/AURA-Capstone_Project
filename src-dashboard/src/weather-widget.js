// Enhanced Weather Widget for AURA Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Your AccuWeather API Key 
    const API_KEY = 'ZSeUUg773HffY5IkWK9gqn3NQiNgTw5I'; 
    
    // Weather messages based on conditions and temperature
    const weatherMessages = {
      // Hot weather messages (80°F and above)
      hot: [
        "It's a hot one out there today! Stay hydrated!",
        "Phew! It's a scorcher today. Don't forget your sunscreen!",
        "Hot day alert! Perfect weather for ice cream.",
        "Feeling the heat today! Stay cool and hydrated.",
        "Hot weather tip: Study in the shade or A/C today!"
      ],
      // Warm weather messages (65-79°F)
      warm: [
        "Beautiful warm weather today! Perfect for outdoor studying.",
        "Lovely day outside! Maybe take your books to the park?",
        "Warm and pleasant conditions today. Enjoy!",
        "Nice and warm out there! A great day for productivity.",
        "Warm vibes today! Perfect weather for a walk between study sessions."
      ],
      // Mild weather messages (50-64°F)
      mild: [
        "Mild temperatures today. Grab a light jacket for evening study sessions!",
        "A pleasantly mild day ahead. Great weather for focusing!",
        "Neither too hot nor too cold today. Perfect balance!",
        "Mild weather today - the ideal conditions for getting things done.",
        "Comfortably mild outside. Your brain works best at these temperatures!"
      ],
      // Cool weather messages (35-49°F)
      cool: [
        "Bundle up a bit! It's a cool day outside.",
        "A bit chilly today! Perfect weather for a warm drink while studying.",
        "Cool weather alert: your brain actually works better in cooler temps!",
        "It's cool outside - time to break out the sweaters!",
        "Cool and crisp today. Ideal weather for clear thinking!"
      ],
      // Cold weather messages (below 35°F)
      cold: [
        "Brr! It's cold out there. Stay warm while you study!",
        "Freezing temperatures today! Perfect excuse for hot chocolate and studying.",
        "Cold day alert! Keep warm and keep learning.",
        "Bundle up if you're heading out! It's pretty cold today.",
        "Baby, it's cold outside! A good day to cozy up with your studies."
      ],
      // Rainy weather messages
      rainy: [
        "Rainy day mood! Perfect weather for focused indoor studying.",
        "Grab your umbrella! It's a wet one out there today.",
        "Rain, rain, go away... or stay, because it's perfect study weather!",
        "The sound of rain makes for excellent study ambiance!",
        "Rainy weather today - nature's white noise for deep focus."
      ],
      // Cloudy weather messages
      cloudy: [
        "Cloudy skies today. No sun glare on your screen!",
        "Overcast but perfect for avoiding distractions and staying focused.",
        "Clouds overhead today. A good day to create your own sunshine!",
        "Cloudy day ahead - ideal lighting for screen work without the glare.",
        "No shadows from the clouds today, just clear thinking!"
      ],
      // Sunny weather messages
      sunny: [
        "Sunny skies ahead! Don't forget your sunglasses!",
        "A bright and sunny day! Vitamin D helps brain function.",
        "Sunshine and good vibes today! Perfect for a productive day.",
        "Sunny day alert! Maybe find a shady spot for outdoor studying?",
        "The sun is smiling down today! Let it energize your studies."
      ],
      // Stormy weather messages
      stormy: [
        "Stormy weather alert! Stay safe and dry indoors.",
        "Thunder and lightning outside - nature's dramatic background for your studies!",
        "Storm brewing! A perfect excuse to stay in and focus on your work.",
        "Stormy conditions today - stay home and stay productive!",
        "Weather's a bit wild today! Good thing learning can happen indoors."
      ],
      // Snow weather messages
      snowy: [
        "Snow day! Everything looks beautiful outside.",
        "Snowy conditions today! The perfect backdrop for cozy studying.",
        "It's snowing! Take a quick break to enjoy the winter wonderland.",
        "Flurries outside, focus inside! A perfect study day.",
        "Snow falling gently outside - nature's way of telling you to stay in and study!"
      ],
      // Windy weather messages
      windy: [
        "Hold onto your notes! It's windy out there today.",
        "Breezy conditions today! Let your thoughts flow like the wind.",
        "Windy weather alert! Trees are dancing outside.",
        "The wind is whipping up today! Good day to stay inside.",
        "Gusty conditions outside. Let your mind soar with new ideas inside!"
      ],
      // Default/fallback messages
      default: [
        "Perfect day to make progress on your learning goals!",
        "Weather or not, today is a great day for studying!",
        "Today's forecast: 100% chance of learning something new!",
        "Whatever the weather, your knowledge journey continues!",
        "Today's conditions are ideal for expanding your mind!"
      ]
    };
    
    // Function to select an appropriate weather message
    function getWeatherMessage(weatherData) {
      // Extract temperature and condition info
      const temperature = Math.round(weatherData.Temperature.Imperial.Value);
      const weatherText = weatherData.WeatherText.toLowerCase();
      const isRaining = weatherData.HasPrecipitation || 
                       weatherText.includes('rain') || 
                       weatherText.includes('shower') ||
                       weatherText.includes('drizzle');
      const isSnowing = weatherText.includes('snow') || weatherText.includes('flurr');
      const isStormy = weatherText.includes('thunder') || 
                       weatherText.includes('storm') || 
                       weatherText.includes('lightning');
      const isCloudy = weatherText.includes('cloud') || 
                       weatherText.includes('overcast') || 
                       weatherText.includes('fog');
      const isSunny = weatherText.includes('sun') || 
                     weatherText.includes('clear') ||
                     weatherText.includes('fair');
      const isWindy = weatherText.includes('wind') || 
                     weatherText.includes('breezy') ||
                     weatherText.includes('gust');
      
      // Determine message category based on conditions (prioritized)
      let messageCategory = 'default';
      
      if (isStormy) {
        messageCategory = 'stormy';
      } else if (isSnowing) {
        messageCategory = 'snowy';
      } else if (isRaining) {
        messageCategory = 'rainy';
      } else if (isWindy) {
        messageCategory = 'windy';
      } else if (isCloudy) {
        messageCategory = 'cloudy';
      } else if (isSunny) {
        messageCategory = 'sunny';
      } else {
        // If no specific condition, determine by temperature
        if (temperature >= 80) {
          messageCategory = 'hot';
        } else if (temperature >= 65) {
          messageCategory = 'warm';
        } else if (temperature >= 50) {
          messageCategory = 'mild';
        } else if (temperature >= 35) {
          messageCategory = 'cool';
        } else {
          messageCategory = 'cold';
        }
      }
      
      // Select a random message from the appropriate category
      const messages = weatherMessages[messageCategory] || weatherMessages.default;
      const randomIndex = Math.floor(Math.random() * messages.length);
      return messages[randomIndex];
    }
    
    // Create and inject the weather widget
    function createWeatherWidget() {
      // Find the quick-stats section to add the widget after it
      const quickStatsSection = document.querySelector('.quick-stats');
      
      if (!quickStatsSection) {
        console.error('Quick stats section not found');
        return;
      }
      
      // Create the weather widget container
      const weatherWidget = document.createElement('section');
      weatherWidget.className = 'weather-widget';
      weatherWidget.id = 'weather-widget';
      
      // Set initial loading state
      weatherWidget.innerHTML = `
        <div class="weather-content">
          <h2 class="weather-title">
            Weather
            <button class="refresh-button" title="Refresh weather">
              <svg class="refresh-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
              </svg>
            </button>
          </h2>
          <div class="weather-loading">
            <div class="loading-spinner"></div>
            Loading weather data...
          </div>
        </div>
        <div class="weather-animation"></div>
      `;
      
      // Add it after the quick stats section
      quickStatsSection.insertAdjacentElement('afterend', weatherWidget);
      
      // Add event listener to refresh button
      const refreshButton = weatherWidget.querySelector('.refresh-button');
      if (refreshButton) {
        refreshButton.addEventListener('click', function(e) {
          e.preventDefault();
          loadWeatherData();
        });
      }
      
      return weatherWidget;
    }
    
    // Initialize weather functionality
    function initWeather() {
      const weatherWidget = createWeatherWidget();
      if (!weatherWidget) return;
      
      loadWeatherData();
    }
    
    // Load weather data
    function loadWeatherData() {
      const weatherWidget = document.getElementById('weather-widget');
      if (!weatherWidget) return;
      
      // Show loading state
      weatherWidget.innerHTML = `
        <div class="weather-content">
          <h2 class="weather-title">
            Weather
            <button class="refresh-button" title="Refresh weather">
              <svg class="refresh-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
              </svg>
            </button>
          </h2>
          <div class="weather-loading">
            <div class="loading-spinner"></div>
            Loading weather data...
          </div>
        </div>
        <div class="weather-animation"></div>
      `;
      
      // Re-add event listener to refresh button
      const refreshButton = weatherWidget.querySelector('.refresh-button');
      if (refreshButton) {
        refreshButton.addEventListener('click', function(e) {
          e.preventDefault();
          loadWeatherData();
        });
      }
      
      // Try to get cached location first
      const cachedLocationKey = localStorage.getItem('weatherLocationKey');
      
      if (cachedLocationKey) {
        // Use cached location
        getCurrentWeather(cachedLocationKey);
      } else {
        // Get user's location
        getUserLocation();
      }
    }
    
    // Get user's location
    function getUserLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            getLocationKey(latitude, longitude);
          },
          error => {
            console.error('Geolocation error:', error);
            // Use Winter Park, Florida as default
            getLocationKey(28.5999, -81.3392);
          },
          { timeout: 10000 }
        );
      } else {
        console.error('Geolocation not supported');
        // Use Winter Park, Florida as default
        getLocationKey(28.5999, -81.3392);
      }
    }
    
    // Get location key from AccuWeather API
    function getLocationKey(latitude, longitude) {
      const url = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${API_KEY}&q=${latitude},${longitude}`;
      
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          const locationKey = data.Key;
          const locationName = data.LocalizedName;
          const adminArea = data.AdministrativeArea?.LocalizedName || '';
          
          // Save location info to localStorage
          localStorage.setItem('weatherLocationKey', locationKey);
          localStorage.setItem('weatherLocationName', locationName);
          localStorage.setItem('weatherLocationAdmin', adminArea);
          
          // Get current weather
          getCurrentWeather(locationKey);
          
          // Get forecast
          getForecast(locationKey);
        })
        .catch(error => {
          console.error('Error getting location key:', error);
          displayWeatherError();
          
          // Try to use cached location if available
          const cachedLocationKey = localStorage.getItem('weatherLocationKey');
          if (cachedLocationKey) {
            getCurrentWeather(cachedLocationKey);
            getForecast(cachedLocationKey);
          }
        });
    }
    
    // Get current weather data
    function getCurrentWeather(locationKey) {
      const url = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${API_KEY}&details=true`;
      
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data && data.length > 0) {
            const currentWeather = data[0];
            
            // Cache weather data
            localStorage.setItem('weatherData', JSON.stringify({
              data: currentWeather,
              timestamp: Date.now()
            }));
            
            // Display weather data
            displayWeatherData(currentWeather);
          }
        })
        .catch(error => {
          console.error('Error getting current weather:', error);
          
          // Try to use cached weather data
          const cachedWeather = localStorage.getItem('weatherData');
          if (cachedWeather) {
            try {
              const weatherData = JSON.parse(cachedWeather);
              // Only use cached data if it's less than 2 hours old
              if (Date.now() - weatherData.timestamp < 7200000) {
                displayWeatherData(weatherData.data);
                return;
              }
            } catch (e) {
              console.error('Error parsing cached weather data:', e);
            }
          }
          
          displayWeatherError();
        });
    }
    
    // Get 5-day forecast
    function getForecast(locationKey) {
      const url = `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}?apikey=${API_KEY}&metric=false`;
      
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data && data.DailyForecasts) {
            // Cache forecast data
            localStorage.setItem('weatherForecast', JSON.stringify({
              data: data,
              timestamp: Date.now()
            }));
            
            // Display forecast data
            displayForecastData(data);
          }
        })
        .catch(error => {
          console.error('Error getting forecast:', error);
          
          // Try to use cached forecast data
          const cachedForecast = localStorage.getItem('weatherForecast');
          if (cachedForecast) {
            try {
              const forecastData = JSON.parse(cachedForecast);
              // Only use cached data if it's less than 24 hours old
              if (Date.now() - forecastData.timestamp < 86400000) {
                displayForecastData(forecastData.data);
                return;
              }
            } catch (e) {
              console.error('Error parsing cached forecast data:', e);
            }
          }
        });
    }
    
    // Display weather data
    function displayWeatherData(weatherData) {
      const weatherWidget = document.getElementById('weather-widget');
      if (!weatherWidget) return;
      
      const locationName = localStorage.getItem('weatherLocationName') || 'Current Location';
      const adminArea = localStorage.getItem('weatherLocationAdmin') || '';
      const locationDisplay = adminArea ? `${locationName}, ${adminArea}` : locationName;
      
      const temperature = Math.round(weatherData.Temperature.Imperial.Value);
      const feelsLike = Math.round(weatherData.RealFeelTemperature?.Imperial.Value || temperature);
      const weatherText = weatherData.WeatherText;
      const humidity = weatherData.RelativeHumidity || 0;
      const windSpeed = Math.round(weatherData.Wind?.Speed?.Imperial?.Value || 0);
      const iconNum = weatherData.WeatherIcon < 10 ? 
        `0${weatherData.WeatherIcon}` : weatherData.WeatherIcon;
      
      // Get appropriate weather message
      const weatherMessage = getWeatherMessage(weatherData);
      
      // Determine weather type for animations (simplified)
      let weatherType = 'default';
      if (weatherData.HasPrecipitation || weatherText.toLowerCase().includes('rain') || 
          weatherText.toLowerCase().includes('shower')) {
        weatherType = 'rainy';
      } else if (weatherText.toLowerCase().includes('cloud') || 
                 weatherText.toLowerCase().includes('overcast')) {
        weatherType = 'cloudy';
      } else if (weatherText.toLowerCase().includes('sun') || 
                 weatherText.toLowerCase().includes('clear')) {
        weatherType = 'sunny';
      }
      
      // Update class for animation
      weatherWidget.className = `weather-widget ${weatherType}`;
      
      // Update content
      weatherWidget.innerHTML = `
        <div class="weather-content">
          <h2 class="weather-title">
            Weather
            <button class="refresh-button" title="Refresh weather">
              <svg class="refresh-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
              </svg>
            </button>
          </h2>
          <div class="weather-location">
            <svg class="location-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${locationDisplay}
          </div>
          <div class="weather-main">
            <div class="weather-temp-container">
              <div class="weather-temp">
                <img src="https://developer.accuweather.com/sites/default/files/${iconNum}-s.png" class="weather-icon" alt="${weatherText}">
                ${temperature}°F
              </div>
              <div class="weather-condition">${weatherText}</div>
            </div>
          </div>
          
          <div class="weather-message">${weatherMessage}</div>
          
          <div class="weather-details">
            <div class="weather-detail-item">
              <svg class="detail-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
              </svg>
              Feels like: <span class="detail-value">${feelsLike}°F</span>
            </div>
            <div class="weather-detail-item">
              <svg class="detail-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
              </svg>
              Humidity: <span class="detail-value">${humidity}%</span>
            </div>
            <div class="weather-detail-item">
              <svg class="detail-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path>
                <path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path>
                <path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path>
              </svg>
              Wind: <span class="detail-value">${windSpeed} mph</span>
            </div>
          </div>
          <div class="forecast-row" id="forecast-container">
            <!-- Forecast will be dynamically added here -->
          </div>
        </div>
        <div class="weather-animation"></div>
      `;
      
      // Re-add event listener to refresh button
      const refreshButton = weatherWidget.querySelector('.refresh-button');
      if (refreshButton) {
        refreshButton.addEventListener('click', function(e) {
          e.preventDefault();
          loadWeatherData();
        });
      }
    }
    
    // Display forecast data
    function displayForecastData(forecastData) {
      const forecastContainer = document.getElementById('forecast-container');
      if (!forecastContainer || !forecastData.DailyForecasts) return;
      
      // Get the next 3 days' forecast
      const forecastDays = forecastData.DailyForecasts.slice(1, 4);
      
      // Clear existing forecast
      forecastContainer.innerHTML = '';
      
      // Add each day's forecast
      forecastDays.forEach(day => {
        const date = new Date(day.Date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const maxTemp = Math.round(day.Temperature.Maximum.Value);
        const iconNum = day.Day.Icon < 10 ? `0${day.Day.Icon}` : day.Day.Icon;
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
          <div class="forecast-day">${dayName}</div>
          <img src="https://developer.accuweather.com/sites/default/files/${iconNum}-s.png" class="forecast-icon" alt="${day.Day.IconPhrase}">
          <div class="forecast-temp">${maxTemp}°</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
      });
    }
    
    // Display weather error
    function displayWeatherError() {
      const weatherWidget = document.getElementById('weather-widget');
      if (!weatherWidget) return;
      
      // Update content to show error
      weatherWidget.innerHTML = `
        <div class="weather-content">
          <h2 class="weather-title">
            Weather
            <button class="refresh-button" title="Refresh weather">
              <svg class="refresh-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
              </svg>
            </button>
          </h2>
          <div class="weather-error">
            Unable to fetch weather data. Please try again later.
          </div>
        </div>
        <div class="weather-animation"></div>
      `;
      
      // Re-add event listener to refresh button
      const refreshButton = weatherWidget.querySelector('.refresh-button');
      if (refreshButton) {
        refreshButton.addEventListener('click', function(e) {
          e.preventDefault();
          loadWeatherData();
        });
      }
    }
    
    // Initialize the weather widget
    initWeather();
    
    // Update weather every hour
    setInterval(loadWeatherData, 3600000);
  });