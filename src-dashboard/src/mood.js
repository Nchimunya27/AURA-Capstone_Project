// Mood Widget
document.addEventListener('DOMContentLoaded', function() {
    const track = document.getElementById('mood-track');
    const dragger = document.getElementById('mood-dragger');
    const recommendation = document.getElementById('recommendation');
    let isDragging = false;
    let startX, draggerLeft;

    // Emoji mapping based on mood level (0-100)
    const getEmoji = (value) => {
        if (value < 20) return '😢';
        if (value < 40) return '😕';
        if (value < 60) return '😐';
        if (value < 80) return '🙂';
        return '😄';
    };

    // Recommendation mapping based on mood level
    const getRecommendation = (value) => {
        if (value < 20) return "Take a break and talk to someone you trust. Remember, it's okay to not be okay.";
        if (value < 40) return "How about trying some light exercise or listening to your favorite music?";
        if (value < 60) return "You're doing alright! Consider taking a short walk to boost your mood.";
        if (value < 80) return "Great mood! Why not share your positivity with others?";
        return "Fantastic! Your positive energy can inspire those around you!";
    };

    // Initialize dragger with neutral emoji
    dragger.innerHTML = '😐';

    // Function to update mood based on position
    function updateMood(clientX) {
        const trackRect = track.getBoundingClientRect();
        let newLeft = clientX - trackRect.left;
        
        // Constrain to track bounds
        newLeft = Math.max(0, Math.min(newLeft, trackRect.width));
        
        // Convert to percentage
        const percentage = (newLeft / trackRect.width) * 100;
        
        // Update dragger position
        dragger.style.left = `${percentage}%`;
        
        // Update emoji with animation
        const newEmoji = getEmoji(percentage);
        if (dragger.innerHTML !== newEmoji) {
            dragger.classList.add('emoji-change');
            dragger.innerHTML = newEmoji;
            setTimeout(() => dragger.classList.remove('emoji-change'), 300);
        }
        
        // Update recommendation
        recommendation.textContent = getRecommendation(percentage);
        
        // Save mood to localStorage
        localStorage.setItem('currentMood', percentage);
        localStorage.setItem('lastMoodUpdate', new Date().toISOString());
    }

    // Mouse event handlers
    dragger.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX - dragger.offsetLeft;
        dragger.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        updateMood(e.clientX);
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        dragger.style.cursor = 'grab';
    });

    // Track click handler
    track.addEventListener('click', function(e) {
        updateMood(e.clientX);
    });

    // Touch event handlers
    dragger.addEventListener('touchstart', function(e) {
        isDragging = true;
        startX = e.touches[0].clientX - dragger.offsetLeft;
        dragger.style.cursor = 'grabbing';
    });

    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        updateMood(e.touches[0].clientX);
    });

    document.addEventListener('touchend', function() {
        isDragging = false;
        dragger.style.cursor = 'grab';
    });

    // Load saved mood if it exists and was set today
    const savedMood = localStorage.getItem('currentMood');
    const lastUpdate = localStorage.getItem('lastMoodUpdate');
    
    if (savedMood && lastUpdate) {
        const lastUpdateDate = new Date(lastUpdate);
        const today = new Date();
        
        if (lastUpdateDate.toDateString() === today.toDateString()) {
            dragger.style.left = `${savedMood}%`;
            dragger.innerHTML = getEmoji(parseFloat(savedMood));
            recommendation.textContent = getRecommendation(parseFloat(savedMood));
        } else {
            // Reset for new day
            dragger.style.left = '50%';
            dragger.innerHTML = '😐';
            recommendation.textContent = getRecommendation(50);
        }
    }
});