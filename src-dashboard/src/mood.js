// Mood Widget
document.addEventListener('DOMContentLoaded', () => {
    const moodTrack = document.getElementById('mood-track');
    const moodDragger = document.getElementById('mood-dragger');
    const recommendationEl = document.getElementById('recommendation');

    // Recommendations for different mood ranges
    const recommendations = {
        verySad: [
            "Oh bummer! Take it easy today. Watch a YouTube tutorial to get familiar with the topic.",
            "Feeling down? Try a gentle learning approach with some relaxed YouTube videos.",
            "Low energy today? Focus on passive learning through short, engaging video tutorials."
        ],
        sad: [
            "Looks like you're feeling a bit low. Consider a light study session with interactive coding tutorials.",
            "Feeling a bit down? Try some fun, beginner-friendly coding challenges.",
            "Take it slow today. Explore some inspirational coding content on YouTube."
        ],
        neutral: [
            "You're in a balanced mood. Perfect time for steady, consistent learning.",
            "Neutral energy? Great for focused, methodical study.",
            "Maintain a steady pace and dive into your learning materials."
        ],
        happy: [
            "Great mood! You're ready to tackle more challenging coding concepts.",
            "Feeling good? Time to push your learning boundaries!",
            "Your positive energy is perfect for diving deep into complex topics."
        ],
        veryHappy: [
            "Wow, you're on fire! Time for an ambitious learning marathon!",
            "Excellent mood! Challenge yourself with advanced coding projects.",
            "Maximum energy! Perfect for intensive learning and coding."
        ]
    };

    // Determine mood category based on position
    function getMoodCategory(moodValue) {
        if (moodValue < 20) return 'verySad';
        if (moodValue < 40) return 'sad';
        if (moodValue < 60) return 'neutral';
        if (moodValue < 80) return 'happy';
        return 'veryHappy';
    }

    // Get a random recommendation for a mood category
    function getRecommendation(category) {
        const categoryRecs = recommendations[category];
        return categoryRecs[Math.floor(Math.random() * categoryRecs.length)];
    }

    // Update dragger position and mood
    function updateMoodPosition(clientX) {
        const trackRect = moodTrack.getBoundingClientRect();
        let newX = clientX - trackRect.left;
        
        // Constrain within track
        newX = Math.max(0, Math.min(newX, trackRect.width));
        
        // Calculate mood percentage
        const moodPercentage = Math.round((newX / trackRect.width) * 100);
        
        // Update dragger position
        moodDragger.style.left = `calc(${moodPercentage}% - 20px)`;
        
        // Update background color based on mood
        const red = Math.round(255 * (1 - moodPercentage / 100));
        const green = Math.round(255 * (moodPercentage / 100));
        moodDragger.style.backgroundColor = `rgb(${red}, ${green}, 0)`;
        
        // Get and display recommendation
        const moodCategory = getMoodCategory(moodPercentage);
        const recommendation = getRecommendation(moodCategory);
        recommendationEl.innerHTML = `
            <h3>Recommendation:</h3>
            <p>${recommendation}</p>
        `;
    }

    // Drag functionality
    let isDragging = false;

    moodDragger.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault(); // Prevent text selection
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        updateMoodPosition(e.clientX);
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Initial positioning
    updateMoodPosition(moodTrack.getBoundingClientRect().left + moodTrack.getBoundingClientRect().width / 2);
});