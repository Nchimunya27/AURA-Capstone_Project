/**
 * Settings Page Functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const sections = document.querySelectorAll('.settings-section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active section
            sections.forEach(section => {
                if (section.id === tabId) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
            
            // Initialize analytics if analytics tab is selected
            if (tabId === 'overall-analytics' && typeof initializeAnalytics === 'function') {
                // Add a slight delay to ensure the tab content is visible
                setTimeout(initializeAnalytics, 100);
            }
        });
    });

    // === THEME MANAGEMENT ===
    const themeModeRadios = document.querySelectorAll('input[name="themeMode"]');
        
    // Apply current theme (should also match the checked radio button)
    const currentTheme = localStorage.getItem('theme') || 'day';
    document.documentElement.setAttribute('data-theme', currentTheme);
    console.log('Initial theme set to: ' + currentTheme);

    // Set the correct radio button based on current theme
    const radioToCheck = document.getElementById(currentTheme + 'Mode');
    if (radioToCheck) {
      radioToCheck.checked = true;
      console.log('Set checked radio to: ' + currentTheme + 'Mode');
    } else {
      console.log('Could not find radio for theme: ' + currentTheme);
    }

    // Add change listeners to radio buttons
    themeModeRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        // Get selected theme (day or night)
        const theme = this.value;
        console.log('Theme changed to: ' + theme);
        
        // Apply theme by setting attribute on <html> element
        document.documentElement.setAttribute('data-theme', theme);
        
        // Save preference for future visits
        localStorage.setItem('theme', theme);
        
        // Update charts if we're on the analytics tab
        if (document.getElementById('overall-analytics') && 
            document.getElementById('overall-analytics').classList.contains('active') &&
            typeof Chart !== 'undefined') {
            updateChartsForTheme(theme);
        }
      });
    });
    
    // Form submission handling
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', function() {
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            
            // Save user data
            localStorage.setItem('user_firstName', firstName);
            localStorage.setItem('user_lastName', lastName);
            localStorage.setItem('user_email', email);
            
            console.log('Saving user data:', { firstName, lastName, email });
            alert('Changes saved successfully!');
        });
    }
    
    // Load saved user data if available
    const loadSavedUserData = () => {
        const firstName = localStorage.getItem('user_firstName');
        const lastName = localStorage.getItem('user_lastName');
        const email = localStorage.getItem('user_email');
        
        if (firstName) document.getElementById('firstName').value = firstName;
        if (lastName) document.getElementById('lastName').value = lastName;
        if (email) document.getElementById('email').value = email;
    };
    
    // Call function to load user data
    loadSavedUserData();
    
    // Password change handling
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            const currentPassword = prompt('Enter your current password:');
            if (!currentPassword) return;
            
            const newPassword = prompt('Enter your new password:');
            if (!newPassword) return;
            
            const confirmPassword = prompt('Confirm your new password:');
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match. Please try again.');
                return;
            }
            
            console.log('Password change requested');
            alert('Password changed successfully!');
        });
    }

    // === PROFILE PICTURE UPLOAD ===
    const fileInput = document.getElementById('profilePictureUpload');
    const profileImage = document.querySelector('.profile-preview');
    const sidebarAvatar = document.querySelector('.user-avatar'); // Sidebar profile image
    const chooseButton = document.querySelector('.upload-btn');
    
    // Function to update profile pictures
    const updateProfilePictures = (imageUrl) => {
        // Update the settings page profile image
        if (profileImage) {
            profileImage.src = imageUrl;
        }
        
        // Update the sidebar avatar
        if (sidebarAvatar) {
            sidebarAvatar.src = imageUrl;
        }
    };
    
    // Load saved profile picture if available
    const loadSavedProfilePicture = () => {
        const savedImage = localStorage.getItem('profilePicture');
        if (savedImage) {
            updateProfilePictures(savedImage);
            console.log('Loaded saved profile picture');
        }
    };
    
    // Call function to load saved profile picture
    loadSavedProfilePicture();
    
    if (fileInput && (profileImage || sidebarAvatar) && chooseButton) {
        // Listen for change events on the file input
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            
            // Check if a file was selected
            if (file) {
                // Validate file type
                if (!file.type.match('image.*')) {
                    alert('Please select an image file (JPEG, PNG, or GIF).');
                    return;
                }
                
                // Validate file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('Please select an image less than 2MB in size.');
                    return;
                }
                
                // Create a FileReader to read the image
                const reader = new FileReader();
                
                // Set up the FileReader onload event
                reader.onload = function(loadEvent) {
                    const imageUrl = loadEvent.target.result;
                    
                    // Update both profile pictures
                    updateProfilePictures(imageUrl);
                    
                    // Save the image to localStorage for persistence
                    try {
                        localStorage.setItem('profilePicture', imageUrl);
                        console.log('Profile picture saved to localStorage');
                    } catch (e) {
                        console.error('Failed to save profile picture to localStorage:', e);
                        alert('Your image was loaded but could not be saved for future sessions (it might be too large).');
                    }
                    
                    // Optional: Show a success message
                    const hint = document.querySelector('.upload-hint');
                    if (hint) {
                        hint.textContent = 'Image selected: ' + file.name;
                        hint.style.color = 'green';
                    }
                };
                
                // Read the image file as a data URL
                reader.readAsDataURL(file);
            }
        });
        
        // Make the button click trigger the file input
        chooseButton.addEventListener('click', function(event) {
            event.preventDefault();
            fileInput.click();
        });
    }
});

/**
 * Function to update chart colors when theme changes
 */
function updateChartsForTheme(theme) {
    if (typeof Chart === 'undefined') return;
    
    // Find all charts on the page
    const charts = Object.values(Chart.instances);
    if (charts.length === 0) return;

    charts.forEach(chart => {
        // Update the chart with new theme colors
        chart.update();
    });
    
    // Update heatmap colors if it exists
    const heatmapContainer = document.getElementById('activityHeatmap');
    if (heatmapContainer) {
        const hourBlocks = heatmapContainer.querySelectorAll('.hour-block');
        hourBlocks.forEach(block => {
            const style = block.getAttribute('style');
            if (style) {
                const newStyle = theme === 'night'
                    ? style.replace('rgba(89, 151, 172,', 'rgba(123, 181, 245,')
                    : style.replace('rgba(123, 181, 245,', 'rgba(89, 151, 172,');
                block.setAttribute('style', newStyle);
            }
        });
    }
}