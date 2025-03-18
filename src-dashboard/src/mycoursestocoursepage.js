/* This should connect the courses from the My Courses page to individual course pages */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on mycourses page
    const isMyCourses = document.querySelector('.courses-grid-container');
    
    if (isMyCourses) {
      // Set up course card click handlers
      setupCourseCardNavigation();
    }
    
    function setupCourseCardNavigation() {
      // Find all course cards
      const courseCards = document.querySelectorAll('.course-card');
      
      courseCards.forEach(card => {
        // Add click handler
        card.addEventListener('click', (e) => {
          // Don't trigger if clicking on edit or delete buttons
          if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) {
            return;
          }
          
          // Get course data
          const courseId = card.dataset.id;
          const courseTitle = card.querySelector('.course-title').textContent;
          const knowledgeLevel = card.querySelector('.course-progress-badge').textContent;
          
          // Store course data for the course page
          localStorage.setItem('currentCourse', JSON.stringify({
            id: courseId,
            name: courseTitle,
            knowledgeLevel: knowledgeLevel,
            subtitle: "Introduction to Web apps"
          }));
          
          // Navigate to course page
          window.location.href = 'coursepage.html';
        });
      });
    }
    
    // If we're on the course page, load course data
    const isCoursePage = document.querySelector('.course-title');
    
    if (isCoursePage) {
      loadCourseData();
    }
    
    function loadCourseData() {
      // Get course data from localStorage
      const courseData = localStorage.getItem('currentCourse');
      
      if (courseData) {
        const course = JSON.parse(courseData);
        
        // Update course title and subtitle
        const titleElement = document.querySelector('.course-title h1');
        const subtitleElement = document.querySelector('.course-title h2');
        
        if (titleElement && course.name) {
          titleElement.textContent = course.name;
        }
        
        if (subtitleElement && course.subtitle) {
          subtitleElement.textContent = course.subtitle;
        }
        
        // Initialize tab functionality (if not already done)
        setupTabs();
      }
    }
    
    function setupTabs() {
      const navButtons = document.querySelectorAll('.course-nav .nav-button');
      
      navButtons.forEach(button => {
        button.addEventListener('click', function() {
          // Remove active class from all buttons
          navButtons.forEach(btn => {
            btn.classList.remove('active');
          });
          
          // Add active class to the clicked button
          this.classList.add('active');
          
          // Get tab name
          const tabName = this.textContent.trim().toLowerCase();
          
          // Hide all tab content
          const tabContents = document.querySelectorAll('.tab-content');
          tabContents.forEach(tab => {
            tab.style.display = 'none';
          });
          
          // Content section (Overview tab)
          const contentSection = document.querySelector('.content-section');
          if (contentSection) {
            contentSection.style.display = tabName === 'overview' ? 'block' : 'none';
          }
          
          // Show selected tab content
          const selectedTab = document.getElementById(`${tabName}-tab`);
          if (selectedTab) {
            selectedTab.style.display = 'block';
          }
        });
      });
    }
  });