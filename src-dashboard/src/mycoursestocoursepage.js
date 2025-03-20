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

function createCourse() {
    const courseName = document.getElementById('courseName').value;
    const subjectArea = document.getElementById('subjectArea').value;
    const examDate = document.getElementById('examDate').value;
    const studyHours = document.getElementById('studyHours').value;
    const knowledgeLevel = document.getElementById('knowledgeLevel').value;
    
    // Validating course name input
    if (!courseName.trim()) {
        alert('Please enter a course name');
        return;
    }

    // Create a unique ID for each course
    const courseId = Date.now().toString();
    
    // Create course object with timestamp
    const course = {
        id: courseId,
        name: courseName,
        subject: subjectArea,
        examDate: examDate,
        studyHours: studyHours,
        knowledgeLevel: knowledgeLevel,
        timestamp: Date.now() // Add timestamp for sorting
    };
    
    // Add to courses array
    courses.push(course);
    
    // Save to both cache and localStorage
    saveCoursesToStorage(courses);
    
    // Add to the UI
    addCourseToUI(course);
    
    // Close the modal
    modal.style.display = 'none';
}

// Update the save function to use both storage methods
function saveCoursesToStorage(courses) {
    // Save to localStorage
    localStorage.setItem('courses', JSON.stringify(courses));
    
    // Save to Cache API if available
    if ('caches' in window) {
        const coursesBlob = new Blob([JSON.stringify(courses)], { type: 'application/json' });
        const coursesResponse = new Response(coursesBlob);
        
        caches.open('aura-courses-cache').then(cache => {
            cache.put('/courses-data', coursesResponse);
        }).catch(error => {
            console.error('Error saving to cache:', error);
        });
    }
}

// Update the course update function
function updateCourse(courseId) {
    const courseIndex = courses.findIndex(course => course.id === courseId);
    
    if (courseIndex === -1) return;
    
    // Update the course details with new timestamp
    courses[courseIndex] = {
        ...courses[courseIndex],
        name: document.getElementById('courseName').value,
        subject: document.getElementById('subjectArea').value,
        examDate: document.getElementById('examDate').value,
        studyHours: document.getElementById('studyHours').value,
        knowledgeLevel: document.getElementById('knowledgeLevel').value,
        timestamp: Date.now() // Update timestamp when modified
    };
    
    // Save to both storage methods
    saveCoursesToStorage(courses);
    
    // Reload courses to refresh the UI
    loadCourses();
    
    // Close the modal
    modal.style.display = 'none';
}

// Update the delete function
function deleteCourse(courseId) {
    // Filter out the course with the specified ID
    courses = courses.filter(course => course.id !== courseId);
    
    // Save updated courses array to both storage methods
    saveCoursesToStorage(courses);
    
    // Remove the course card from the UI
    const courseCard = document.querySelector(`.course-card[data-id="${courseId}"]`);
    if (courseCard) {
        courseCard.remove();
    }
}