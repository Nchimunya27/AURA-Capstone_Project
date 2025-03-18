
(function () {
  // DOM Elements
  const todoItems = document.querySelectorAll('.todo-item input[type="checkbox"]');
  const uploadBtn = document.querySelector(".upload-btn");
  const navButtons = document.querySelectorAll(".nav-button");
  const flashcardItems = document.querySelectorAll(".flashcard");
  const browseBtn = document.querySelector(".browse-btn");

  // Tab content sections 
  const tabContents = {
    overview: document.querySelector(".content-section"),
    notes: document.getElementById("notes-tab"),
    quizzes: document.getElementById("quizzes-tab"),
    flashcards: document.getElementById("flashcards-tab")
  };

  // ======= COURSE LOADING FUNCTIONALITY =======
  
  // Load course data when page loads
  document.addEventListener('DOMContentLoaded', function() {
    loadCourseData();
    
    // Initialize the rest of the UI
    initializeTabs();
    initializeFlashcardTab();
    initializeQuizzesTab();
    initializeDownloads();
    initializeDragDrop();
    animateProgress();
  });
  
  // Function to load course data
  function loadCourseData() {
    // Get the course ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    
    console.log("Loading data for course ID:", courseId);
    
    // Get course data from localStorage
    const courseData = localStorage.getItem('currentCourse');
    
    if (courseData) {
      const course = JSON.parse(courseData);
      console.log("Loaded course data:", course);
      
      // Verify this is the correct course
      if (!courseId || course.id === courseId) {
        // Update page title
        document.title = course.name + " - AURA Learning Platform";
        
        // Update course title and subtitle
        const titleElement = document.querySelector('.course-title h1');
        const subtitleElement = document.querySelector('.course-title h2');
        
        if (titleElement && course.name) {
          titleElement.textContent = course.name;
        }
        
        if (subtitleElement) {
          subtitleElement.textContent = course.subtitle || "Introduction to " + course.name;
        }
        
        // Update progress components if present
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill && course.knowledgeLevel) {
          const knowledgeValue = parseInt(course.knowledgeLevel);
          if (!isNaN(knowledgeValue)) {
            progressFill.style.width = knowledgeValue + '%';
          }
        }
        
        // Update quiz dates if present
        const quizDate = document.querySelector('.quiz-date');
        if (quizDate && course.examDate) {
          quizDate.textContent = "Next Quiz: " + course.examDate;
        }
        
        // Update progress percentage display
        const progressPercentage = document.querySelector('.progress-percentage');
        if (progressPercentage && course.knowledgeLevel) {
          progressPercentage.textContent = course.knowledgeLevel + '%';
        }
        
      } else {
        console.warn("URL course ID doesn't match stored course data ID");
        // Try to find the course info from the storage
        fetchCourseFromStorage(courseId);
      }
    } else {
      console.warn("No course data found in localStorage");
      // Try to find the course info from the storage if ID is available
      if (courseId) {
        fetchCourseFromStorage(courseId);
      }
    }
  }
  
  // Function to fetch course data from storage when not in localStorage
  function fetchCourseFromStorage(courseId) {
    // Try to get the course from localStorage courses array
    const coursesData = localStorage.getItem('courses');
    if (coursesData) {
      const courses = JSON.parse(coursesData);
      const course = courses.find(c => c.id === courseId);
      
      if (course) {
        // Create a full course object and store in localStorage
        const courseObj = {
          id: course.id,
          name: course.name,
          knowledgeLevel: course.knowledgeLevel || "0",
          examDate: course.examDate || "Not scheduled",
          subject: course.subject || '',
          studyHours: course.studyHours || '',
          subtitle: "Introduction to " + course.name
        };
        
        localStorage.setItem('currentCourse', JSON.stringify(courseObj));
        
        // Reload the course data
        loadCourseData();
      } else {
        console.error("Course with ID", courseId, "not found in storage");
        displayErrorMessage("Course not found. Please return to My Courses.");
      }
    } else {
      // Try Cache API as fallback
      if ('caches' in window) {
        caches.open('aura-courses-cache').then(cache => {
          return cache.match('/courses-data');
        }).then(response => {
          if (response) {
            return response.json();
          }
          return [];
        }).then(courses => {
          const course = courses.find(c => c.id === courseId);
          if (course) {
            // Create a full course object and store in localStorage
            const courseObj = {
              id: course.id,
              name: course.name,
              knowledgeLevel: course.knowledgeLevel || "0",
              examDate: course.examDate || "Not scheduled",
              subject: course.subject || '',
              studyHours: course.studyHours || '',
              subtitle: "Introduction to " + course.name
            };
            
            localStorage.setItem('currentCourse', JSON.stringify(courseObj));
            
            // Reload the course data
            loadCourseData();
          } else {
            console.error("Course with ID", courseId, "not found in cache");
            displayErrorMessage("Course not found. Please return to My Courses.");
          }
        });
      } else {
        displayErrorMessage("Course not found. Please return to My Courses.");
      }
    }
  }
  
  // Display error message if course not found
  function displayErrorMessage(message) {
    // Display error message in the UI
    const courseTitle = document.querySelector('.course-title h1');
    if (courseTitle) {
      courseTitle.textContent = "Error";
    }
    
    const subtitle = document.querySelector('.course-title h2');
    if (subtitle) {
      subtitle.textContent = message;
    }
    
    // Add a button to go back to My Courses
    const header = document.querySelector('.course-header');
    if (header) {
      const backButton = document.createElement('button');
      backButton.className = 'btn-primary';
      backButton.textContent = 'Back to My Courses';
      backButton.style.marginTop = '20px';
      backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
      
      header.appendChild(backButton);
    }
  }

  // ======= TAB FUNCTIONALITY =======
  
  // Initialize tabs functionality
  function initializeTabs() {
    // Hide all tab contents except overview 
    for (const key in tabContents) {
      if (tabContents[key] && key !== "overview") {
        tabContents[key].style.display = "none";
      }
    }
    
    // Tab switching functionality
    navButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Update active button
        navButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");
        
        // Get the tab name from button text
        const tabName = this.textContent.trim().toLowerCase();
        
        // First, hide all tab contents
        for (const key in tabContents) {
          if (tabContents[key]) {
            tabContents[key].style.display = "none";
          }
        }
        
        // Get all the Overview elements by their headings
        const headings = document.querySelectorAll('h3');
        headings.forEach(heading => {
          const text = heading.textContent.trim();
          // Look for headings with specific text
          if (text === "Overall Progress" || text === "Study Streak" || text === "Next Quiz") {
            // Find the parent article or container element
            let container = heading.closest('article');
            if (!container) {
             
              container = heading.closest('div[class*="card"]') || heading.closest('section');
            }
            
            // Hide or show the container based on the selected tab
            if (container) {
              container.style.display = (tabName === "overview") ? "" : "none";
            }
          }
        });
        
        // Also specifically handle the Upload Document button visibility
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons) {
          actionButtons.style.display = (tabName === "notes") ? "block" : "none";
        }
        
        // Main content section hide/show
        const contentSection = document.querySelector('.content-section');
        if (contentSection) {
          contentSection.style.display = (tabName === "overview") ? "block" : "none";
        }
        
        // Show the selected tab content
        if (tabName === "overview") {
          if (tabContents.overview) {
            tabContents.overview.style.display = "block";
          }
        } else if (tabContents[tabName]) {
          tabContents[tabName].style.display = "block";
        }
      });
    });
  }

  // Initialize Quizzes tab functionality
  function initializeQuizzesTab() {
    const practiceQuizBtns = document.querySelectorAll(".practice-quiz-btn");
    
    practiceQuizBtns.forEach(button => {
      button.addEventListener("click", function() {
        this.textContent = "Loading quiz...";
        
        // Get current course ID to pass to the quiz page
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('id');
        
        // Redirect to quiz page with course ID
        setTimeout(() => {
          window.location.href = courseId ? `quiz.html?courseId=${courseId}` : 'quiz.html';
        }, 500);
      });
    });
    
    // Quiz practice button
    const practiceBtn = document.querySelector(".practice-btn");
    practiceBtn?.addEventListener("click", function () {
      // Get current course ID to pass to the quiz page
      const urlParams = new URLSearchParams(window.location.search);
      const courseId = urlParams.get('id');
      
      // Simulate starting a practice quiz
      console.log("Starting practice quiz");
      this.textContent = "Loading quiz...";
      
      // Redirect to quiz page with course ID
      setTimeout(() => {
        window.location.href = courseId ? `quiz.html?courseId=${courseId}` : 'quiz.html';
      }, 500);
    });
  }

  // Todo list functionality
  todoItems.forEach((item) => {
    item.addEventListener("change", function () {
      const todoText = this.nextElementSibling;
      if (this.checked) {
        todoText.style.textDecoration = "line-through";
        todoText.style.opacity = "0.7";
      } else {
        todoText.style.textDecoration = "none";
        todoText.style.opacity = "1";
      }
    });
  });

  // Upload button functionality
  uploadBtn?.addEventListener("click", function () {
    // Show notes tab first
    const notesTab = Array.from(navButtons).find(btn => 
      btn.textContent.trim().toLowerCase() === 'notes'
    );
    if (notesTab) {
      notesTab.click();
    }
    
    // Simulate file upload dialog
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx";
    input.style.display = "none";

    input.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        // Show upload progress (example)
        showUploadProgress(file.name);
      }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });

  // Browse files button (in Notes tab)
  browseBtn?.addEventListener("click", function() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx";
    input.style.display = "none";

    input.addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (file) {
        // Show upload success message or add file to list
        console.log(`File selected: ${file.name}`);
      }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });

  // Upload progress simulation
  function showUploadProgress(fileName) {
    const progressBar = document.createElement("div");
    progressBar.classList.add("upload-progress");
    progressBar.innerHTML = `
      <div class="progress-info">
        <span>Uploading: ${fileName}</span>
        <span class="progress-percentage">0%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
    `;

    const targetContainer = document.querySelector(".documents-card") || document.querySelector(".document-list");
    
    if (targetContainer) {
      targetContainer.appendChild(progressBar);
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        progressBar.querySelector(".progress-percentage").textContent = `${progress}%`;
        progressBar.querySelector(".progress-fill").style.width = `${progress}%`;

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            progressBar.remove();
            
            // Show success message
            const successMsg = document.createElement("div");
            successMsg.className = "upload-success";
            successMsg.innerHTML = `<i class="fas fa-check-circle"></i> ${fileName} uploaded successfully!`;
            targetContainer.appendChild(successMsg);
            
            setTimeout(() => {
              successMsg.remove();
            }, 3000);
          }, 500);
        }
      }, 100);
    }
  }

  // Regular flashcard interaction (from existing content)
  flashcardItems.forEach((card) => {
    card.addEventListener("click", function () {
      this.classList.toggle("flipped");
    });
  });

  // Flashcard tab functionality
  function initializeFlashcardTab() {
    const flashcardItem = document.querySelector(".flashcard-item");
    const showAnswerBtns = document.querySelectorAll("#flashcards-tab .show-answer-btn");
    const rotateBtns = document.querySelectorAll("#flashcards-tab .rotate-btn");
    const prevBtn = document.querySelector("#flashcards-tab .nav-arrow:first-child");
    const nextBtn = document.querySelector("#flashcards-tab .nav-controls .nav-arrow");
    const cardCount = document.querySelector("#flashcards-tab .card-count");
    const shuffleBtn = document.querySelector("#flashcards-tab .fa-random")?.parentElement;
    
    // Current card tracking
    let currentCard = 7;
    const totalCards = 85;

    // Flip flashcard function
    function toggleFlashcard() {
      if (flashcardItem) {
        flashcardItem.classList.toggle("flipped");
      }
    }

    // Attach event listeners to buttons
    showAnswerBtns.forEach(btn => {
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        toggleFlashcard();
      });
    });
    
    rotateBtns.forEach(btn => {
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        toggleFlashcard();
      });
    });

    // Navigation functionality
    if (prevBtn) {
      prevBtn.addEventListener("click", function() {
        if (currentCard > 1) {
          currentCard--;
          updateCardCount();
          resetCard();
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener("click", function() {
        if (currentCard < totalCards) {
          currentCard++;
          updateCardCount();
          resetCard();
        }
      });
    }
    
    function updateCardCount() {
      if (cardCount) {
        cardCount.textContent = `${currentCard} / ${totalCards}`;
      }
    }
    
    function resetCard() {
      if (flashcardItem && flashcardItem.classList.contains("flipped")) {
        flashcardItem.classList.remove("flipped");
      }
    }

    // Shuffle functionality
    if (shuffleBtn) {
      shuffleBtn.addEventListener("click", function() {
        if (flashcardItem) {
          flashcardItem.style.transition = "transform 0.4s";
          flashcardItem.style.transform = "translateX(10px) rotate(5deg)";
          
          setTimeout(() => {
            flashcardItem.style.transform = "translateX(-10px) rotate(-5deg)";
            
            setTimeout(() => {
              flashcardItem.style.transform = "";
              flashcardItem.style.transition = "transform 0.8s";
              
              // Reset to the front and update count
              resetCard();
              currentCard = Math.floor(Math.random() * totalCards) + 1;
              updateCardCount();
            }, 200);
          }, 200);
        }
      });
    }
  }

  // Document download functionality
  function initializeDownloads() {
    const downloadButtons = document.querySelectorAll(".document-download");
    downloadButtons.forEach((button) => {
      button.addEventListener("click", function(e) {
        e.preventDefault();
        const documentTitle = this.closest(".document-item").querySelector(".document-title").textContent;
        console.log(`Downloading: ${documentTitle}`);
        // Simulate download with animation
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        setTimeout(() => {
          this.innerHTML = '<i class="fas fa-download"></i>';
        }, 1500);
      });
    });
  }

  // Drag and drop file upload
  function initializeDragDrop() {
    const uploadArea = document.querySelector(".upload-area");
    
    if (uploadArea) {
      uploadArea.addEventListener("dragover", function(e) {
        e.preventDefault();
        this.style.borderColor = "var(--link-color)";
        this.style.backgroundColor = "#f0f7ff";
      });
      
      uploadArea.addEventListener("dragleave", function(e) {
        e.preventDefault();
        this.style.borderColor = "#e0e0e0";
        this.style.backgroundColor = "transparent";
      });
      
      uploadArea.addEventListener("drop", function(e) {
        e.preventDefault();
        this.style.borderColor = "#e0e0e0";
        this.style.backgroundColor = "transparent";
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          console.log(`File dropped: ${files[0].name}`);
          // Process the file
          showUploadProgress(files[0].name);
        }
      });
    }
  }

  // Progress chart animation
  function animateProgress() {
    const progressBars = document.querySelectorAll(".progress-fill");
    progressBars.forEach((bar) => {
      const targetWidth = bar.getAttribute("data-progress") || "0";
      bar.style.width = "0%";
      setTimeout(() => {
        bar.style.width = targetWidth;
      }, 100);
    });
  }

  // Handle document downloads
  const downloadButtons = document.querySelectorAll(".download-icon");
  downloadButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const documentName = this.closest(".document-item").querySelector(
        ".document-details h4"
      ).textContent;

      // Start download
      console.log(`Downloading: ${documentName}`);
      
    });
  });
})();