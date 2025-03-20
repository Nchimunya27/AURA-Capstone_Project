/**
 * Combined Profile Picture and Username Manager
 * Handles profile picture loading/saving and username display across pages
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Profile Manager initialized');
  
  // Immediately intercept the default avatar
  // This needs to run as early as possible, even before other DOM operations
  (function() {
      const defaultAvatarCheck = function() {
          const avatarElement = document.querySelector('.user-avatar');
          if (avatarElement && avatarElement.src && avatarElement.src.includes('default_avatar.svg')) {
              console.log('Default avatar detected, checking for saved profile picture...');
              
              // Try to get profile picture from localStorage first (fastest)
              const savedProfilePic = localStorage.getItem('profilePicture');
              if (savedProfilePic) {
                  console.log('Found profile picture in localStorage, applying immediately');
                  avatarElement.src = savedProfilePic;
              }
          }
      };
      
      // Run immediately and also after a small delay to catch late-loaded images
      defaultAvatarCheck();
      setTimeout(defaultAvatarCheck, 10);
  })();
  
  // Get all profile picture elements
  const profileElements = {
    // Sidebar avatar (present on all pages)
    sidebarAvatar: document.querySelector('.user-avatar'),
    
    // Settings page preview (only on settings page)
    profilePreview: document.querySelector('.profile-preview'),
    
    // Any other profile pictures across the site
    otherAvatars: document.querySelectorAll('.user-profile-image, .profile-icon')
  };

  // Get username elements
  const usernameElements = {
    userNameElement: document.querySelector('.user-name'),
    welcomeTextElement: document.querySelector('.welcome-text')
  };
  
  /**
   * Apply a profile picture to all relevant elements
   * @param {string} imageUrl - The data URL or source URL for the profile image
   */
  function applyProfilePicture(imageUrl) {
    console.log('Applying profile picture to all elements');
    
    // Force immediate avatar update for all user-avatar elements
    // This ensures we catch any elements that might have been missed or dynamically added
    document.querySelectorAll('.user-avatar').forEach(avatar => {
      // Only replace if it's the default avatar or already a profile picture
      if (avatar.src.includes('default_avatar.svg') || 
          avatar.src.includes('data:image') || 
          avatar === profileElements.sidebarAvatar) {
        avatar.src = imageUrl;
      }
    });
    
    // Update sidebar avatar (most important, present on all pages)
    if (profileElements.sidebarAvatar) {
      profileElements.sidebarAvatar.src = imageUrl;
      
      // Add a subtle animation to show the change
      profileElements.sidebarAvatar.style.transition = 'transform 0.3s ease-in-out';
      profileElements.sidebarAvatar.style.transform = 'scale(1.1)';
      
      setTimeout(() => {
        profileElements.sidebarAvatar.style.transform = 'scale(1)';
      }, 300);
    }
    
    // Update settings page preview if it exists
    if (profileElements.profilePreview) {
      profileElements.profilePreview.src = imageUrl;
    }
    
    // Update any other avatar elements
    if (profileElements.otherAvatars.length > 0) {
      profileElements.otherAvatars.forEach(avatar => {
        avatar.src = imageUrl;
      });
    }
  }
  
  /**
   * Load the profile picture from various storage mechanisms
   * Using multiple fallbacks for better persistence
   */
  function loadProfilePicture() {
    console.log('Loading profile picture');
    
    // First, try to get from localStorage (fastest)
    const localStorageImage = localStorage.getItem('profilePicture');
    if (localStorageImage) {
      console.log('Profile picture found in localStorage');
      applyProfilePicture(localStorageImage);
      return;
    }
    
    // Next, try IndexedDB if available (better for larger images)
    if (window.indexedDB) {
      loadProfileFromIndexedDB()
        .then(imageUrl => {
          if (imageUrl) {
            console.log('Profile picture found in IndexedDB');
            applyProfilePicture(imageUrl);
            
            // Also save to localStorage for faster future loading
            try {
              localStorage.setItem('profilePicture', imageUrl);
            } catch (e) {
              console.warn('Could not save large image to localStorage:', e);
            }
          }
        })
        .catch(error => {
          console.error('Error loading profile from IndexedDB:', error);
        });
    }
  }
  
  /**
   * Load profile picture from IndexedDB
   * @returns {Promise<string>} A promise that resolves to the image URL or null
   */
  function loadProfileFromIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AuraProfileDB', 1);
      
      request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.error);
        resolve(null); // Resolve with null on error to continue the chain
      };
      
      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('profilePictures')) {
          db.createObjectStore('profilePictures', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = function(event) {
        const db = event.target.result;
        try {
          const transaction = db.transaction('profilePictures', 'readonly');
          const store = transaction.objectStore('profilePictures');
          const getRequest = store.get('current');
          
          getRequest.onsuccess = function(event) {
            const result = event.target.result;
            resolve(result ? result.imageUrl : null);
          };
          
          getRequest.onerror = function(event) {
            console.error('Error getting profile picture:', event.target.error);
            resolve(null);
          };
        } catch (e) {
          console.error('Transaction error:', e);
          resolve(null);
        }
      };
    });
  }
  
  /**
   * Save profile picture to IndexedDB
   * @param {string} imageUrl - The data URL of the image
   * @returns {Promise<boolean>} Whether the save was successful
   */
  function saveProfileToIndexedDB(imageUrl) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AuraProfileDB', 1);
      
      request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
      
      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('profilePictures')) {
          db.createObjectStore('profilePictures', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = function(event) {
        const db = event.target.result;
        try {
          const transaction = db.transaction('profilePictures', 'readwrite');
          const store = transaction.objectStore('profilePictures');
          
          // Add/update the current profile picture
          const storeRequest = store.put({
            id: 'current',
            imageUrl: imageUrl,
            timestamp: Date.now()
          });
          
          storeRequest.onsuccess = function() {
            console.log('Successfully saved profile picture to IndexedDB');
            resolve(true);
          };
          
          storeRequest.onerror = function(event) {
            console.error('Error saving profile picture:', event.target.error);
            reject(event.target.error);
          };
        } catch (e) {
          console.error('Transaction error:', e);
          reject(e);
        }
      };
    });
  }
  
  /**
   * Set up profile picture upload on the settings page
   */
  function setupProfileUpload() {
    const fileInput = document.getElementById('profilePictureUpload');
    const chooseButton = document.querySelector('.upload-btn');
    
    if (!fileInput || !chooseButton) {
      return; // Not on the settings page or elements not found
    }
    
    // Make sure the Choose button triggers the file input
    chooseButton.addEventListener('click', function(e) {
      e.preventDefault();
      fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Validate file
      if (!file.type.match('image.*')) {
        alert('Please select an image file (JPEG, PNG, or GIF).');
        return;
      }
      
      // Create a FileReader to read the image
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const imageUrl = e.target.result;
        
        // Apply the new profile picture to all elements
        applyProfilePicture(imageUrl);
        
        // Save to localStorage for persistence (try/catch in case it's too large)
        try {
          localStorage.setItem('profilePicture', imageUrl);
          console.log('Profile picture saved to localStorage');
        } catch (error) {
          console.warn('Failed to save to localStorage (likely too large):', error);
        }
        
        // Also save to IndexedDB for better large image support
        saveProfileToIndexedDB(imageUrl)
          .then(() => {
            console.log('Profile picture saved to IndexedDB');
            
            // Update the upload hint
            const hint = document.querySelector('.upload-hint');
            if (hint) {
              hint.textContent = 'Image selected: ' + file.name;
              hint.style.color = 'green';
            }
          })
          .catch(error => {
            console.error('Failed to save to IndexedDB:', error);
            alert('Your profile picture was applied but could not be saved for future sessions.');
          });
      };
      
      // Read the file as a data URL
      reader.readAsDataURL(file);
    });
  }

  /**
   * Update username display across all elements
   */
  function updateUsername() {
    console.log("Username update running...");
    
    // Get username from localStorage
    const username = localStorage.getItem('currentUsername');
    console.log("Username from localStorage:", username);
    
    // Update the sidebar username
    if (usernameElements.userNameElement) {
      console.log("Found user-name element:", usernameElements.userNameElement.textContent);
      
      // Always update and show, even if no username
      if (username) {
        usernameElements.userNameElement.textContent = username;
      } else {
        usernameElements.userNameElement.textContent = "User";
      }
      
      // Ensure visibility
      usernameElements.userNameElement.classList.add('username-loaded');
    } else {
      console.log("Could not find .user-name element");
    }
    
    // Update the welcome message
    if (usernameElements.welcomeTextElement) {
      console.log("Found welcome-text element:", usernameElements.welcomeTextElement.textContent);
      
      // Always update and show, even if no username
      if (username) {
        usernameElements.welcomeTextElement.textContent = `Welcome back, ${username}!`;
      } else {
        usernameElements.welcomeTextElement.textContent = "Welcome back!";
      }
      
      // Ensure visibility
      usernameElements.welcomeTextElement.classList.add('username-loaded');
    } else {
      console.log("Could not find .welcome-text element");
    }
    
    // Force visibility if needed
    setTimeout(function() {
      if (usernameElements.userNameElement) {
        usernameElements.userNameElement.style.opacity = "1";
        usernameElements.userNameElement.style.visibility = "visible";
      }
      if (usernameElements.welcomeTextElement) {
        usernameElements.welcomeTextElement.style.opacity = "1";
        usernameElements.welcomeTextElement.style.visibility = "visible";
      }
    }, 300);
  }

  // Try to get username from localStorage or Supabase
  function initializeUsername() {
    const storedUsername = localStorage.getItem('currentUsername');
    
    // If we have a stored username, use it right away
    if (storedUsername) {
      updateUsername();
    }
    
    // Try to get from Supabase if it's available
    if (typeof supabaseClient !== 'undefined') {
      supabaseClient.auth.getSession().then(({ data: { session }, error: sessionError }) => {
        if (sessionError || !session) {
          console.log('No active Supabase session, using localStorage username');
          updateUsername();
          return;
        }
        
        // We have a session, get the user profile
        const userId = session.user.id;
        supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
          .then(({ data: profile, error: profileError }) => {
            if (profileError || !profile) {
              console.error('Error fetching profile:', profileError);
              updateUsername();
              return;
            }
            
            // Determine display name from profile data
            let displayName;
            if (profile.full_name) {
              displayName = profile.full_name;
            } else if (profile.first_name && profile.last_name) {
              displayName = `${profile.first_name} ${profile.last_name}`;
            } else if (profile.username) {
              displayName = profile.username;
            } else {
              displayName = localStorage.getItem('currentUsername') || 'User';
            }
            
            // Update localStorage for other pages
            localStorage.setItem('currentUsername', displayName);
            
            // Update UI
            updateUsername();
          });
      });
    } else {
      // No Supabase, just use localStorage
      updateUsername();
    }
  }
  
  // Set up synchronization between pages using the storage event
  window.addEventListener('storage', function(event) {
    if (event.key === 'profilePicture' && event.newValue) {
      console.log('Profile picture updated in another tab, syncing...');
      applyProfilePicture(event.newValue);
    }
    
    if (event.key === 'currentUsername') {
      console.log('Username updated in another tab, syncing...');
      updateUsername();
    }
  });
  
  // Initialize everything
  loadProfilePicture(); // Load profile picture
  initializeUsername(); // Load username
  setupProfileUpload(); // Set up upload if on settings page
  
  // Run the username update multiple times to ensure it shows
  setTimeout(updateUsername, 100);
  
  // Additional profile picture monitoring
  // This helps catch any situations where the default avatar might appear after initial load
  window.addEventListener('load', function() {
      updateUsername();
      
      // Final check for default avatar
      const userAvatars = document.querySelectorAll('.user-avatar');
      userAvatars.forEach(avatar => {
          if (avatar.src.includes('default_avatar.svg')) {
              const savedProfile = localStorage.getItem('profilePicture');
              if (savedProfile) {
                  console.log('Fixing default avatar on window load');
                  avatar.src = savedProfile;
              }
          }
      });
      
      // Set up mutation observer to catch dynamically added user avatars
      const observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
              if (mutation.addedNodes.length) {
                  mutation.addedNodes.forEach(function(node) {
                      if (node.nodeType === 1) { // Element node
                          // Check if it's a user avatar or contains one
                          const avatar = node.classList && node.classList.contains('user-avatar') ? 
                              node : node.querySelector('.user-avatar');
                          
                          if (avatar && avatar.src && avatar.src.includes('default_avatar.svg')) {
                              const savedProfile = localStorage.getItem('profilePicture');
                              if (savedProfile) {
                                  console.log('Fixing dynamically added default avatar');
                                  avatar.src = savedProfile;
                              }
                          }
                      }
                  });
              }
          });
      });
      
      // Observe the entire document for changes
      observer.observe(document.body, {
          childList: true,
          subtree: true
      });
  });
});