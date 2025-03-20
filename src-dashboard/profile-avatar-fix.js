/**
 * Emergency profile picture fix script
 * This can be included at the very top of your HTML to immediately fix avatar issues
 */

// Run immediately when the script is loaded
(function() {
    // Try to fix the avatar as early as possible
    function fixDefaultAvatar() {
        // Get all user avatar elements
        const avatars = document.querySelectorAll('.user-avatar');
        if (avatars.length === 0) return false;
        
        // Check if we have a stored profile picture
        const savedPicture = localStorage.getItem('profilePicture');
        if (!savedPicture) return false;
        
        // Replace all default avatars
        let replaced = false;
        avatars.forEach(avatar => {
            if (!avatar.src || avatar.src.includes('default_avatar.svg')) {
                avatar.src = savedPicture;
                replaced = true;
            }
        });
        
        return replaced;
    }

    // First attempt - immediately when script loads
    let fixed = fixDefaultAvatar();

    // Second attempt - when DOM is starting to be parsed
    document.addEventListener('DOMContentLoaded', function() {
        if (!fixed) fixed = fixDefaultAvatar();
        
        // Set up mutation observer to catch any avatars that might be added later
        if (window.MutationObserver) {
            const observer = new MutationObserver(function(mutations) {
                let needsCheck = false;
                
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length) {
                        needsCheck = true;
                    }
                });
                
                if (needsCheck) {
                    fixDefaultAvatar();
                }
            });
            
            // Start observing
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    });

    // Final attempt - after everything is loaded
    window.addEventListener('load', function() {
        fixDefaultAvatar();
    });
    
    // Schedule repeated checks for the first few seconds
    for (let i = 1; i <= 5; i++) {
        setTimeout(fixDefaultAvatar, i * 200);
    }
})();