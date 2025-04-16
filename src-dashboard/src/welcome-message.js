// Dynamic Welcome Message functionality
document.addEventListener('DOMContentLoaded', function() {
    // Immediately hide the welcome text to prevent the default from showing
    const welcomeTextElement = document.querySelector('.welcome-text');
    if (welcomeTextElement) {
      // Hide it right away
      welcomeTextElement.style.opacity = "0";
      welcomeTextElement.style.visibility = "hidden";
      // Mark it as being handled by our script
      welcomeTextElement.setAttribute('data-dynamic-greeting', 'initializing');
    }
  
    // Array of morning greetings
    const morningGreetings = [
      "Rise and Revise",
      "That early morning aura",
      "Ahh yes, the smell of aura in the morning",
      "Ready to go?",
      "1..2..3…AURA",
      "Let's build that brain power",
      "Another day to chase those dreams",
      "You radiate productive aura",
      "It's giving…productive",
      "Wake up…Coffee..AURA..Repeat"
    ];
    
    // Array of afternoon greetings
    const afternoonGreetings = [
      "Lock in or tweak out",
      "Let's guac in",
      "So much aura…",
      "Keep stacking those wins",
      "You're on your afternoon arc",
      "What if I throw a microwave at you?",
      "Time for lunch…or NOT…",
      "You don't take time to chomp?"
    ];
    
    // Array of evening/night greetings
    const nightGreetings = [
      "Time to chill..",
      "You're a night scholar",
      "Don't forget to sleep eventually",
      "The night aura is hitting",
      "1 million aura points for logging in at this hour",
      "Hellur night owl",
      "At the midnight hour…all is quiet",
      "On big E it's time to sleep",
      "All quiet on the western front…"
    ];
    
    // Function to get a random greeting from an array
    function getRandomGreeting(greetings) {
      const randomIndex = Math.floor(Math.random() * greetings.length);
      return greetings[randomIndex];
    }
    
    // Function to determine time of day and return appropriate greeting
    function getTimeBasedGreeting() {
      const currentHour = new Date().getHours();
      let username = localStorage.getItem('currentUsername') || '';
      
      // Decide randomly whether to include the username
      const includeUsername = Math.random() > 0.3; // 70% chance to include username
      
      let greeting;
      
      if (currentHour >= 5 && currentHour < 12) {
        greeting = getRandomGreeting(morningGreetings);
      } else if (currentHour >= 12 && currentHour < 18) {
        greeting = getRandomGreeting(afternoonGreetings);
      } else {
        greeting = getRandomGreeting(nightGreetings);
      }
      
      // If we have a username and randomly decided to include it
      if (username && includeUsername) {
        // Decide between different formats for adding the username
        const formatChoice = Math.floor(Math.random() * 3);
        
        switch(formatChoice) {
          case 0:
            // Format: "Greeting, username!"
            return `${greeting}, ${username}!`;
          case 1:
            // Format: "Greeting username!"
            return `${greeting} ${username}!`;
          case 2:
            // Format: "username, Greeting"
            return `${username}, ${greeting}!`;
        }
      }
      
      // Just return the greeting with an exclamation mark
      return `${greeting}!`;
    }
    
    // Function to update welcome text with typing animation
    function updateWelcomeText() {
      const welcomeTextElement = document.querySelector('.welcome-text');
      
      if (welcomeTextElement) {
        // Get a greeting based on time of day
        const greeting = getTimeBasedGreeting();
        
        // Reset the animation by removing and re-adding the element
        const parentElement = welcomeTextElement.parentNode;
        const oldElement = welcomeTextElement;
        
        // Create new element with the same classes
        const newElement = document.createElement('div');
        newElement.className = 'welcome-text username-loaded';
        newElement.textContent = greeting;
        newElement.setAttribute('data-dynamic-greeting', 'active');
        
        // Replace the old element with the new one
        parentElement.replaceChild(newElement, oldElement);
      }
    }
    
    // Disable the original updateUsername function that would change our welcome message
    (function() {
      // Find and modify the original script
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].textContent && scripts[i].textContent.includes('updateUsername')) {
          // Found the script that contains updateUsername
          window.originalUpdateUsername = window.updateUsername;
          window.updateUsername = function() {
            console.log("Modified username update running...");
            
            // Get username from localStorage
            const username = localStorage.getItem('currentUsername');
            console.log("Username from localStorage:", username);
            
            // Get the elements
            const userNameElement = document.querySelector('.user-name');
            
            if (userNameElement) {
              console.log("Found user-name element:", userNameElement.textContent);
              
              // Always update and show, even if no username
              if (username) {
                userNameElement.textContent = username;
              }
              userNameElement.classList.add('username-loaded');
            } else {
              console.log("Could not find .user-name element");
            }
            
            // Skip updating the welcome text - our script will handle it
          };
          
          break;
        }
      }
    })();
    
    // Wait a bit to ensure the page is loaded
    setTimeout(function() {
      // Call our function to update the welcome message
      updateWelcomeText();
    }, 300);
    
    // Update the greeting every 30 minutes or when the page is refreshed
    setInterval(updateWelcomeText, 1800000);
  });