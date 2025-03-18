
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on mycourses page
    const isMyCourses = document.querySelector('.courses-grid-container');
    
    if (isMyCourses) {
        console.log("My Courses page detected - setting up navigation");
        // Set up initial course cards
        setupCourseCardNavigation();
        
        // Monitor for new courses being added
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setupCourseCardNavigation();
                }
            });
        });
        
        // Start observing the container for added courses
        observer.observe(isMyCourses, { childList: true });
    }
    
    function setupCourseCardNavigation() {
        // Find all course cards
        const courseCards = document.querySelectorAll('.course-card');
        
        courseCards.forEach(card => {
            // Skip cards that already have click handlers
            if (card.dataset.hasClickHandler) {
                return;
            }
            
            // Add click handler
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on edit or delete buttons
                if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) {
                    return;
                }
                
                console.log("Course card clicked, preparing navigation");
                
                // Get course data
                const courseId = card.dataset.id;
                const courseTitle = card.querySelector('.course-title').textContent;
                const knowledgeLevel = card.querySelector('.course-progress-badge').textContent;
                const examDate = card.querySelector('.quiz-date') ? 
                    card.querySelector('.quiz-date').textContent.replace('Next Quiz: ', '') : '';
                
                // Get more course details from cache or localStorage
                let allCourses = [];
                try {
                    // First try to get courses from localStorage
                    const coursesData = localStorage.getItem('courses');
                    if (coursesData) {
                        allCourses = JSON.parse(coursesData);
                    } else {
                        // If not in localStorage, try Cache API
                        caches.open('aura-courses-cache').then(cache => {
                            return cache.match('/courses-data');
                        }).then(response => {
                            if (response) {
                                return response.json();
                            }
                            return [];
                        }).then(data => {
                            allCourses = data;
                        });
                    }
                } catch (err) {
                    console.error("Error accessing courses from storage:", err);
                }
                
                // Find full course details
                const fullCourse = allCourses.find(c => c.id === courseId) || {};
                
                // Store course data for the course page
                localStorage.setItem('currentCourse', JSON.stringify({
                    id: courseId,
                    name: courseTitle,
                    knowledgeLevel: knowledgeLevel,
                    examDate: examDate,
                    subject: fullCourse.subject || '',
                    studyHours: fullCourse.studyHours || '',
                    subtitle: "Introduction to " + courseTitle
                }));
                
                console.log("Navigating to course page");
                
                // Generate a unique URL for this course
                // Use the coursepage.html as the base but add a query parameter for the course ID
                window.location.href = `coursepage.html?id=${courseId}`;
            });
            
            // Mark as having click handler to avoid duplicates
            card.dataset.hasClickHandler = "true";
            
           
            card.style.cursor = "pointer";
        });
    }
});