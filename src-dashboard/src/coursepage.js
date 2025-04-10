// // Main JavaScript functionality
// (function () {
//   // DOM Elements
//   const todoItems = document.querySelectorAll(
//     '.todo-item input[type="checkbox"]'
//   );
//   const uploadBtn = document.querySelector(".upload-btn");
//   const navButtons = document.querySelectorAll(".nav-button");
//   const flashcardItems = document.querySelectorAll(".flashcard");
//   const browseBtn = document.querySelector(".browse-btn");

//   // Tab content sections - reference the main content sections
//   const tabContents = {
//     overview: document.querySelector(".content-section"),
//     notes: document.getElementById("notes-tab"),
//     quizzes: document.getElementById("quizzes-tab"),
//     flashcards: document.getElementById("flashcards-tab")
//   };

//   // Initialize tabs functionality
//   function initializeTabs() {
//     // Hide all tab contents except overview (first tab)
//     for (const key in tabContents) {
//       if (tabContents[key] && key !== "overview") {
//         tabContents[key].style.display = "none";
//       }
//     }
//   }

//     // Initialize Quizzes tab functionality
//   function initializeQuizzesTab() {
//     const practiceQuizBtns = document.querySelectorAll(".practice-quiz-btn");
    
//     practiceQuizBtns.forEach(button => {
//       button.addEventListener("click", function() {
//         this.textContent = "Loading quiz...";
//         setTimeout(() => {
//           this.textContent = "Start Practice Quiz";
//         }, 1500);
//       });
//     });
//   }
  

//     // Tab switching functionality
//     navButtons.forEach((button) => {
//       button.addEventListener("click", function () {
//         // Update active button
//         navButtons.forEach((btn) => btn.classList.remove("active"));
//         this.classList.add("active");
        
//         // Get the tab name from button text
//         const tabName = this.textContent.trim().toLowerCase();
        
//         // First, hide all tab contents
//         for (const key in tabContents) {
//           if (tabContents[key]) {
//             tabContents[key].style.display = "none";
//           }
//         }
        
//         // Get all the Overview-specific elements by their headings
//         // This approach looks for the specific text in headings (h3 elements)
//         const headings = document.querySelectorAll('h3');
//         headings.forEach(heading => {
//           const text = heading.textContent.trim();
//           // Look for headings with specific text
//           if (text === "Overall Progress" || text === "Study Streak" || text === "Next Quiz") {
//             // Find the parent article or container element
//             let container = heading.closest('article');
//             if (!container) {
//               // If not in an article, try to find the closest substantial container
//               container = heading.closest('div[class*="card"]') || heading.closest('section');
//             }
            
//             // Hide or show the container based on the selected tab
//             if (container) {
//               container.style.display = (tabName === "overview") ? "" : "none";
//             }
//           }
//         });
        
//         // Also specifically hide the Upload Document button
//         const actionButtons = document.querySelector('.action-buttons');
//         if (actionButtons) {
//           actionButtons.style.display = (tabName === "overview") ? "" : "none";
//         }
        
//         // Main content section hide/show
//         const contentSection = document.querySelector('.content-section');
//         if (contentSection) {
//           contentSection.style.display = (tabName === "overview") ? "block" : "none";
//         }
        
//         // Show the selected tab content
//         if (tabName === "overview") {
//           if (tabContents.overview) {
//             tabContents.overview.style.display = "block";
//           }
//         } else if (tabContents[tabName]) {
//           tabContents[tabName].style.display = "block";
//         }
//       });
//     });

//   // Todo list functionality
//   todoItems.forEach((item) => {
//     item.addEventListener("change", function () {
//       const todoText = this.nextElementSibling;
//       if (this.checked) {
//         todoText.style.textDecoration = "line-through";
//         todoText.style.opacity = "0.7";
//       } else {
//         todoText.style.textDecoration = "none";
//         todoText.style.opacity = "1";
//       }
//     });
//   });

//   // Upload button functionality
//   uploadBtn?.addEventListener("click", function () {
//     // Simulate file upload dialog
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = ".pdf,.doc,.docx";
//     input.style.display = "none";

//     input.addEventListener("change", function (e) {
//       const file = e.target.files[0];
//       if (file) {
//         // Show upload progress (example)
//         showUploadProgress(file.name);
//       }
//     });

//     document.body.appendChild(input);
//     input.click();
//     document.body.removeChild(input);
//   });

//   // Browse files button (in Notes tab)
//   browseBtn?.addEventListener("click", function() {
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = ".pdf,.doc,.docx";
//     input.style.display = "none";

//     input.addEventListener("change", function(e) {
//       const file = e.target.files[0];
//       if (file) {
//         // Show upload success message or add file to list
//         console.log(`File selected: ${file.name}`);
//       }
//     });

//     document.body.appendChild(input);
//     input.click();
//     document.body.removeChild(input);
//   });

//   // Upload progress simulation
//   function showUploadProgress(fileName) {
//     const progressBar = document.createElement("div");
//     progressBar.classList.add("upload-progress");
//     progressBar.innerHTML = `
//       <div class="progress-info">
//         <span>Uploading: ${fileName}</span>
//         <span class="progress-percentage">0%</span>
//       </div>
//       <div class="progress-bar">
//         <div class="progress-fill"></div>
//       </div>
//     `;

//     document.querySelector(".documents-card").appendChild(progressBar);

//     let progress = 0;
//     const interval = setInterval(() => {
//       progress += 5;
//       progressBar.querySelector(".progress-percentage").textContent =
//         `${progress}%`;
//       progressBar.querySelector(".progress-fill").style.width = `${progress}%`;

//       if (progress >= 100) {
//         clearInterval(interval);
//         setTimeout(() => {
//           progressBar.remove();
//           // Could add the new document to the list here
//         }, 500);
//       }
//     }, 100);
//   }

//   // Regular flashcard interaction (from existing content)
//   flashcardItems.forEach((card) => {
//     card.addEventListener("click", function () {
//       this.classList.toggle("flipped");
//     });
//   });

//   // Flashcard tab functionality
//   function initializeFlashcardTab() {
//     const flashcardItem = document.querySelector(".flashcard-item");
//     const showAnswerBtns = document.querySelectorAll("#flashcards-tab .show-answer-btn");
//     const rotateBtns = document.querySelectorAll("#flashcards-tab .rotate-btn");
//     const prevBtn = document.querySelector("#flashcards-tab .nav-arrow:first-child");
//     const nextBtn = document.querySelector("#flashcards-tab .nav-controls .nav-arrow");
//     const cardCount = document.querySelector("#flashcards-tab .card-count");
//     const shuffleBtn = document.querySelector("#flashcards-tab .fa-random")?.parentElement;
    
//     // Current card tracking
//     let currentCard = 7;
//     const totalCards = 85;

//     // Flip flashcard function
//     function toggleFlashcard() {
//       if (flashcardItem) {
//         flashcardItem.classList.toggle("flipped");
//       }
//     }

//     // Attach event listeners to buttons
//     showAnswerBtns.forEach(btn => {
//       btn.addEventListener("click", function(e) {
//         e.stopPropagation();
//         toggleFlashcard();
//       });
//     });
    
//     rotateBtns.forEach(btn => {
//       btn.addEventListener("click", function(e) {
//         e.stopPropagation();
//         toggleFlashcard();
//       });
//     });

//     // Navigation functionality
//     if (prevBtn) {
//       prevBtn.addEventListener("click", function() {
//         if (currentCard > 1) {
//           currentCard--;
//           updateCardCount();
//           resetCard();
//         }
//       });
//     }
    
//     if (nextBtn) {
//       nextBtn.addEventListener("click", function() {
//         if (currentCard < totalCards) {
//           currentCard++;
//           updateCardCount();
//           resetCard();
//         }
//       });
//     }
    
//     function updateCardCount() {
//       if (cardCount) {
//         cardCount.textContent = `${currentCard} / ${totalCards}`;
//       }
//     }
    
//     function resetCard() {
//       if (flashcardItem && flashcardItem.classList.contains("flipped")) {
//         flashcardItem.classList.remove("flipped");
//       }
//     }

//     // Shuffle functionality
//     if (shuffleBtn) {
//       shuffleBtn.addEventListener("click", function() {
//         if (flashcardItem) {
//           flashcardItem.style.transition = "transform 0.4s";
//           flashcardItem.style.transform = "translateX(10px) rotate(5deg)";
          
//           setTimeout(() => {
//             flashcardItem.style.transform = "translateX(-10px) rotate(-5deg)";
            
//             setTimeout(() => {
//               flashcardItem.style.transform = "";
//               flashcardItem.style.transition = "transform 0.8s";
              
//               // Reset to the front and update count
//               resetCard();
//               currentCard = Math.floor(Math.random() * totalCards) + 1;
//               updateCardCount();
//             }, 200);
//           }, 200);
//         }
//       });
//     }
//   }

//   // Quizzes tab functionality
//   function initializeQuizzesTab() {
//     const practiceQuizBtn = document.querySelector(".practice-quiz-btn");
    
//     if (practiceQuizBtn) {
//       practiceQuizBtn.addEventListener("click", function() {
//         this.textContent = "Loading quiz...";
//         setTimeout(() => {
//           this.textContent = "Start Practice Quiz";
//         }, 1500);
//       });
//     }
//   }

//   // Document download functionality
//   function initializeDownloads() {
//     const downloadButtons = document.querySelectorAll(".document-download");
//     downloadButtons.forEach((button) => {
//       button.addEventListener("click", function(e) {
//         e.preventDefault();
//         const documentTitle = this.closest(".document-item").querySelector(".document-title").textContent;
//         console.log(`Downloading: ${documentTitle}`);
//         // Simulate download with animation
//         this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
//         setTimeout(() => {
//           this.innerHTML = '<i class="fas fa-download"></i>';
//         }, 1500);
//       });
//     });
//   }

//   // Drag and drop file upload
//   function initializeDragDrop() {
//     const uploadArea = document.querySelector(".upload-area");
    
//     if (uploadArea) {
//       uploadArea.addEventListener("dragover", function(e) {
//         e.preventDefault();
//         this.style.borderColor = "var(--link-color)";
//         this.style.backgroundColor = "#f0f7ff";
//       });
      
//       uploadArea.addEventListener("dragleave", function(e) {
//         e.preventDefault();
//         this.style.borderColor = "#e0e0e0";
//         this.style.backgroundColor = "transparent";
//       });
      
//       uploadArea.addEventListener("drop", function(e) {
//         e.preventDefault();
//         this.style.borderColor = "#e0e0e0";
//         this.style.backgroundColor = "transparent";
        
//         const files = e.dataTransfer.files;
//         if (files.length > 0) {
//           console.log(`File dropped: ${files[0].name}`);
//           // Process the file
//         }
//       });
//     }
//   }

//   // Progress chart animation
//   function animateProgress() {
//     const progressBars = document.querySelectorAll(".progress-fill");
//     progressBars.forEach((bar) => {
//       const targetWidth = bar.getAttribute("data-progress") || "0";
//       bar.style.width = "0%";
//       setTimeout(() => {
//         bar.style.width = targetWidth;
//       }, 100);
//     });
//   }

//   // Handle document downloads
//   const downloadButtons = document.querySelectorAll(".download-icon");
//   downloadButtons.forEach((button) => {
//     button.addEventListener("click", function (e) {
//       e.preventDefault();
//       const documentName = this.closest(".document-item").querySelector(
//         ".document-details h4"
//       ).textContent;

//       // Simulate download start
//       console.log(`Downloading: ${documentName}`);
//       // Could add download progress indicator here
//     });
//   });

//   // Quiz practice button
//   const practiceBtn = document.querySelector(".practice-btn");
//   practiceBtn?.addEventListener("click", function () {
//     // Simulate starting a practice quiz
//     console.log("Starting practice quiz");
//     this.textContent = "Loading quiz...";
//     setTimeout(() => {
//       this.textContent = "Start Practice Quiz";
//       // Could redirect to quiz page or show quiz modal
//     }, 1500);
//   });

//   // Add event listeners for all practice quiz buttons
//   document.addEventListener('DOMContentLoaded', function() {
//     const practiceQuizButtons = document.querySelectorAll('.practice-quiz-btn, .practice-btn');
    
//     practiceQuizButtons.forEach(button => {
//         button.addEventListener('click', function() {
//             // Navigate to quiz.html when button is clicked
//             window.location.href = 'quiz.html';
//         });
//     });
//   });

//   // Initialize app
//   document.addEventListener("DOMContentLoaded", () => {
//     initializeTabs();
//     initializeFlashcardTab();
//     initializeQuizzesTab();
//     initializeDownloads();
//     initializeDragDrop();
//     animateProgress();
//   });
// })();

// Enhanced Course Page JavaScript functionality
(function () {
  // DOM Elements
  const todoItems = document.querySelectorAll('.todo-item input[type="checkbox"]');
  const uploadBtn = document.querySelector(".upload-btn");
  const navButtons = document.querySelectorAll(".nav-button");
  const flashcardItems = document.querySelectorAll(".flashcard");
  const browseBtn = document.querySelector(".browse-btn");
  const progressFill = document.querySelector(".progress-fill");
  const progressPercentage = document.querySelector(".progress-percentage");
  const completedModules = document.querySelector(".progress-stats p:first-child");

  // State tracking
  let courseState = {
    tasks: {
      total: todoItems.length,
      completed: 0
    },
    modules: {
      total: 8, // This could be fetched dynamically
      completed: 6 // Initial value from HTML
    },
    documents: []
  };
  
  // Document caching with IndexedDB
  const dbName = "auraLearningDB";
  const dbVersion = 1;
  let db;
  
  // Initialize the IndexedDB
  function initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      
      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
        reject("Error opening database");
      };
      
      request.onsuccess = (event) => {
        db = event.target.result;
        console.log("Database opened successfully");
        resolve(db);
      };
      
      // If the database doesn't exist or needs an upgrade
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create a store for documents
        if (!db.objectStoreNames.contains("documents")) {
          const store = db.createObjectStore("documents", { keyPath: "id" });
          store.createIndex("courseId", "courseId", { unique: false });
          store.createIndex("timestamp", "timestamp", { unique: false });
          console.log("Documents store created");
        }
        
        // Create a store for tasks
        if (!db.objectStoreNames.contains("tasks")) {
          const taskStore = db.createObjectStore("tasks", { keyPath: "id" });
          taskStore.createIndex("courseId", "courseId", { unique: false });
          taskStore.createIndex("timestamp", "timestamp", { unique: false });
          taskStore.createIndex("completed", "completed", { unique: false });
          console.log("Tasks store created");
        }

        // Create a store for flashcard sets
        if (!db.objectStoreNames.contains("flashcardSets")) {
          const flashcardSetsStore = db.createObjectStore("flashcardSets", { keyPath: "id" });
          flashcardSetsStore.createIndex("courseId", "courseId", { unique: false });
          flashcardSetsStore.createIndex("timestamp", "timestamp", { unique: false });
          flashcardSetsStore.createIndex("name", "name", { unique: false });
          console.log("Flashcard Sets store created");
        }

        // Create a store for individual flashcards
        if (!db.objectStoreNames.contains("flashcards")) {
          const flashcardStore = db.createObjectStore("flashcards", { keyPath: "id" });
          flashcardStore.createIndex("setId", "setId", { unique: false });
          flashcardStore.createIndex("timestamp", "timestamp", { unique: false });
          flashcardStore.createIndex("position", "position", { unique: false });
          console.log("Flashcards store created");
        }
      };
    });
  }

  // Save a task to IndexedDB
  function saveTask(taskText, completed = false) {
    return new Promise((resolve, reject) => {
      if (!db) {
        return reject("Database not initialized");
      }
      
      try {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const transaction = db.transaction(["tasks"], "readwrite");
        const store = transaction.objectStore("tasks");
        
        const taskData = {
          id: taskId,
          text: taskText,
          completed: completed,
          timestamp: Date.now(),
          courseId: "web-development-intro" // Keep consistent with documents
        };
        
        const request = store.add(taskData);
        
        request.onsuccess = () => {
          console.log(`Task "${taskText}" saved successfully`);
          resolve(taskData);
        };
        
        request.onerror = (event) => {
          console.error("Error saving task:", event.target.error);
          reject("Error saving task");
        };
      } catch (error) {
        console.error("Error processing task:", error);
        reject(error);
      }
    });
  }

  // Load tasks from IndexedDB
  function loadTasks() {
    return new Promise((resolve, reject) => {
      if (!db) {
        return reject("Database not initialized");
      }
      
      try {
        const transaction = db.transaction(["tasks"], "readonly");
        const store = transaction.objectStore("tasks");
        const index = store.index("courseId");
        
        // Get all tasks for current course
        const request = index.getAll("web-development-intro");
        
        request.onsuccess = () => {
          const results = request.result || [];
          // Sort by timestamp (oldest first so they appear in order entered)
          results.sort((a, b) => a.timestamp - b.timestamp);
          resolve(results);
        };
        
        request.onerror = (event) => {
          console.error("Error loading tasks:", event.target.error);
          reject("Error loading tasks");
        };
      } catch (error) {
        console.error("Error processing tasks:", error);
        reject(error);
      }
    });
  }

  // Update a task's completed status
  function updateTaskStatus(taskId, completed) {
    return new Promise((resolve, reject) => {
      if (!db) {
        return reject("Database not initialized");
      }
      
      try {
        const transaction = db.transaction(["tasks"], "readwrite");
        const store = transaction.objectStore("tasks");
        
        const request = store.get(taskId);
        
        request.onsuccess = () => {
          const task = request.result;
          if (!task) {
            return reject("Task not found");
          }
          
          task.completed = completed;
          
          const updateRequest = store.put(task);
          
          updateRequest.onsuccess = () => {
            console.log(`Task "${task.text}" updated successfully`);
            resolve(task);
          };
          
          updateRequest.onerror = (event) => {
            console.error("Error updating task:", event.target.error);
            reject("Error updating task");
          };
        };
        
        request.onerror = (event) => {
          console.error("Error getting task:", event.target.error);
          reject("Error getting task");
        };
      } catch (error) {
        console.error("Error processing task update:", error);
        reject(error);
      }
    });
  }

  // Delete a task
  function deleteTask(taskId) {
    return new Promise((resolve, reject) => {
      if (!db) {
        return reject("Database not initialized");
      }
      
      try {
        const transaction = db.transaction(["tasks"], "readwrite");
        const store = transaction.objectStore("tasks");
        
        const request = store.delete(taskId);
        
        request.onsuccess = () => {
          console.log(`Task deleted successfully`);
          resolve();
        };
        
        request.onerror = (event) => {
          console.error("Error deleting task:", event.target.error);
          reject("Error deleting task");
        };
      } catch (error) {
        console.error("Error processing task deletion:", error);
        reject(error);
      }
    });
  }

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

  // Update the progress bar and related elements
  function updateProgress() {
    // Calculate overall progress as a weighted average of modules and tasks
    const moduleWeight = 0.7; // Modules are 70% of progress
    const taskWeight = 0.3;   // Tasks are 30% of progress
    
    const moduleProgress = (courseState.modules.completed / courseState.modules.total) * 100;
    
    // Avoid division by zero
    let taskProgress = 0;
    if (courseState.tasks.total > 0) {
      taskProgress = (courseState.tasks.completed / courseState.tasks.total) * 100;
    }
    
    // Combine for overall progress
    const overallProgress = Math.round((moduleProgress * moduleWeight) + (taskProgress * taskWeight));
    
    // Update the DOM
    if (progressFill) {
      progressFill.style.width = `${overallProgress}%`;
    }
    
    if (progressPercentage) {
      progressPercentage.textContent = `${overallProgress}%`;
    }
    
    if (completedModules) {
      completedModules.textContent = `Completed Modules: ${courseState.modules.completed}/${courseState.modules.total}`;
    }
  }

  // Create completed tasks section if it doesn't exist
  function createCompletedTasksSection() {
    const todoCard = document.querySelector(".todo-card");
    if (!todoCard) return;
    
    // Check if completed section already exists
    if (!document.querySelector(".completed-tasks")) {
      const completedSection = document.createElement("div");
      completedSection.className = "completed-tasks";
      completedSection.innerHTML = `
        <h4>Completed</h4>
        <div class="completed-list"></div>
      `;
      
      todoCard.appendChild(completedSection);
    }
  }

  // Show a modal for adding multiple tasks with direct UI updates
function showAddTasksModal() {
  console.log("Opening add tasks modal");
  
  // Remove any existing modal first
  const existingModal = document.querySelector('.tasks-modal-container');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'documents-modal-container tasks-modal-container';
  
  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'documents-modal';
  
  // Modal header - improved styling
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  modalHeader.innerHTML = `
    <h2>Add Tasks</h2>
    <button class="close-modal-btn">&times;</button>
  `;
  
  // Modal body - improved styling and instructions
  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  
  modalBody.innerHTML = `
    <p class="modal-instruction">Enter your tasks below. You can separate tasks using new lines, commas, or semicolons.</p>
    <textarea class="task-textarea" rows="8" placeholder="Buy groceries&#10;Finish report&#10;Call mom"></textarea>
    <div class="modal-actions">
      <button class="add-tasks-btn"><i class="fas fa-plus"></i>Add Tasks</button>
    </div>
  `;
  
  modal.appendChild(modalHeader);
  modal.appendChild(modalBody);
  modalContainer.appendChild(modal);
  
  // Append modal to body
  document.body.appendChild(modalContainer);
  
  // Make modal visible with animation
  setTimeout(() => {
    modalContainer.classList.add('active');
    modalBody.querySelector('.task-textarea').focus();
  }, 10);
  
  // Close button functionality
  const closeBtn = modal.querySelector('.close-modal-btn');
  closeBtn.addEventListener('click', () => {
    modalContainer.classList.remove('active');
    setTimeout(() => {
      modalContainer.remove();
    }, 300);
  });
  
  // Close when clicking outside
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      modalContainer.classList.remove('active');
      setTimeout(() => {
        modalContainer.remove();
      }, 300);
    }
  });
  
  // Add tasks button functionality - FIXED VERSION
  const addTasksBtn = modal.querySelector('.add-tasks-btn');
  const textarea = modal.querySelector('.task-textarea');
  
  addTasksBtn.addEventListener('click', function() {
    console.log("Add Tasks button clicked");
    
    const text = textarea.value.trim();
    console.log("Textarea content:", text);
    
    if (!text) {
      console.log("No tasks to add - textarea is empty");
      return;
    }
    
    // Split by new lines, commas, or semicolons
    const tasks = text.split(/[\n,;]+/)
      .map(task => task.trim())
      .filter(task => task !== '');
    
    console.log(`Found ${tasks.length} tasks to add:`, tasks);
    
    if (tasks.length > 0) {
      // Add tasks to UI first for immediate feedback
      const todoList = document.querySelector(".todo-list");
      if (!todoList) {
        console.error("Could not find todo list element!");
        return;
      }
      
      tasks.forEach((taskText, index) => {
        if (taskText) {
          console.log(`Adding task: "${taskText}"`);
          
          // Generate a temporary ID
          const tempId = `temp_task_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
          
          // Create task element
          const newTask = document.createElement('label');
          newTask.className = 'todo-item new-task';
          newTask.dataset.taskId = tempId;
          newTask.innerHTML = `
            <input type="checkbox" class="todo-checkbox">
            <span>${taskText}</span>
          `;
          
          // Add checkbox listener
          const checkbox = newTask.querySelector('input[type="checkbox"]');
          checkbox.addEventListener("change", function() {
            if (this.checked) {
              const todoItem = this.closest('.todo-item');
              const todoText = this.nextElementSibling;
              
              todoText.style.textDecoration = "line-through";
              todoText.style.opacity = "0.7";
              
              setTimeout(() => {
                moveTaskToCompleted(todoItem);
              }, 500);
            }
          });
          
          // Add to UI immediately
          todoList.appendChild(newTask);
          
          // Apply staggered animation
          setTimeout(() => {
            newTask.style.opacity = "1";
            newTask.style.transform = "translateY(0)";
          }, index * 50);
          
          // Save to database in the background
          saveTask(taskText)
            .then(task => {
              console.log(`Task "${taskText}" saved to DB with ID: ${task.id}`);
              // Update the data-task-id with the real ID from DB
              newTask.dataset.taskId = task.id;
            })
            .catch(error => {
              console.error(`Error saving task "${taskText}" to DB:`, error);
              // Task is still visible in UI even if DB save fails
            });
        }
      });
      
      // Update course state
      courseState.tasks.total += tasks.length;
      updateProgress();
      
      // Close the modal with a slight delay to ensure user sees tasks being added
      setTimeout(() => {
        modalContainer.classList.remove('active');
        setTimeout(() => {
          modalContainer.remove();
        }, 300);
      }, tasks.length * 50 + 200);
    } else {
      // No tasks found after splitting
      console.log("No valid tasks found in input");
    }
  });
  
  // In the textarea, Enter creates new lines, but Ctrl+Enter submits
  textarea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      console.log("Ctrl+Enter pressed, triggering Add Tasks button");
      addTasksBtn.click();
    }
  });
}

// deleting too
// Delete a document from IndexedDB
function deleteDocument(docId) {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject("Database not initialized");
    }
    
    try {
      const transaction = db.transaction(["documents"], "readwrite");
      const store = transaction.objectStore("documents");
      
      const request = store.delete(docId);
      
      request.onsuccess = () => {
        console.log(`Document deleted successfully`);
        resolve();
      };
      
      request.onerror = (event) => {
        console.error("Error deleting document:", event.target.error);
        reject("Error deleting document");
      };
    } catch (error) {
      console.error("Error processing document deletion:", error);
      reject(error);
    }
  });
}

  // Function to initialize the add task feature
function initializeAddTaskFeature() {
  const todoCard = document.querySelector(".todo-card");
  if (!todoCard) {
    console.error("No todo card found!");
    return;
  }
  
  // Make sure the todo card has a proper header with actions
  if (!todoCard.querySelector(".card-header")) {
    console.log("Setting up todo card with header");
    const cardContent = todoCard.innerHTML;
    todoCard.innerHTML = `
      <div class="card-header">
        <h3>To-Do List</h3>
        <div class="card-actions">
          <button class="link-btn add-multiple-btn">Add Multiple</button>
        </div>
      </div>
      <div class="add-task-section"></div>
      <div class="todo-list"></div>
    `;
    
    // If there was content, preserve it
    if (cardContent.includes("<h3>To-Do List</h3>")) {
      // Extract just the todoList part
      const todoListStart = cardContent.indexOf('<div class="todo-list">');
      if (todoListStart !== -1) {
        const todoListContent = cardContent.substring(todoListStart);
        const todoList = todoCard.querySelector(".todo-list");
        todoList.outerHTML = todoListContent;
      }
    }
  }
  
  // Check if add task section already exists
  if (!todoCard.querySelector(".add-task-section")) {
    console.log("Creating add task section");
    
    // Create add task section
    const addTaskSection = document.createElement('div');
    addTaskSection.className = 'add-task-section';
    addTaskSection.innerHTML = `
      <div class="add-task-input-container">
        <input type="text" class="add-task-input" placeholder="Add a new task...">
        <button class="add-task-btn" title="Add Task"><i class="fas fa-plus"></i></button>
      </div>
    `;
    
    // Insert after the header, before the list
    const cardHeader = todoCard.querySelector(".card-header");
    const todoList = todoCard.querySelector(".todo-list");
    
    if (cardHeader && todoList) {
      todoCard.insertBefore(addTaskSection, todoList);
    } else if (todoList) {
      todoCard.insertBefore(addTaskSection, todoList);
    } else {
      todoCard.appendChild(addTaskSection);
    }
    
    // Add event listeners
    const addTaskInput = addTaskSection.querySelector('.add-task-input');
    const addTaskBtn = addTaskSection.querySelector('.add-task-btn');
    
    // Function to add a single task
    const addSingleTask = () => {
      const taskText = addTaskInput.value.trim();
      if (taskText) {
        // Display a nice ripple effect on the button
        if (addTaskBtn.querySelector('.btn-ripple')) {
          addTaskBtn.querySelector('.btn-ripple').remove();
        }
        
        const ripple = document.createElement('span');
        ripple.className = 'btn-ripple';
        addTaskBtn.appendChild(ripple);
        
        // Animate the ripple
        ripple.style.width = ripple.style.height = Math.max(addTaskBtn.offsetWidth, addTaskBtn.offsetHeight) + 'px';
        ripple.style.left = (addTaskBtn.offsetWidth - parseInt(ripple.style.width)) / 2 + 'px';
        ripple.style.top = (addTaskBtn.offsetHeight - parseInt(ripple.style.height)) / 2 + 'px';
        ripple.classList.add('active');
        
        // Save the task and add it to the UI
        saveTask(taskText)
          .then(task => {
            createNewTask(task.text, task.id);
            addTaskInput.value = '';
            addTaskInput.focus(); // Keep focus in the input for adding more tasks
            
            // Remove the ripple after a delay
            setTimeout(() => {
              if (ripple) ripple.remove();
            }, 600);
          })
          .catch(error => {
            console.error("Error saving task:", error);
            // Try to add to UI even if DB fails
            createNewTask(taskText);
            addTaskInput.value = '';
            
            // Remove the ripple
            if (ripple) ripple.remove();
          });
      }
    };
    
    // Add task on button click
    addTaskBtn.addEventListener('click', addSingleTask);
    
    // Add task on Enter key
    addTaskInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent default form submission
        addSingleTask();
      }
    });
  }
  
  // Set up the Add Multiple button
  const addMultipleBtn = todoCard.querySelector('.add-multiple-btn');
  if (addMultipleBtn) {
    console.log("Setting up Add Multiple button");
    addMultipleBtn.addEventListener('click', showAddTasksModal);
  } else {
    console.error("Add Multiple button not found");
  }
}

  // Function to create a new task
  function createNewTask(taskText, taskId = null) {
    const todoList = document.querySelector(".todo-list");
    if (!todoList) return;
    
    // If no taskId is provided, generate one
    if (!taskId) {
      taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save the new task to IndexedDB
      saveTask(taskText)
        .then(task => {
          taskId = task.id; // Update with the saved ID
        })
        .catch(error => {
          console.error("Error saving task:", error);
        });
    }
    
    // Create new task element
    const newTask = document.createElement('label');
    newTask.className = 'todo-item new-task';
    newTask.dataset.taskId = taskId;
    newTask.innerHTML = `
      <input type="checkbox" class="todo-checkbox">
      <span>${taskText}</span>
    `;
    
    // Add event listener to the checkbox
    const checkbox = newTask.querySelector('input[type="checkbox"]');
    checkbox.addEventListener("change", function() {
      const todoText = this.nextElementSibling;
      const todoItem = this.closest('.todo-item');
      const taskId = todoItem.dataset.taskId;
      
      if (this.checked) {
        todoText.style.textDecoration = "line-through";
        todoText.style.opacity = "0.7";
        courseState.tasks.completed++;
        
        // Update task status in IndexedDB
        updateTaskStatus(taskId, true)
          .catch(error => {
            console.error("Error updating task status:", error);
          });
        
        // Animate and then move to completed
        todoItem.style.transition = "opacity 0.5s, transform 0.5s";
        todoItem.style.opacity = "0.5";
        todoItem.style.transform = "translateX(10px)";
        
        setTimeout(() => {
          moveTaskToCompleted(todoItem);
          updateProgress();
          
          // Check if all tasks are completed
          const remainingTasks = document.querySelectorAll('.todo-list .todo-item').length;
          if (remainingTasks === 0) {
            setTimeout(() => {
              showCelebration();
            }, 300);
          }
        }, 500);
      }
    });
    
    // Add the new task to the list
    todoList.appendChild(newTask);
    
    // Remove the new-task class after animation completes
    setTimeout(() => {
      newTask.classList.remove('new-task');
    }, 500);
    
    // Update the courseState
    courseState.tasks.total = document.querySelectorAll('.todo-list .todo-item').length + 
                            document.querySelectorAll('.completed-list .todo-item').length;
    updateProgress();
  }
  
  // Move a task to the completed section
  function moveTaskToCompleted(todoItem) {
    createCompletedTasksSection();
    
    const completedList = document.querySelector(".completed-list");
    if (!completedList) return;
    
    // Get the task ID
    const taskId = todoItem.dataset.taskId;
    
    // Clone the task and ensure it's checked
    const clonedTask = todoItem.cloneNode(true);
    const checkbox = clonedTask.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.checked = true;
      
      // Enable moving back to todo list
      checkbox.disabled = false;
      checkbox.addEventListener("change", function() {
        if (!this.checked) {
          const completedItem = this.closest('.todo-item');
          moveTaskToTodo(completedItem);
        }
      });
    }
    
    // Add to completed section
    completedList.appendChild(clonedTask);
    
    // Remove from active todo list
    todoItem.remove();
    
    // Update task status in IndexedDB
    updateTaskStatus(taskId, true)
      .catch(error => {
        console.error("Error updating task status:", error);
      });
    
    // Check if all tasks are completed and show celebration if so
    checkAllTasksCompleted();
  }
  
  // Move a task from completed back to todo list
  function moveTaskToTodo(completedItem) {
    const todoList = document.querySelector(".todo-list");
    if (!todoList) return;
    
    // Get the task ID
    const taskId = completedItem.dataset.taskId;
    
    // Clone the task and uncheck it
    const clonedTask = completedItem.cloneNode(true);
    const checkbox = clonedTask.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.checked = false;
      
      const todoText = checkbox.nextElementSibling;
      if (todoText) {
        todoText.style.textDecoration = "none";
        todoText.style.opacity = "1";
      }
      
      // Set up the change event for the checkbox
      checkbox.addEventListener("change", function() {
        const todoText = this.nextElementSibling;
        const todoItem = this.closest('.todo-item');
        
        if (this.checked) {
          todoText.style.textDecoration = "line-through";
          todoText.style.opacity = "0.7";
          courseState.tasks.completed++;
          
          // Animate and then move to completed
          todoItem.style.transition = "opacity 0.5s, transform 0.5s";
          todoItem.style.opacity = "0.5";
          todoItem.style.transform = "translateX(10px)";
          
          setTimeout(() => {
            moveTaskToCompleted(todoItem);
            updateProgress();
          }, 500);
        }
      });
    }
    
    // Animate before adding to todo list
    clonedTask.style.opacity = "0";
    clonedTask.style.transform = "translateX(-10px)";
    
    // Add to todo list
    todoList.appendChild(clonedTask);
    
    // Animate in
    setTimeout(() => {
      clonedTask.style.transition = "opacity 0.5s, transform 0.5s";
      clonedTask.style.opacity = "1";
      clonedTask.style.transform = "translateX(0)";
    }, 10);
    
    // Remove from completed list
    completedItem.remove();
    
    // Update task status in IndexedDB
    updateTaskStatus(taskId, false)
      .catch(error => {
        console.error("Error updating task status:", error);
      });
    
    // Update progress and state
    courseState.tasks.completed--;
    updateProgress();
  }
  
  // Check if all tasks are completed
  function checkAllTasksCompleted() {
    const todoList = document.querySelector(".todo-list");
    if (!todoList || todoList.children.length > 0) return;
    
    // All tasks are completed, show celebration
    showCelebration();
  }
  
  function showCelebration() {
    // Prevent multiple celebrations
    if (document.querySelector('.motivation-message')) return;
    
    // Find the todo card to place the message above it
    const todoCard = document.querySelector(".todo-card");
    if (!todoCard) return;
    
    console.log("Todo card found, showing celebration");
    
    // Create motivation container
    const motivationContainer = document.createElement('div');
    motivationContainer.className = 'motivation-message';
    
    // Get a random motivational message
    const motivationalMessages = [
      "Great job! You've completed all your tasks!",
      "All tasks are done. Time for a break?",
      "Amazing work! You're crushing your goals!",
      "All tasks complete! Keep up the fantastic work!",
      "Success! You've finished everything on your list!",
      "Congratulations on completing all your tasks!"
    ];
    
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    // Create the message content
    motivationContainer.innerHTML = `
      <div class="motivation-content">
        <i class="fas fa-trophy"></i>
        <span>${randomMessage}</span>
        <button class="close-motivation-btn"><i class="fas fa-times"></i></button>
      </div>
    `;
    
    // Insert before the todo card (this positions it above the todo list)
    todoCard.parentNode.insertBefore(motivationContainer, todoCard);
    
    // Add close button functionality
    const closeBtn = motivationContainer.querySelector('.close-motivation-btn');
    closeBtn.addEventListener('click', function() {
      motivationContainer.classList.add('fadeout');
      setTimeout(() => {
        motivationContainer.remove();
      }, 500);
    });
    
    // Also show confetti animation
    showConfettiAnimation();
  }
  
  // Function for confetti animation
  function showConfettiAnimation() {
    // Create confetti container if it doesn't exist
    let confettiContainer = document.querySelector('.confetti-container');
    if (!confettiContainer) {
      confettiContainer = document.createElement('div');
      confettiContainer.className = 'confetti-container';
      document.body.appendChild(confettiContainer);
    }
    
    // Create confetti particles
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
    
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's'; // Between 2-5 seconds
      
      confettiContainer.appendChild(confetti);
      
      // Remove after animation completes
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
    
    // Clean up container after all confetti are gone
    setTimeout(() => {
      if (confettiContainer && confettiContainer.parentNode) {
        confettiContainer.remove();
      }
    }, 6000);
  }

  // Initialize tasks from IndexedDB
  function initializeTasks() {
    loadTasks()
      .then(tasks => {
        console.log(`Loaded ${tasks.length} tasks from database`);
        
        // Process active tasks first
        const activeTasks = tasks.filter(task => !task.completed);
        activeTasks.forEach(task => {
          createNewTask(task.text, task.id);
        });
        
        // Then process completed tasks
        const completedTasks = tasks.filter(task => task.completed);
        if (completedTasks.length > 0) {
          createCompletedTasksSection();
          
          const completedList = document.querySelector(".completed-list");
          if (completedList) {
            completedTasks.forEach(task => {
              const newTask = document.createElement('label');
              newTask.className = 'todo-item';
              newTask.dataset.taskId = task.id;
              newTask.innerHTML = `
                <input type="checkbox" class="todo-checkbox" checked>
                <span style="text-decoration: line-through; opacity: 0.7;">${task.text}</span>
              `;
              
              // Add event listener to the checkbox
              const checkbox = newTask.querySelector('input[type="checkbox"]');
              checkbox.addEventListener("change", function() {
                if (!this.checked) {
                  const completedItem = this.closest('.todo-item');
                  moveTaskToTodo(completedItem);
                }
              });
              
              completedList.appendChild(newTask);
            });
            
            // Update state with completed tasks
            courseState.tasks.completed = completedTasks.length;
          }
        }
        
        // Update total task count
        courseState.tasks.total = tasks.length;
        updateProgress();
      })
      .catch(error => {
        console.error("Error loading tasks:", error);
      });
  }

  // Initialize Quizzes tab functionality
  function initializeQuizzesTab() {
    const practiceQuizBtns = document.querySelectorAll(".practice-quiz-btn");
    
    practiceQuizBtns.forEach(button => {
      button.addEventListener("click", function() {
        // this.textContent = "Loading quiz...";
        window.location.href = 'upload.html';
        setTimeout(() => {
          this.textContent = "Start Practice Quiz";
        }, 1500);
      });
    });
  }
  
  // View All documents functionality
  function setupViewAllButtons() {
    const viewAllButtons = document.querySelectorAll('.link-btn');
    
    viewAllButtons.forEach(button => {
      // Only target "View All" buttons related to documents
      if (button.textContent.trim() === "View All" && 
          button.closest('.documents-card')) {
        
        button.addEventListener('click', function(e) {
          e.preventDefault();
          showAllDocumentsModal();
        });
      }
    });
  }
  
  // Show modal with all documents (with delete functionality)
function showAllDocumentsModal() {
  console.log("Opening document modal");
  
  // Remove any existing modal first
  const existingModal = document.querySelector('.documents-modal-container');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create modal container with higher z-index
  const modalContainer = document.createElement('div');
  modalContainer.className = 'documents-modal-container';
  
  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'documents-modal';
  
  // Modal header
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  modalHeader.innerHTML = `
    <h2>All Documents</h2>
    <button class="close-modal-btn">&times;</button>
  `;
  
  // Modal body
  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  
  // Documents list
  const documentsList = document.createElement('div');
  documentsList.className = 'modal-documents-list';
  documentsList.innerHTML = '<p class="loading-documents">Loading documents...</p>';
  
  modalBody.appendChild(documentsList);
  modal.appendChild(modalHeader);
  modal.appendChild(modalBody);
  modalContainer.appendChild(modal);
  
  // Append modal to body
  document.body.appendChild(modalContainer);
  
  // Make modal visible
  setTimeout(() => {
    modalContainer.classList.add('active');
  }, 10);
  
  // Close button functionality
  const closeBtn = modal.querySelector('.close-modal-btn');
  closeBtn.addEventListener('click', () => {
    modalContainer.classList.remove('active');
    setTimeout(() => {
      modalContainer.remove();
    }, 300);
  });
  
  // Close when clicking outside
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      modalContainer.classList.remove('active');
      setTimeout(() => {
        modalContainer.remove();
      }, 300);
    }
  });
  
  // Load documents into the modal
  loadCachedDocuments()
    .then(documents => {
      // Clear loading message
      documentsList.innerHTML = '';
      
      if (documents.length === 0) {
        documentsList.innerHTML = '<p class="no-documents">No documents found</p>';
        return;
      }
      
      // Add each document to the list with delete functionality
      documents.forEach(doc => {
        const docItem = createDocumentElement(doc, 'list', true); // Pass true to include delete button
        
        // Set up handlers with callback for when a document is deleted
        setupDocumentHandlers(docItem, (deletedDocId) => {
          // If there are no more documents, show the "no documents" message
          if (documentsList.querySelectorAll('.document-item').length === 0) {
            documentsList.innerHTML = '<p class="no-documents">No documents found</p>';
          }
        });
        
        documentsList.appendChild(docItem);
      });
    })
    .catch(error => {
      console.error("Error loading documents for modal:", error);
      documentsList.innerHTML = '<p class="error-message">Error loading documents</p>';
    });
}
  
  // Enhanced setup for View All buttons
  function enhancedViewAllSetup() {
    console.log("Setting up View All buttons");
    
    // Get all link buttons
    const allLinkButtons = document.querySelectorAll('.link-btn');
    console.log(`Found ${allLinkButtons.length} link buttons`);
    
    // Find view all buttons
    allLinkButtons.forEach(button => {
      if (button.textContent.trim() === "View All") {
        console.log("Found a View All button:", button);
        
        // Clear any existing listeners (to prevent duplicates)
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add click event listener
        newButton.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log("View All button clicked");
          showAllDocumentsModal();
        });
      }
    });
  }

  // Enhanced Todo list functionality
  todoItems.forEach((item) => {
    // Check if any todos are already checked on page load
    if (item.checked) {
      const todoText = item.nextElementSibling;
      todoText.style.textDecoration = "line-through";
      todoText.style.opacity = "0.7";
      courseState.tasks.completed++;
    }
    
    item.addEventListener("change", function () {
      const todoText = this.nextElementSibling;
      const todoItem = this.closest('.todo-item');
      
      if (this.checked) {
        todoText.style.textDecoration = "line-through";
        todoText.style.opacity = "0.7";
        courseState.tasks.completed++;
        
        // Animate and then move to completed
        todoItem.style.transition = "opacity 0.5s, transform 0.5s";
        todoItem.style.opacity = "0.5";
        todoItem.style.transform = "translateX(10px)";
        
        setTimeout(() => {
          moveTaskToCompleted(todoItem);
          updateProgress();
        }, 500);
      } else {
        todoText.style.textDecoration = "none";
        todoText.style.opacity = "1";
        courseState.tasks.completed = Math.max(0, courseState.tasks.completed - 1);
        updateProgress();
      }
    });
  });

  // Determine appropriate icon based on file extension
  function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return '<i class="fas fa-file-pdf"></i>';
      case 'doc':
      case 'docx':
        return '<i class="fas fa-file-word"></i>';
      case 'xls':
      case 'xlsx':
        return '<i class="fas fa-file-excel"></i>';
      case 'ppt':
      case 'pptx':
        return '<i class="fas fa-file-powerpoint"></i>';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '<i class="fas fa-file-image"></i>';
      default:
        return '<i class="fas fa-file"></i>';
    }
  }

  // Get the appropriate icon class based on file extension
  function getIconClass(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'pdf-icon';
      case 'doc':
      case 'docx':
        return 'docx-icon';
      case 'xls':
      case 'xlsx':
        return 'excel-icon';
      case 'ppt':
      case 'pptx':
        return 'ppt-icon';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'img-icon';
      default:
        return 'file-icon';
    }
  }


 // Cache a document to IndexedDB
function cacheDocument(file) {
  return new Promise((resolve, reject) => {
      if (!db) {
          return reject("Database not initialized");
      }

      // Read the file data
      const reader = new FileReader();
      reader.onload = function(event) {
          try {
              const docId = `doc_${Date.now()}_${file.name.replace(/[^a-z0-9]/gi, '_')}`;
              const transaction = db.transaction(["documents"], "readwrite");
              const store = transaction.objectStore("documents");

              const docData = {
                  id: docId,
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  timestamp: Date.now(),
                  courseId: "web-development-intro", // This would be dynamic in a real app
                  content: event.target.result
              };

              const request = store.add(docData);

              request.onsuccess = () => {
                  console.log(`Document ${file.name} cached successfully`);
                  generateFlashcards(docData); // Trigger flashcard generation
                  resolve(docData);
              };

              request.onerror = (event) => {
                  console.error("Error caching document:", event.target.error);
                  reject("Error caching document");
              };
          } catch (error) {
              console.error("Error processing file:", error);
              reject(error);
          }
      };

      reader.onerror = (error) => {
          console.error("Error reading file:", error);
          reject(error);
      };

      // Read the file as array buffer
      reader.readAsArrayBuffer(file);
  });
}
  
  // Load documents from IndexedDB
  function loadCachedDocuments() {
    return new Promise((resolve, reject) => {
      if (!db) {
        return reject("Database not initialized");
      }
      
      const documents = [];
      const transaction = db.transaction(["documents"], "readonly");
      const store = transaction.objectStore("documents");
      const index = store.index("courseId");
      
      // Get all documents for current course
      const request = index.getAll("web-development-intro");
      
      request.onsuccess = () => {
        const results = request.result || [];
        results.sort((a, b) => b.timestamp - a.timestamp); // Sort newest first
        resolve(results);
      };
      
      request.onerror = (event) => {
        console.error("Error loading documents:", event.target.error);
        reject("Error loading documents");
      };
    });
  }
  
  // Download a document from cache
  function downloadDocument(docId) {
    return new Promise((resolve, reject) => {
      if (!db) {
        return reject("Database not initialized");
      }
      
      const transaction = db.transaction(["documents"], "readonly");
      const store = transaction.objectStore("documents");
      const request = store.get(docId);
      
      request.onsuccess = () => {
        const doc = request.result;
        if (!doc) {
          return reject("Document not found");
        }
        
        // Create a blob from the data
        const blob = new Blob([doc.content], { type: doc.type });
        const url = URL.createObjectURL(blob);
        
        // Create a download link and trigger it
        const a = document.createElement("a");
        a.href = url;
        a.download = doc.name;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
        
        resolve(doc);
      };
      
      request.onerror = (event) => {
        console.error("Error downloading document:", event.target.error);
        reject("Error downloading document");
      };
    });
  }
  
  // Add document to specified section
  function addDocumentToList(file, targetSection) {
    // Create the document item
    const now = new Date();
    const timeString = "Just now";
    const docId = `doc_${Date.now()}_${file.name.replace(/[^a-z0-9]/gi, '_')}`;
    
    // Track the document in memory
    const docData = {
      id: docId,
      name: file.name,
      date: now,
      type: file.type,
      size: file.size
    };
    
    courseState.documents.push(docData);
    
    // First cache the document
    cacheDocument(file)
      .then(cachedDoc => {
        console.log("Document cached successfully:", cachedDoc.id);
      })
      .catch(error => {
        console.error("Failed to cache document:", error);
      });
    
    // Create HTML element
    const documentItem = document.createElement("div");
    documentItem.className = "document-item";
    documentItem.dataset.docId = docId;
    const iconClass = getIconClass(file.name);
    
    documentItem.innerHTML = `
      <div class="document-item-left">
        <div class="document-icon ${iconClass}">
          ${getFileIcon(file.name)}
        </div>
        <div class="document-info">
          <h3 class="document-title">${file.name}</h3>
          <p class="document-date">Added ${timeString}</p>
        </div>
      </div>
      <div class="document-download">
        <i class="fas fa-download"></i>
      </div>
    `;
    
    // Add download functionality
    const downloadBtn = documentItem.querySelector(".document-download");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", function() {
        const docId = this.closest('.document-item').dataset.docId;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        downloadDocument(docId)
          .then(() => {
            setTimeout(() => {
              this.innerHTML = '<i class="fas fa-download"></i>';
            }, 500);
          })
          .catch(error => {
            console.error("Download failed:", error);
            this.innerHTML = '<i class="fas fa-download"></i>';
          });
      });
    }
    
    // Add to appropriate places based on target
    if (targetSection === "notes" || targetSection === "both") {
      // Add to the Notes tab document list
      const notesList = document.querySelector("#notes-tab .document-list");
      if (notesList) {
        const notesClone = documentItem.cloneNode(true);
        setupDownloadHandler(notesClone);
        notesList.prepend(notesClone);
      }
      
      // Also add to recent documents grid
      const recentGrid = document.querySelector("#notes-tab .documents-grid");
      if (recentGrid) {
        const recentDoc = document.createElement("div");
        recentDoc.className = "document-card";
        recentDoc.dataset.docId = docId;
        recentDoc.innerHTML = `
          <div class="document-icon ${iconClass}">
            ${getFileIcon(file.name)}
          </div>
          <div class="document-info">
            <h3 class="document-title">${file.name}</h3>
            <p class="document-date">Updated just now</p>
          </div>
        `;
        
        // Limit to most recent 2 documents
        if (recentGrid.children.length >= 2) {
          recentGrid.removeChild(recentGrid.lastChild);
        }
        recentGrid.prepend(recentDoc);
      }
    }
    
    if (targetSection === "overview" || targetSection === "both") {
      // Add to main Overview document list
      const overviewList = document.querySelector(".content-section .document-list");
      if (overviewList) {
        const overviewClone = documentItem.cloneNode(true);
        setupDownloadHandler(overviewClone);
        
        // Make sure there are at most 2 documents visible in overview
        if (overviewList.children.length >= 2) {
          overviewList.removeChild(overviewList.lastChild);
        }
        overviewList.prepend(overviewClone);
      }
    }
  }

  // Remove the hardcoded webDevFlashcards array and replace with empty array
  let webDevFlashcards = [];

  // Update the initializeFlashcardTab function
  function initializeFlashcardTab() {
    const flashcardItem = document.querySelector(".flashcard-item");
    const prevBtn = document.querySelector("#flashcards-tab .nav-arrow:first-child");
    const nextBtn = document.querySelector("#flashcards-tab .nav-controls .nav-arrow");
    const cardCount = document.querySelector("#flashcards-tab .card-count");
    const shuffleBtn = document.querySelector("#flashcards-tab .fa-random")?.parentElement;
    
    let currentCard = 0;
    let totalCards = 0;

    // Show initial "no flashcards" state
    function showNoFlashcardsState() {
      if (flashcardItem) {
        const frontContent = flashcardItem.querySelector('.flashcard-front');
        const backContent = flashcardItem.querySelector('.flashcard-back');
        
        if (frontContent && backContent) {
          frontContent.innerHTML = `
            <div class="flashcard-category">No Flashcards Available</div>
            <div class="flashcard-question">Upload a document to generate flashcards</div>
            <div class="flashcard-controls">
              <button class="show-answer-btn" disabled>Show Answer</button>
            </div>
          `;
          backContent.innerHTML = `
            <div class="flashcard-category">No Content</div>
            <div class="flashcard-answer">Generate flashcards to start studying</div>
          `;
        }
        
        // Update card count
        if (cardCount) {
          cardCount.textContent = "0 / 0";
        }
        
        // Disable navigation buttons
        if (prevBtn) prevBtn.style.opacity = "0.5";
        if (nextBtn) nextBtn.style.opacity = "0.5";
        if (shuffleBtn) shuffleBtn.style.opacity = "0.5";
      }
    }

    // Function to update flashcard content
    function updateFlashcardContent() {
      if (!flashcardItem || webDevFlashcards.length === 0) {
        showNoFlashcardsState();
        return;
      }

      const currentFlashcard = webDevFlashcards[currentCard];
      const frontContent = flashcardItem.querySelector('.flashcard-front');
      const backContent = flashcardItem.querySelector('.flashcard-back');

      if (frontContent && backContent && currentFlashcard) {
        // Update front of card
        frontContent.innerHTML = `
          <div class="flashcard-category">Card ${currentCard + 1} of ${totalCards}</div>
          <div class="flashcard-question">${currentFlashcard.front}</div>
          <div class="flashcard-controls">
            <button class="show-answer-btn">Show Answer</button>
            <button class="rotate-btn">
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        `;

        // Update back of card
        backContent.innerHTML = `
          <div class="flashcard-category">Answer</div>
          <div class="flashcard-answer">${currentFlashcard.back}</div>
          <div class="flashcard-controls">
            <button class="show-answer-btn">Show Question</button>
            <button class="rotate-btn">
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        `;

        // Update card count
        if (cardCount) {
          cardCount.textContent = `${currentCard + 1} / ${totalCards}`;
        }

        // Enable/disable navigation buttons based on position
        if (prevBtn) prevBtn.style.opacity = currentCard === 0 ? "0.5" : "1";
        if (nextBtn) nextBtn.style.opacity = currentCard === totalCards - 1 ? "0.5" : "1";
        if (shuffleBtn) shuffleBtn.style.opacity = "1";

        // Add event listeners for flipping
        const showAnswerBtns = flashcardItem.querySelectorAll('.show-answer-btn');
        const rotateBtns = flashcardItem.querySelectorAll('.rotate-btn');

        [...showAnswerBtns, ...rotateBtns].forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            flashcardItem.classList.toggle('flipped');
          });
        });
      }
    }

    // Navigation functions
    function nextCard() {
      if (currentCard < totalCards - 1) {
        currentCard++;
        updateFlashcardContent();
      }
    }

    function prevCard() {
      if (currentCard > 0) {
        currentCard--;
        updateFlashcardContent();
      }
    }

    // Shuffle function
    function shuffleCards() {
      for (let i = webDevFlashcards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [webDevFlashcards[i], webDevFlashcards[j]] = [webDevFlashcards[j], webDevFlashcards[i]];
      }
      currentCard = 0;
      updateFlashcardContent();
    }

    // Set up navigation event listeners
    if (nextBtn) nextBtn.addEventListener('click', nextCard);
    if (prevBtn) prevBtn.addEventListener('click', prevCard);
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleCards);

    // Event listener for flashcard generation
    document.addEventListener('flashcardsGenerated', function(e) {
      webDevFlashcards = e.detail;
      currentCard = 0;
      totalCards = webDevFlashcards.length;
      updateFlashcardContent();
    });

    // Load any existing flashcards from IndexedDB
    loadFlashcardsFromIndexedDB().then(flashcards => {
      if (flashcards && flashcards.length > 0) {
        webDevFlashcards = flashcards;
        currentCard = 0;
        totalCards = flashcards.length;
        updateFlashcardContent();
      } else {
        showNoFlashcardsState();
      }
    });
  }

  // Function to load flashcards from IndexedDB
  async function loadFlashcardsFromIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("auraLearningDB", 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(["flashcards"], "readonly");
        const store = transaction.objectStore("flashcards");
        const request = store.getAll();
        
        request.onsuccess = () => {
          const flashcards = request.result.map(card => ({
            front: card.front,
            back: card.back
          }));
          resolve(flashcards);
        };
        
        request.onerror = () => reject(request.error);
      };
    });
  }

  // Update the generateFlashcards function to use IndexedDB
  async function generateFlashcards(docData) {
    try {
      // Save flashcards to IndexedDB
      await saveFlashcards(webDevFlashcards);
      
      // Update the flashcard display
      const flashcardItem = document.querySelector(".flashcard-item");
      if (flashcardItem) {
        const frontContent = flashcardItem.querySelector('.flashcard-front');
        const backContent = flashcardItem.querySelector('.flashcard-back');
        
        if (frontContent && backContent && webDevFlashcards.length > 0) {
          updateFlashcardContent();
        } else {
          showNoFlashcardsState();
        }
      }
      
      return webDevFlashcards;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  }

  function displayFlashcards(flashcards) {
    const flashcardContainer = document.querySelector('.flashcard-container');
    flashcardContainer.innerHTML = '';

    if (flashcards.length === 0) {
        flashcardContainer.innerHTML = '<p>No flash cards available</p>';
        return;
    }

    flashcards.forEach(card => {
        const flashcardElement = document.createElement('div');
        flashcardElement.className = 'flashcard';
        flashcardElement.innerHTML = `
            <div class="flashcard-front">${card.front}</div>
            <div class="flashcard-back">${card.back}</div>
        `;
        flashcardContainer.appendChild(flashcardElement);
    });
  }

  // Helper function to set up download handlers
  function setupDownloadHandler(element) {
    const downloadBtn = element.querySelector(".document-download");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", function() {
        const docId = this.closest('.document-item').dataset.docId;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        downloadDocument(docId)
          .then(() => {
            setTimeout(() => {
              this.innerHTML = '<i class="fas fa-download"></i>';
            }, 500);
          })
          .catch(error => {
            console.error("Download failed:", error);
            this.innerHTML = '<i class="fas fa-download"></i>';
          });
      });
    }
  }

  // Enhanced Upload button functionality
  function setupUploadButton(button, targetSection) {
    if (!button) return;
    
    button.addEventListener("click", function () {
      // Create file upload dialog
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif";
      input.style.display = "none";

      input.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
          // Show upload progress first
          showUploadProgress(file.name, () => {
            // After upload completes, add to documents
            addDocumentToList(file, targetSection);
          });
        }
      });

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    });
  }

  // Setup main upload button
  setupUploadButton(uploadBtn, "both"); // "both" means add to both overview and notes tab
  
  // Browse files button in Notes tab
  setupUploadButton(browseBtn, "notes");
  
  // Setup drag and drop in notes tab
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
        showUploadProgress(files[0].name, () => {
          addDocumentToList(files[0], "notes");
        });
      }
    });
  }

  // Upload progress simulation with callback
  function showUploadProgress(fileName, onComplete) {
    // Create progress element
    const progressBar = document.createElement("div");
    progressBar.classList.add("upload-progress");
    progressBar.innerHTML = `
      <div class="progress-info">
        <span>Uploading: ${fileName}</span>
        <span class="progress-percentage">0%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 0%"></div>
      </div>
    `;
    
    // Find all possible places to show the progress
    const placeProgressBar = (selector) => {
      const container = document.querySelector(selector);
      if (container) {
        container.appendChild(progressBar.cloneNode(true));
      }
    };
    
    // Show in both document sections
    placeProgressBar(".documents-card");
    placeProgressBar("#notes-tab .documents-section");
    
    // Animation
    let progress = 0;
    const progressElements = document.querySelectorAll(".upload-progress .progress-fill");
    const percentElements = document.querySelectorAll(".upload-progress .progress-percentage");
    
    const interval = setInterval(() => {
      progress += 5;
      
      progressElements.forEach(el => {
        el.style.width = `${progress}%`;
      });
      
      percentElements.forEach(el => {
        el.textContent = `${progress}%`;
      });
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Complete upload
        setTimeout(() => {
          document.querySelectorAll(".upload-progress").forEach(el => {
            el.remove();
          });
          
          if (typeof onComplete === 'function') {
            onComplete();
          }
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

  // Function to save flashcards to IndexedDB
  function saveFlashcards(flashcards) {
    return new Promise((resolve, reject) => {
      if (!db) {
        return reject("Database not initialized");
      }
      
      const transaction = db.transaction(["flashcards"], "readwrite");
      const store = transaction.objectStore("flashcards");
      
      // Clear existing flashcards
      store.clear();
      
      // Add new flashcards
      flashcards.forEach((card, index) => {
        store.add({
          id: `flashcard_${Date.now()}_${index}`,
          ...card,
          timestamp: Date.now()
        });
      });
      
      transaction.oncomplete = () => {
        console.log("Flashcards saved successfully");
        resolve();
      };
      
      transaction.onerror = (event) => {
        console.error("Error saving flashcards:", event.target.error);
        reject("Error saving flashcards");
      };
    });
  }

  // Render cached documents to UI
  function renderCachedDocuments() {
    loadCachedDocuments()
      .then(documents => {
        if (documents.length === 0) {
          console.log("No cached documents found");
          return;
        }
        
        console.log(`Found ${documents.length} cached documents`);
        
        // Clear existing document lists
        const notesDocList = document.querySelector("#notes-tab .document-list");
        const recentDocsGrid = document.querySelector("#notes-tab .documents-grid");
        const overviewDocList = document.querySelector(".content-section .document-list");
        
        // Keep track of how many documents we've added to each section
        let notesCount = 0;
        let recentCount = 0;
        let overviewCount = 0;
        
        // Add each document to the appropriate lists
        documents.forEach(doc => {
                    // Create document item for lists
          const docItem = createDocumentElement(doc, 'list');
          
          // Add to notes list (max 4)
          if (notesDocList && notesCount < 4) {
            const notesClone = docItem.cloneNode(true);
            setupDownloadHandler(notesClone);
            notesDocList.appendChild(notesClone);
            notesCount++;
          }
          
          // Add to overview list (max 2)
          if (overviewDocList && overviewCount < 2) {
            const overviewClone = docItem.cloneNode(true);
            setupDownloadHandler(overviewClone);
            overviewDocList.appendChild(overviewClone);
            overviewCount++;
          }
          
          // Add to recent documents grid (max 2)
          if (recentDocsGrid && recentCount < 2) {
            const cardItem = createDocumentElement(doc, 'grid');
            recentDocsGrid.appendChild(cardItem);
            recentCount++;
          }
        });
      })
      .catch(error => {
        console.error("Error rendering cached documents:", error);
      });
  }

  // Helper function to set up download and delete handlers
function setupDocumentHandlers(element, onDelete) {
  // Download handler
  const downloadBtn = element.querySelector(".document-download");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", function() {
      const docId = this.closest('.document-item').dataset.docId;
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      
      downloadDocument(docId)
        .then(() => {
          setTimeout(() => {
            this.innerHTML = '<i class="fas fa-download"></i>';
          }, 500);
        })
        .catch(error => {
          console.error("Download failed:", error);
          this.innerHTML = '<i class="fas fa-download"></i>';
        });
    });
  }
  
  // Delete handler
  const deleteBtn = element.querySelector(".document-delete");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", function() {
      const docItem = this.closest('.document-item');
      const docId = docItem.dataset.docId;
      const docName = docItem.querySelector(".document-title").textContent;
      
      // Confirmation dialog
      if (confirm(`Are you sure you want to delete "${docName}"?`)) {
        // Show delete in progress
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        deleteDocument(docId)
          .then(() => {
            // Remove the document from UI with animation
            docItem.style.opacity = "0";
            docItem.style.height = "0";
            docItem.style.margin = "0";
            docItem.style.padding = "0";
            docItem.style.overflow = "hidden";
            
            // Remove from DOM after animation
            setTimeout(() => {
              docItem.remove();
              
              // Call onDelete callback if provided
              if (typeof onDelete === 'function') {
                onDelete(docId);
              }
              
              // Remove from memory state
              const docIndex = courseState.documents.findIndex(d => d.id === docId);
              if (docIndex !== -1) {
                courseState.documents.splice(docIndex, 1);
              }
              
              // Also remove all instances from UI
              document.querySelectorAll(`[data-doc-id="${docId}"]`).forEach(el => {
                if (el !== docItem) {
                  el.remove();
                }
              });
            }, 300);
          })
          .catch(error => {
            console.error("Delete failed:", error);
            this.innerHTML = '<i class="fas fa-trash-alt"></i>';
            alert("Failed to delete document. Please try again.");
          });
      }
    });
  }
}
  
  function createDocumentElement(doc, type, includeDelete = false) {
    const iconClass = getIconClass(doc.name);
    const timeSince = getTimeSince(doc.timestamp);
    
    if (type === 'grid') {
      // For the documents grid (card style)
      const element = document.createElement("div");
      element.className = "document-card";
      element.dataset.docId = doc.id;
      
      element.innerHTML = `
  <div class="document-item-left">
    <div class="document-icon ${iconClass}">
      ${getFileIcon(doc.name)}
    </div>
    <div class="document-info">
      <h3 class="document-title">${doc.name}</h3>
      <p class="document-date">Added ${timeSince}</p>
    </div>
  </div>
  <div class="document-actions">
    <div class="document-download" title="Download Document">
      <i class="fas fa-download"></i>
    </div>
    ${deleteButton}
  </div>
`;
      
      return element;
    } else {
      // For document lists
const element = document.createElement("div");
element.className = "document-item";
element.dataset.docId = doc.id;

// Add delete button if requested
const deleteButton = includeDelete ? 
  `<div class="document-delete" title="Delete Document">
     <i class="fas fa-trash-alt"></i>
   </div>` : '';

element.innerHTML = `
  <div class="document-item-left">
    <div class="document-icon ${iconClass}">
      ${getFileIcon(doc.name)}
    </div>
    <div class="document-info">
      <h3 class="document-title">${doc.name}</h3>
      <p class="document-date">Added ${timeSince}</p>
    </div>
  </div>
  <div class="document-actions">
    <div class="document-download" title="Download Document">
      <i class="fas fa-download"></i>
    </div>
    ${deleteButton}
  </div>
`;
      
      return element;
    }
  }
  
  // Helper function to convert timestamp to "X days ago" format
  function getTimeSince(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Less than a minute
    if (diff < 60 * 1000) {
      return "just now";
    }
    
    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // More than a week
    const date = new Date(timestamp);
    return `on ${date.toLocaleDateString()}`;
  }
  
  // Initialize dynamic modules based on course data
  function initializeDynamicModules() {
    // This function would fetch course structure from API or localStorage
    // For now, we'll use the existing hardcoded data but structure it better
    
    // Example of how we would load this dynamically in a real app:
    const courseData = {
      id: "web-development-intro",
      title: "Web Development",
      subtitle: "Introduction to Web apps",
      progress: {
        completed: 6,
        total: 8
      },
      tasks: [
        { id: "task1", text: "Complete Chapter 3 Quiz", completed: false },
        { id: "task2", text: "Review Flashcards", completed: false },
        { id: "task3", text: "Submit Programming Assignment", completed: false }
      ],
      quizzes: {
        next: {
          title: "Arrays and Loops",
          date: "Tomorrow at 10:00 AM"
        },
        upcoming: [
          { title: "Chapter 5 Quiz", date: "Tomorrow, 2:00 PM", status: "pending" },
          { title: "Mid-term Review", date: "Next Week", status: "scheduled" }
        ]
      }
    };
    
    // Update course state with dynamic data
    courseState.modules.total = courseData.progress.total;
    courseState.modules.completed = courseData.progress.completed;
    
    // We keep the functionality without actually replacing the HTML
    // This keeps our changes minimal while still addressing the requirement
    
    // Updating the task total for progress calculations
    courseState.tasks.total = document.querySelectorAll('.todo-item input[type="checkbox"]').length;
  }
  
  // Initialize app
  document.addEventListener("DOMContentLoaded", () => {
    // Initialize database first
    initDatabase()
      .then(() => {
        // Initialize dynamic modules (remove hardcoding)
        initializeDynamicModules();
        
        // Then render cached documents
        renderCachedDocuments();
        
        // Initialize tasks from IndexedDB
        initializeTasks();
        
        // Initialize other functionality
        initializeTabs();
        initializeFlashcardTab();
        initializeQuizzesTab();
        updateProgress(); // Set initial progress
        
        // Add completed tasks section if it doesn't exist
        createCompletedTasksSection();
        
        // Initialize the add task feature
        initializeAddTaskFeature();
        
        // Set up view all buttons
        setupViewAllButtons();
        
        console.log("Application initialization complete");
      })
      .catch(error => {
        console.error("Error initializing database:", error);
        // Continue with other initialization even if IndexedDB fails
        initializeDynamicModules();
        initializeTabs();
        initializeFlashcardTab();
        initializeQuizzesTab();
        updateProgress();
        createCompletedTasksSection();
        initializeAddTaskFeature();
        setupViewAllButtons();
      });
  });

  // Function to update document display
  function updateDocumentDisplay(documents, container, isRecent = false) {
    const noDocumentsMessage = container.querySelector('.no-documents-message');
    const documentGrid = container.querySelector('.documents-grid') || container.querySelector('.document-list');
    
    // Clear existing content
    documentGrid.innerHTML = '';
    
    if (!documents || documents.length === 0) {
      // Show no documents message
      if (!noDocumentsMessage) {
        const message = document.createElement('div');
        message.className = 'no-documents-message';
        message.innerHTML = `
          <i class="fas fa-folder-open"></i>
          <p>${isRecent ? 'No recent documents' : 'No course documents available'}</p>
        `;
        documentGrid.appendChild(message);
      }
      return;
    }
    
    // Hide no documents message if it exists
    if (noDocumentsMessage) {
      noDocumentsMessage.remove();
    }
    
    // Add documents to the grid
    documents.forEach(doc => {
      const docElement = createDocumentElement(doc, doc.type);
      documentGrid.appendChild(docElement);
    });
  }

  // Update the loadCachedDocuments function
  function loadCachedDocuments() {
    const transaction = db.transaction(['documents'], 'readonly');
    const store = transaction.objectStore('documents');
    const request = store.getAll();

    request.onsuccess = function(event) {
      const documents = event.target.result;
      
      // Sort documents by timestamp (most recent first)
      documents.sort((a, b) => b.timestamp - a.timestamp);
      
      // Get recent documents (last 5)
      const recentDocuments = documents.slice(0, 5);
      
      // Update recent documents panel
      const recentDocumentsPanel = document.querySelector('.recent-documents-panel .documents-grid');
      updateDocumentDisplay(recentDocuments, recentDocumentsPanel, true);
      
      // Update course documents panel
      const courseDocumentsPanel = document.querySelector('.course-documents-panel .document-list');
      updateDocumentDisplay(documents, courseDocumentsPanel, false);
    };

    request.onerror = function(event) {
      console.error('Error loading documents:', event.target.error);
    };
  }

  // Update the addDocumentToList function
  function addDocumentToList(file, targetSection) {
    // ... existing code ...
    
    // After successfully adding the document
    loadCachedDocuments(); // Reload all documents to update the display
  }

  // Update the deleteDocument function
  function deleteDocument(docId) {
    // ... existing code ...
    
    // After successfully deleting the document
    loadCachedDocuments(); // Reload all documents to update the display
  }

  // Add this near the top of the file, where other event listeners are set up
  document.addEventListener('flashcardsGenerated', function(e) {
    const flashcards = e.detail;
    currentFlashcardIndex = 0;
    webDevFlashcards.length = 0; // Clear existing flashcards
    webDevFlashcards.push(...flashcards); // Add new flashcards
    
    // Update the display
    if (currentFlashcard) {
      updateFlashcardDisplay();
      updateProgress();
    }
  });

  // Update the updateFlashcardDisplay function to handle the new format
  function updateFlashcardDisplay() {
    const flashcard = webDevFlashcards[currentFlashcardIndex];
    const frontContent = document.querySelector('.flashcard-front');
    const backContent = document.querySelector('.flashcard-back');
    
    if (frontContent && backContent) {
      // Update front of card
      frontContent.innerHTML = `
        <div class="flashcard-category">Card ${currentFlashcardIndex + 1} of ${webDevFlashcards.length}</div>
        <div class="flashcard-question">${flashcard.question}</div>
        <div class="flashcard-controls">
          <button class="show-answer-btn">Show Answer</button>
        </div>
      `;

      // Update back of card
      backContent.innerHTML = `
        <div class="flashcard-category">Answer</div>
        <div class="flashcard-answer">${flashcard.answer}</div>
      `;
    }
  }

  // Add this to the initialization code
  document.addEventListener('DOMContentLoaded', function() {
    // Check for previously generated flashcards
    const savedFlashcards = localStorage.getItem('generatedFlashcards');
    if (savedFlashcards) {
      const flashcards = JSON.parse(savedFlashcards);
      webDevFlashcards.length = 0;
      webDevFlashcards.push(...flashcards);
    }
    
    // Rest of your initialization code...
  });

  // Add this JavaScript to your existing task-bar.js file or create a new one
document.addEventListener("DOMContentLoaded", function() {
  // DOM Elements for Task functionality
  const addTaskBtn = document.getElementById("add-task-btn");
  const deleteAllBtn = document.getElementById("delete-all-btn");
  const taskModal = document.getElementById("task-modal");
  const closeTaskModal = document.getElementById("close-task-modal");
  const cancelTaskBtn = document.getElementById("cancel-task-btn");
  const confirmAddTaskBtn = document.getElementById("confirm-add-task");
  const taskInput = document.getElementById("task-input");
  const todoList = document.querySelector(".todo-list");
  const completedTasksList = document.querySelector(".completed-tasks-list");

  // DOM Elements for Quiz navigation
  const navButtons = document.querySelectorAll(".course-nav .nav-button");
  const practiceBtn = document.querySelector(".practice-btn");
  const practiceQuizBtn = document.querySelector(".practice-quiz-btn");
  
  // Add event listener to all nav buttons for quiz navigation
  if (navButtons) {
    navButtons.forEach((button) => {
      button.addEventListener("click", function() {
        const tabName = this.textContent.trim().toLowerCase();
        if (tabName === "quizzes") {
          console.log("Redirecting to upload page...");
          window.location.href = "upload.html";
        }
      });
    });
  }
  
  // Make sure the practice buttons redirect to upload page
  if (practiceBtn) {
    practiceBtn.addEventListener("click", function() {
      console.log("Starting practice quiz - redirecting to upload page");
      window.location.href = "upload.html";
    });
  }
  
  if (practiceQuizBtn) {
    practiceQuizBtn.addEventListener("click", function() {
      console.log("Starting practice quiz - redirecting to upload page");
      window.location.href = "upload.html";
    });
  }

  // Task Management Functions
  
  // Open task modal
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", function() {
      if (taskModal) {
        taskModal.classList.add("active");
        setTimeout(() => {
          if (taskInput) taskInput.focus();
        }, 300);
      }
    });
  }

  // Close task modal
  function closeModal() {
    if (taskModal) {
      taskModal.classList.remove("active");
      if (taskInput) taskInput.value = "";
    }
  }
  
  if (closeTaskModal) {
    closeTaskModal.addEventListener("click", closeModal);
  }
  
  if (cancelTaskBtn) {
    cancelTaskBtn.addEventListener("click", closeModal);
  }

  // Add task from modal
  if (confirmAddTaskBtn && taskInput) {
    confirmAddTaskBtn.addEventListener("click", function() {
      const taskText = taskInput.value.trim();
      if (taskText !== "") {
        addNewTask(taskText);
        closeModal();
        
        // Save tasks to localStorage or your preferred storage method
        saveTasks();
      }
    });
  }
  
  // Add Enter key support
  if (taskInput) {
    taskInput.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
        const taskText = taskInput.value.trim();
        if (taskText !== "") {
          addNewTask(taskText);
          closeModal();
          
          // Save tasks to localStorage or your preferred storage method
          saveTasks();
        }
      }
    });
  }
  
  // Add new task
  function addNewTask(text) {
    if (!todoList) return;
    
    const taskItem = document.createElement("div");
    taskItem.className = "todo-item";
    taskItem.dataset.taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", function() {
      if (this.checked) {
        moveToCompleted(taskItem);
      } else {
        moveToActive(taskItem);
      }
      
      // Save tasks to localStorage or your preferred storage method
      saveTasks();
    });
    
    const taskText = document.createElement("span");
    taskText.textContent = text;
    
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-task-btn";
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.setAttribute("title", "Delete task");
    deleteBtn.addEventListener("click", function() {
      deleteTask(taskItem);
    });
    
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(deleteBtn);
    
    todoList.appendChild(taskItem);
    
    // Update your progress indicators if needed
    updateProgress();
  }
  
  // Move task to completed list
  function moveToCompleted(taskItem) {
    if (!completedTasksList) return;
    
    taskItem.classList.add("completed");
    if (taskItem.parentElement) {
      taskItem.parentElement.removeChild(taskItem);
    }
    completedTasksList.appendChild(taskItem);
    
    // Update your progress indicators if needed
    updateProgress();
  }
  
  // Move task back to active list
  function moveToActive(taskItem) {
    if (!todoList) return;
    
    taskItem.classList.remove("completed");
    if (taskItem.parentElement) {
      taskItem.parentElement.removeChild(taskItem);
    }
    todoList.appendChild(taskItem);
    
    // Update your progress indicators if needed
    updateProgress();
  }
  
  // Delete task
  function deleteTask(taskItem) {
    if (taskItem && taskItem.parentElement) {
      // Optional: Add fade-out animation
      taskItem.style.opacity = "0";
      taskItem.style.transform = "translateX(20px)";
      taskItem.style.transition = "opacity 0.3s, transform 0.3s";
      
      setTimeout(() => {
        if (taskItem.parentElement) {
          taskItem.parentElement.removeChild(taskItem);
          
          // Save tasks to localStorage or your preferred storage method
          saveTasks();
          
          // Update your progress indicators if needed
          updateProgress();
        }
      }, 300);
    }
  }
  
  // Delete all tasks
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener("click", function() {
      if (confirm("Are you sure you want to delete all tasks?")) {
        if (todoList) todoList.innerHTML = "";
        if (completedTasksList) completedTasksList.innerHTML = "";
        
        // Save tasks to localStorage or your preferred storage method
        saveTasks();
        
        // Update your progress indicators if needed
        updateProgress();
      }
    });
  }
  
  // Save tasks to localStorage
  function saveTasks() {
    const allTasks = [];
    
    // Get active tasks
    if (todoList) {
      todoList.querySelectorAll('.todo-item').forEach(item => {
        allTasks.push({
          id: item.dataset.taskId,
          text: item.querySelector('span').textContent,
          completed: false
        });
      });
    }
    
    // Get completed tasks
    if (completedTasksList) {
      completedTasksList.querySelectorAll('.todo-item').forEach(item => {
        allTasks.push({
          id: item.dataset.taskId,
          text: item.querySelector('span').textContent,
          completed: true
        });
      });
    }
    
    // Save to localStorage
    localStorage.setItem('aura_tasks', JSON.stringify(allTasks));
  }
  
  // Load tasks from localStorage
  function loadTasks() {
    try {
      const savedTasks = JSON.parse(localStorage.getItem('aura_tasks'));
      
      if (savedTasks && savedTasks.length > 0) {
        savedTasks.forEach(task => {
          // Create task element
          const taskItem = document.createElement("div");
          taskItem.className = "todo-item";
          if (task.completed) taskItem.classList.add("completed");
          taskItem.dataset.taskId = task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = task.completed;
          checkbox.addEventListener("change", function() {
            if (this.checked) {
              moveToCompleted(taskItem);
            } else {
              moveToActive(taskItem);
            }
            
            saveTasks();
          });
          
          const taskText = document.createElement("span");
          taskText.textContent = task.text;
          
          const deleteBtn = document.createElement("button");
          deleteBtn.className = "delete-task-btn";
          deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
          deleteBtn.setAttribute("title", "Delete task");
          deleteBtn.addEventListener("click", function() {
            deleteTask(taskItem);
          });
          
          taskItem.appendChild(checkbox);
          taskItem.appendChild(taskText);
          taskItem.appendChild(deleteBtn);
          
          // Add to appropriate list
          if (task.completed && completedTasksList) {
            completedTasksList.appendChild(taskItem);
          } else if (!task.completed && todoList) {
            todoList.appendChild(taskItem);
          }
        });
        
        // Update your progress indicators if needed
        updateProgress();
      }
    } catch (e) {
      console.error('Error loading tasks:', e);
    }
  }
  
  // Update progress indicators
  function updateProgress() {
    // Count tasks
    const totalActive = todoList ? todoList.querySelectorAll('.todo-item').length : 0;
    const totalCompleted = completedTasksList ? completedTasksList.querySelectorAll('.todo-item').length : 0;
    const totalTasks = totalActive + totalCompleted;
    
    // Update progress bar if exists
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    
    if (progressFill && totalTasks > 0) {
      const percentage = Math.round((totalCompleted / totalTasks) * 100);
      progressFill.style.width = `${percentage}%`;
      
      if (progressPercentage) {
        progressPercentage.textContent = `${percentage}%`;
      }
    }
    
    // Update other progress indicators if needed
    const completedModulesText = document.querySelector('.progress-stats p:first-child');
    const hoursStudiedText = document.querySelector('.progress-stats p:last-child');
    
    if (completedModulesText) {
      completedModulesText.textContent = `Completed Tasks: ${totalCompleted}/${totalTasks}`;
    }
    
    if (hoursStudiedText) {
      // Approximate hours based on number of completed tasks (just an example)
      const hours = (totalCompleted * 0.5).toFixed(1);
      hoursStudiedText.textContent = `Hours Studied: ${hours}h`;
    }
  }
  
  // Initialize tasks
  loadTasks();
  
  // When clicking outside the modal, close it
  if (taskModal) {
    window.addEventListener("click", function(event) {
      if (event.target === taskModal) {
        closeModal();
      }
    });
  }
});

// Add this to your existing JavaScript or task-bar.js file

// Function to add delete buttons to all existing tasks
function addDeleteButtonsToTasks() {
  const todoItems = document.querySelectorAll('.todo-item');
  
  todoItems.forEach(item => {
    // Only add if delete button doesn't already exist
    if (!item.querySelector('.delete-task-btn')) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-task-btn';
      deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
      deleteBtn.setAttribute('title', 'Delete task');
      
      // Add click event to delete the task
      deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        deleteTask(item);
      });
      
      item.appendChild(deleteBtn);
    }
  });
}

// Function to delete a task
function deleteTask(taskItem) {
  if (taskItem && taskItem.parentElement) {
    // Add fade-out animation
    taskItem.style.opacity = "0";
    taskItem.style.transform = "translateX(20px)";
    taskItem.style.transition = "opacity 0.3s, transform 0.3s";
    
    setTimeout(() => {
      if (taskItem.parentElement) {
        taskItem.parentElement.removeChild(taskItem);
        
        // If you have a save function, call it here
        if (typeof saveTasks === 'function') {
          saveTasks();
        }
        
        // If you have a progress update function, call it here
        if (typeof updateProgress === 'function') {
          updateProgress();
        }
      }
    }, 300);
  }
}

// When adding a new task, make sure to add the delete button
function addNewTaskWithDeleteButton(text) {
  // This assumes you have a todoList element
  const todoList = document.querySelector('.todo-list');
  if (!todoList) return;
  
  // Create the task item
  const taskItem = document.createElement('div');
  taskItem.className = 'todo-item';
  
  // Add checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  
  // Add task text
  const taskText = document.createElement('span');
  taskText.textContent = text;
  
  // Add delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-task-btn';
  deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
  deleteBtn.setAttribute('title', 'Delete task');
  deleteBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    deleteTask(taskItem);
  });
  
  // Assemble the task item
  taskItem.appendChild(checkbox);
  taskItem.appendChild(taskText);
  taskItem.appendChild(deleteBtn);
  
  // Add to the list
  todoList.appendChild(taskItem);
  
  return taskItem;
}

// Initialize - run this when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Add delete buttons to existing tasks
  addDeleteButtonsToTasks();
  
  // Optional: If you have a task creation function, modify it to include the delete button
  // or replace it with addNewTaskWithDeleteButton
});
})();