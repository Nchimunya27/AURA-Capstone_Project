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
        const firstName = localStorage.getItem('user_firstName');
        const lastName = localStorage.getItem('user_lastName');
        
        if (firstName && lastName) {
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement) {
                userNameElement.textContent = firstName + ' ' + lastName;
            }
        }
    };
    
    // Execute common functions
    loadProfilePicture();
    applyCurrentTheme();
    updateUserInfo();
});