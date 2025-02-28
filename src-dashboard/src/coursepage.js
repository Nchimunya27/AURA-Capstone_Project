// Main JavaScript functionality
(function () {
    // DOM Elements
    const todoItems = document.querySelectorAll(
      '.todo-item input[type="checkbox"]',
    );
    const uploadBtn = document.querySelector(".upload-btn");
    const navButtons = document.querySelectorAll(".nav-button");
    const flashcardItems = document.querySelectorAll(".flashcard");
  
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
  
    // Navigation buttons
    navButtons.forEach((button) => {
      button.addEventListener("click", function () {
        navButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");
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
  
    // Flashcard interaction
    flashcardItems.forEach((card) => {
      card.addEventListener("click", function () {
        this.classList.toggle("flipped");
      });
    });
  
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
  
    // Initialize animations
    document.addEventListener("DOMContentLoaded", () => {
      animateProgress();
    });
  
    // Handle document downloads
    const downloadButtons = document.querySelectorAll(".download-icon");
    downloadButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        const documentName = this.closest(".document-item").querySelector(
          ".document-details h4",
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
  })();
  