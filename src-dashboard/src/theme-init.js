/**
 * theme-init.js - Add this as a separate file or at the beginning of all your JS files
 * This is a script that has to be included in order for the appearance to take effect.
 */
// Apply theme immediately on page load 
// THIS MUST RUN BEFORE THE DOM IS FULLY LOADED to prevent flickering
(function() {
    const savedTheme = localStorage.getItem('theme') || 'day';
    document.documentElement.setAttribute('data-theme', savedTheme);
  })();



  /* User session management */

// Function to check if user is logged in and load user data
async function checkUserSession() {
  try {
      // First check sessionStorage (for current session)
      let currentUser = sessionStorage.getItem('currentUser');
      if (currentUser) {
          currentUser = JSON.parse(currentUser);
      } else {
          // If not in session, check cache for remembered user
          try {
              const cache = await caches.open('aura-user-cache');
              const response = await cache.match('/currentUser');
              
              if (response) {
                  currentUser = await response.json();
              } else {
                  // If not in cache, try localStorage as last resort
                  const localData = localStorage.getItem('currentUser');
                  if (localData) {
                      currentUser = JSON.parse(localData);
                  }
              }
          } catch (error) {
              console.log('Cache retrieval failed, using localStorage', error);
              const localData = localStorage.getItem('currentUser');
              currentUser = localData ? JSON.parse(localData) : null;
          }
      }
      
      // If no user found, redirect to login page
      if (!currentUser) {
          window.location.href = 'login.html';
          return;
      }
      
      return currentUser;
  } catch (error) {
      console.error('Error checking user session:', error);
      return null;
  }
}

// Function to update UI with user information
function updateUserInterface(user) {
  // Update welcome message
  const welcomeText = document.querySelector('.welcome-text');
  if (welcomeText) {
      const greeting = user.lastVisit ? 'Welcome back, ' : 'Welcome, ';
      welcomeText.textContent = greeting + user.username + '!';
  }
  
  // Update user name in sidebar
  const userName = document.querySelector('.user-name');
  if (userName) {
      userName.textContent = user.username;
  }
  
  // Update profile picture (if exists)
  const profilePic = document.querySelector('.user-avatar');
  if (profilePic) {
      if (user.profilePicture) {
          profilePic.src = user.profilePicture;
      } else {
          // Set default profile picture
          profilePic.src = 'default_avatar.svg';
      }
  }
  
  // Record this visit time
  updateLastVisitTime(user);
}

// Update the user's last visit time
async function updateLastVisitTime(user) {
  // Update the last visit time
  user.lastVisit = user.lastLogin || new Date().toISOString();
  user.lastLogin = new Date().toISOString();
  
  // Save the updated user information
  try {
      if (user.remembered) {
          // Save to cache
          try {
              const cache = await caches.open('aura-user-cache');
              await cache.put('/currentUser', new Response(JSON.stringify(user)));
          } catch (error) {
              console.log('Cache storage failed, using localStorage', error);
              localStorage.setItem('currentUser', JSON.stringify(user));
          }
      } else {
          // Just update session storage
          sessionStorage.setItem('currentUser', JSON.stringify(user));
      }
  } catch (error) {
      console.error('Error updating last visit time:', error);
  }
}

// Initialize theme preference
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
      // Default to day mode
      document.documentElement.setAttribute('data-theme', 'day');
  }
}

// Run initialization when document is ready
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize theme
  initTheme();
  
  // Check user session and update UI
  const currentUser = await checkUserSession();
  if (currentUser) {
      updateUserInterface(currentUser);
  }
});