// Main JavaScript functionality
(function () {
  // DOM Elements
  const todoItems = document.querySelectorAll(
    '.todo-item input[type="checkbox"]'
  );
  const uploadBtn = document.querySelector(".upload-btn");
  const navButtons = document.querySelectorAll(".nav-button");
  const flashcardItems = document.querySelectorAll(".flashcard");
  const browseBtn = document.querySelector(".browse-btn");

  // Tab content sections - reference the main content sections
  const tabContents = {
    overview: document.querySelector(".content-section"),
    notes: document.getElementById("notes-tab"),
    quizzes: document.getElementById("quizzes-tab"),
    flashcards: document.getElementById("flashcards-tab")
  };

  // Initialize tabs functionality
  function initializeTabs() {
    // Hide all tab contents except overview (first tab)
    for (const key in tabContents) {
      if (tabContents[key] && key !== "overview") {
        tabContents[key].style.display = "none";
      }
    }
  }

    // Initialize Quizzes tab functionality
  function initializeQuizzesTab() {
    const practiceQuizBtns = document.querySelectorAll(".practice-quiz-btn");
    
    practiceQuizBtns.forEach(button => {
      button.addEventListener("click", function() {
        this.textContent = "Loading quiz...";
        setTimeout(() => {
          this.textContent = "Start Practice Quiz";
        }, 1500);
      });
    });
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
        
        // Get all the Overview-specific elements by their headings
        // This approach looks for the specific text in headings (h3 elements)
        const headings = document.querySelectorAll('h3');
        headings.forEach(heading => {
          const text = heading.textContent.trim();
          // Look for headings with specific text
          if (text === "Overall Progress" || text === "Study Streak" || text === "Next Quiz") {
            // Find the parent article or container element
            let container = heading.closest('article');
            if (!container) {
              // If not in an article, try to find the closest substantial container
              container = heading.closest('div[class*="card"]') || heading.closest('section');
            }
            
            // Hide or show the container based on the selected tab
            if (container) {
              container.style.display = (tabName === "overview") ? "" : "none";
            }
          }
        });
        
        // Also specifically hide the Upload Document button
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons) {
          actionButtons.style.display = (tabName === "overview") ? "" : "none";
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

    document.querySelector(".documents-card").appendChild(progressBar);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      progressBar.querySelector(".progress-percentage").textContent =
        `${progress}%`;
      progressBar.querySelector(".progress-fill").style.width = `${progress}%`;

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          progressBar.remove();
          // Could add the new document to the list here
        }, 500);
      }
    }, 100);
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

  // Quizzes tab functionality
  function initializeQuizzesTab() {
    const practiceQuizBtn = document.querySelector(".practice-quiz-btn");
    
    if (practiceQuizBtn) {
      practiceQuizBtn.addEventListener("click", function() {
        this.textContent = "Loading quiz...";
        setTimeout(() => {
          this.textContent = "Start Practice Quiz";
        }, 1500);
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

      // Simulate download start
      console.log(`Downloading: ${documentName}`);
      // Could add download progress indicator here
    });
  });

  // Quiz practice button
  const practiceBtn = document.querySelector(".practice-btn");
  practiceBtn?.addEventListener("click", function () {
    // Simulate starting a practice quiz
    console.log("Starting practice quiz");
    this.textContent = "Loading quiz...";
    setTimeout(() => {
      this.textContent = "Start Practice Quiz";
      // Could redirect to quiz page or show quiz modal
    }, 1500);
  });

  // Add event listeners for all practice quiz buttons
  document.addEventListener('DOMContentLoaded', function() {
    const practiceQuizButtons = document.querySelectorAll('.practice-quiz-btn, .practice-btn');
    
    practiceQuizButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Navigate to quiz.html when button is clicked
            window.location.href = 'quiz.html';
        });
    });
  });

  // Initialize app
  document.addEventListener("DOMContentLoaded", () => {
    initializeTabs();
    initializeFlashcardTab();
    initializeQuizzesTab();
    initializeDownloads();
    initializeDragDrop();
    animateProgress();
  });
})();