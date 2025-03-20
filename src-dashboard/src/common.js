/**
 * Common JavaScript functionality shared across all pages
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load and apply profile picture from localStorage
    const loadProfilePicture = () => {
        const savedImage = localStorage.getItem('profilePicture');
        if (savedImage) {
            // Find the sidebar avatar on every page
            const sidebarAvatar = document.querySelector('.user-avatar');
            if (sidebarAvatar) {
                sidebarAvatar.src = savedImage;
                console.log('Loaded profile picture on page');
            }
        }
    };
    
    // Apply current theme from localStorage
    const applyCurrentTheme = () => {
        const currentTheme = localStorage.getItem('theme') || 'day';
        document.documentElement.setAttribute('data-theme', currentTheme);
    };
    
    // Update username in sidebar if available
    const updateUserInfo = () => {
        // First priority: Check for username from login
        const username = localStorage.getItem('currentUsername');
        
        if (username) {
            // Update sidebar username
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement) {
                userNameElement.textContent = username;
            }
            
            // Update welcome message if it exists
            const welcomeTextElement = document.querySelector('.welcome-text');
            if (welcomeTextElement) {
                welcomeTextElement.textContent = `Welcome back, ${username}!`;
            }
        } 
        // Fallback to first name + last name if username not found
        else {
            const firstName = localStorage.getItem('user_firstName');
            const lastName = localStorage.getItem('user_lastName');
            
            if (firstName && lastName) {
                const userNameElement = document.querySelector('.user-name');
                if (userNameElement) {
                    userNameElement.textContent = firstName + ' ' + lastName;
                }
                
                // Update welcome message if it exists
                const welcomeTextElement = document.querySelector('.welcome-text');
                if (welcomeTextElement) {
                    welcomeTextElement.textContent = `Welcome back, ${firstName}!`;
                }
            }
        }
    };
    
    // Setup logout functionality
    const setupLogout = () => {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', function() {
                // Clear username
                localStorage.removeItem('currentUsername');
                
                // Clear auth data
                localStorage.removeItem('supabase.auth.token');
                localStorage.removeItem('user_id');
                localStorage.removeItem('redirect_loop_protection');
                
                // Redirect to login page
                window.location.href = '../../aura-login/login.html';
            });
        }
    };
    
    // Execute common functions
    loadProfilePicture();
    applyCurrentTheme();
    updateUserInfo();
    setupLogout();
});