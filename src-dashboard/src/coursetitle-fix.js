// Course Title Update
document.addEventListener('DOMContentLoaded', function() {
    console.log("Course title updater running");
    
    // Function to update UI with course data
    function updateCourseUI(courseData) {
      if (courseData && courseData.name) {
        // Update main title
        const courseTitleElement = document.querySelector('.course-title h1');
        if (courseTitleElement) {
          courseTitleElement.textContent = courseData.name;
          console.log("Updated course title to:", courseData.name);
        }
        
        // Update subtitle
        const courseSubtitleElement = document.querySelector('.course-title h2');
        if (courseSubtitleElement && courseData.subtitle) {
          courseSubtitleElement.textContent = courseData.subtitle;
          console.log("Updated course subtitle to:", courseData.subtitle);
        }
        
        // Update progress indicators if they exist
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill && courseData.knowledgeLevel) {
          
          const progressValue = parseInt(courseData.knowledgeLevel.toString().replace('%', ''));
          progressFill.style.width = progressValue + '%';
          console.log("Updated progress bar to:", progressValue + '%');
        }
        
        // Update Next Quiz 
        const quizDate = document.querySelector('.quiz-date');
        if (quizDate && courseData.examDate) {
          quizDate.textContent = "Next Quiz: " + courseData.examDate;
          console.log("Updated quiz date to:", courseData.examDate);
        }
        
        // Update document database ID to use course-specific ID
        window.courseId = courseData.id || "web-development-intro";
        console.log("Set course ID for documents:", window.courseId);
      } else {
        console.log("No valid course data found");
      }
    }
    
    // First try to get data from localStorage
    try {
      const localData = localStorage.getItem('currentCourse');
      if (localData) {
        const courseData = JSON.parse(localData);
        console.log("Course data found in localStorage:", courseData);
        updateCourseUI(courseData);
        return; // Exit if we successfully loaded from localStorage
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
    
    // If localStorage failed, try to get from Cache API
    if ('caches' in window) {
      console.log("Checking Cache API for course data...");
      
      // Get the course ID from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const courseId = urlParams.get('id');
      
      if (courseId) {
        console.log("Looking for course ID:", courseId);
        
        caches.open('aura-courses-cache').then(cache => {
          return cache.match('/courses-data');
        }).then(response => {
          if (response) {
            return response.json();
          }
          return [];
        }).then(allCourses => {
          // Find the course with matching ID
          const courseData = allCourses.find(course => course.id === courseId);
          if (courseData) {
            console.log("Course data found in Cache API:", courseData);
            
            // Store it in localStorage for future use
            localStorage.setItem('currentCourse', JSON.stringify({
              id: courseData.id,
              name: courseData.name,
              knowledgeLevel: courseData.knowledgeLevel || "0%",
              examDate: courseData.examDate || "Not set",
              subject: courseData.subject || '',
              subtitle: "Introduction to " + courseData.name
            }));
            
            updateCourseUI(courseData);
          } else {
            console.log("Course not found in cache data");
          }
        }).catch(error => {
          console.error("Error fetching from Cache API:", error);
        });
      } else {
        console.log("No course ID found in URL");
      }
    } else {
      console.log("Cache API not supported");
    }
  });