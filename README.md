# AURA-Capstone_Project

## Setup Instructions

### API Keys Configuration

This project uses API keys that need to be configured before use. **Never commit your actual API keys to the repository.**

#### OpenAI API Key

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Replace `YOUR_SECRET_KEY_HERE` in the following files:
   - `src-dashboard/src/flashcard-generator.js` (line 4)
   - `src-dashboard/src/upload.js` (line 9)

#### AccuWeather API Key (Optional)

1. Get your API key from [AccuWeather Developer](https://developer.accuweather.com/)
2. Replace the API key in:
   - `src-dashboard/src/weather-widget.js` (line 4)
   - `src-dashboard/src/weather-api.js` (line 4)

### Security Notes

- All API keys have been replaced with placeholders (`YOUR_SECRET_KEY_HERE`)
- The `.gitignore` file is configured to exclude `.env` files and other sensitive data
- Always use environment variables or secure storage for production deployments