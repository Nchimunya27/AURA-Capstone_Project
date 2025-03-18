/* handles the profile pictures being cached */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile Picture Manager initialized');
    
    // Get all profile picture elements
    const profileElements = {
      // Sidebar avatar (present on all pages)
      sidebarAvatar: document.querySelector('.user-avatar'),
      
      // Settings page preview (only on settings page)
      profilePreview: document.querySelector('.profile-preview'),
      
      // Any other profile pictures across the site
      otherAvatars: document.querySelectorAll('.user-profile-image, .profile-icon')
    };
    
    /**
     * Apply a profile picture to all relevant elements
     * @param {string} imageUrl - The data URL or source URL for the profile image
     */
    function applyProfilePicture(imageUrl) {
      console.log('Applying profile picture to all elements');
      
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
    
    // Set up synchronization between pages using the storage event
    window.addEventListener('storage', function(event) {
      if (event.key === 'profilePicture' && event.newValue) {
        console.log('Profile picture updated in another tab, syncing...');
        applyProfilePicture(event.newValue);
      }
    });
    
    // Initialize
    loadProfilePicture(); // Load on every page
    setupProfileUpload(); // Set up upload if on settings page
  });