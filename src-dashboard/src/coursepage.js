// Course Page with Supabase integration

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
      total: 8, 
      completed: 6 
    },
    documents: []
  };
  
  // Supabase client shortcuts for readability
  const supabaseAuth = window.supabaseClient.auth;
  const supabaseDocuments = window.supabaseClient.documents;
  const supabaseFlashcards = window.supabaseClient.flashcards;
  const supbaseTasks = window.supabaseClient.tasks;
  
  // Check user authentication status on page load
  async function checkAuth() {
    try {
      const { success, user } = await supabaseAuth.getCurrentUser();
      if (!success || !user) {
        console.log('User not authenticated, redirecting to login');
        window.location.href = 'login.html';
        return false;
      }
      console.log('User authenticated:', user.email);
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
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
    
    // Add click event listeners to tab buttons
    navButtons.forEach((button, index) => {
      button.addEventListener("click", function() {
        // Remove active class from all buttons
        navButtons.forEach(btn => btn.classList.remove("active"));
        
        // Add active class to clicked button
        this.classList.add("active");
        
        // Hide all tab contents
        for (const key in tabContents) {
          if (tabContents[key]) {
            tabContents[key].style.display = "none";
          }
        }
        
        // Show the corresponding tab content
        const tabName = this.textContent.trim().toLowerCase();
        if (tabContents[tabName]) {
          tabContents[tabName].style.display = "block";
        } else if (index === 0) {
          // First tab is overview
          tabContents.overview.style.display = "block";
        }
      });
    });
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
    
    // Add tasks button functionality
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
        
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'task-loading-indicator';
        loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving tasks...';
        modalBody.appendChild(loadingIndicator);
        
        // Process tasks one by one for better error handling
        const processQueue = async () => {
          for (let i = 0; i < tasks.length; i++) {
            const taskText = tasks[i];
            if (taskText) {
              console.log(`Adding task: "${taskText}"`);
              
              try {
                // Save to Supabase in the background
                const { success, task, error } = await supbaseTasks.saveTask(taskText);
                
                if (success) {
                  console.log(`Task "${taskText}" saved to Supabase with ID: ${task.id}`);
                  
                  // Create task element
                  const newTask = document.createElement('label');
                  newTask.className = 'todo-item new-task';
                  newTask.dataset.taskId = task.id;
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
                  
                  // Add to UI
                  todoList.appendChild(newTask);
                  
                  // Apply animation
                  setTimeout(() => {
                    newTask.style.opacity = "1";
                    newTask.style.transform = "translateY(0)";
                  }, 50);
                } else {
                  console.error(`Error saving task "${taskText}" to Supabase:`, error);
                  // Still add to UI as a fallback, but with an error indicator
                  const newTask = document.createElement('label');
                  newTask.className = 'todo-item new-task error-saving';
                  newTask.innerHTML = `
                    <input type="checkbox" class="todo-checkbox">
                    <span>${taskText}</span>
                    <i class="fas fa-exclamation-circle error-icon" title="Task not saved. Click to retry."></i>
                  `;
                  todoList.appendChild(newTask);
                  
                  // Apply animation
                  setTimeout(() => {
                    newTask.style.opacity = "1";
                    newTask.style.transform = "translateY(0)";
                  }, 50);
                }
              } catch (error) {
                console.error(`Error processing task "${taskText}":`, error);
              }
            }
          }
          
          // Update course state
          courseState.tasks.total += tasks.length;
          updateProgress();
          
          // Remove loading indicator
          if (loadingIndicator) {
            loadingIndicator.remove();
          }
          
          // Close the modal
          modalContainer.classList.remove('active');
          setTimeout(() => {
            modalContainer.remove();
          }, 300);
        };
        
        // Start processing tasks
        processQueue();
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

  // Delete a document from Supabase
  async function deleteDocument(docId) {
    try {
      const { success, error } = await supabaseDocuments.deleteDocument(docId);
      
      if (success) {
        console.log(`Document deleted successfully`);
        return true;
      } else {
        console.error("Error deleting document:", error);
        return false;
      }
    } catch (error) {
      console.error("Error processing document deletion:", error);
      return false;
    }
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
      const addSingleTask = async () => {
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
          
          // Save the task to Supabase and add it to the UI
          try {
            const { success, task, error } = await supbaseTasks.saveTask(taskText);
            
            if (success) {
              createNewTask(task.text, task.id);
              addTaskInput.value = '';
              addTaskInput.focus(); // Keep focus in the input for adding more tasks
            } else {
              console.error("Error saving task:", error);
              alert("Failed to save task. Please try again.");
            }
            
            // Remove the ripple after a delay
            setTimeout(() => {
              if (ripple) ripple.remove();
            }, 600);
          } catch (error) {
            console.error("Error processing task:", error);
            alert("An error occurred. Please try again.");
            
            // Remove the ripple
            if (ripple) ripple.remove();
          }
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
    
    // If no taskId is provided, save to Supabase first
    if (!taskId) {
      // Show temporary placeholder
      const tempTask = document.createElement('label');
      tempTask.className = 'todo-item new-task loading';
      tempTask.innerHTML = `
        <span><i class="fas fa-spinner fa-spin"></i> ${taskText}</span>
      `;
      todoList.appendChild(tempTask);
      
      // Save to Supabase
      supbaseTasks.saveTask(taskText)
        .then(result => {
          if (result.success) {
            // Replace placeholder with actual task
            todoList.removeChild(tempTask);
            createNewTask(taskText, result.task.id);
          } else {
            // Show error
            tempTask.classList.remove('loading');
            tempTask.classList.add('error-saving');
            tempTask.innerHTML = `
              <input type="checkbox" class="todo-checkbox">
              <span>${taskText}</span>
              <i class="fas fa-exclamation-circle error-icon" title="Task not saved. Click to retry."></i>
            `;
          }
        })
        .catch(error => {
          console.error("Error saving task:", error);
          // Show error
          tempTask.classList.remove('loading');
          tempTask.classList.add('error-saving');
          tempTask.innerHTML = `
            <input type="checkbox" class="todo-checkbox">
            <span>${taskText}</span>
            <i class="fas fa-exclamation-circle error-icon" title="Task not saved. Click to retry."></i>
          `;
        });
      
      return;
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
        
        // Update task status in Supabase
        supbaseTasks.updateTaskStatus(taskId, true)
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
    
    // Show updating indicator
    const indicator = document.createElement('span');
    indicator.className = 'status-indicator';
    indicator.innerHTML = '<i class="fas fa-sync fa-spin"></i>';
    clonedTask.appendChild(indicator);
    
    // Add to completed section
    completedList.appendChild(clonedTask);
    
    // Remove from active todo list
    todoItem.remove();
    
    // Update task status in Supabase
    supbaseTasks.updateTaskStatus(taskId, true)
      .then(result => {
        if (result.success) {
          // Remove indicator on success
          const indicator = clonedTask.querySelector('.status-indicator');
          if (indicator) indicator.remove();
        } else {
          // Show error indicator
          const indicator = clonedTask.querySelector('.status-indicator');
          if (indicator) {
            indicator.innerHTML = '<i class="fas fa-exclamation-circle" title="Failed to update status"></i>';
            indicator.classList.add('error');
          }
        }
      })
      .catch(error => {
        console.error("Error updating task status:", error);
        // Show error indicator
        const indicator = clonedTask.querySelector('.status-indicator');
        if (indicator) {
          indicator.innerHTML = '<i class="fas fa-exclamation-circle" title="Failed to update status"></i>';
          indicator.classList.add('error');
        }
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
    
    // Show updating indicator
    const indicator = document.createElement('span');
    indicator.className = 'status-indicator';
    indicator.innerHTML = '<i class="fas fa-sync fa-spin"></i>';
    clonedTask.appendChild(indicator);
    
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
    
    // Update task status in Supabase
    supbaseTasks.updateTaskStatus(taskId, false)
      .then(result => {
        if (result.success) {
          // Remove indicator on success
          const indicator = clonedTask.querySelector('.status-indicator');
          if (indicator) indicator.remove();
        } else {
          // Show error indicator
          const indicator = clonedTask.querySelector('.status-indicator');
          if (indicator) {
            indicator.innerHTML = '<i class="fas fa-exclamation-circle" title="Failed to update status"></i>';
            indicator.classList.add('error');
          }
        }
      })
      .catch(error => {
        console.error("Error updating task status:", error);
        // Show error indicator
        const indicator = clonedTask.querySelector('.status-indicator');
        if (indicator) {
          indicator.innerHTML = '<i class="fas fa-exclamation-circle" title="Failed to update status"></i>';
          indicator.classList.add('error');
        }
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
    
    // Insert before the todo card 
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

  // Initialize tasks from Supabase
  async function initializeTasks() {
    try {
      // Show loading indicator
      const todoList = document.querySelector(".todo-list");
      if (todoList) {
        todoList.innerHTML = '<div class="loading-tasks"><i class="fas fa-spinner fa-spin"></i> Loading tasks...</div>';
      }
      
      // Get tasks from Supabase
      const { success, tasks, error } = await supbaseTasks.getTasks();
      
      if (!success) {
        console.error("Error loading tasks:", error);
        if (todoList) {
          todoList.innerHTML = '<div class="error-loading">Failed to load tasks. <button class="retry-btn">Retry</button></div>';
          const retryBtn = todoList.querySelector('.retry-btn');
          if (retryBtn) {
            retryBtn.addEventListener('click', initializeTasks);
          }
        }
        return;
      }
      
      console.log(`Loaded ${tasks.length} tasks from Supabase`);
      
      // Clear loading indicator
      if (todoList) {
        todoList.innerHTML = '';
      }
      
      // Process tasks...
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
            // Create completed task UI
            const newTask = document.createElement('label');
            newTask.className = 'todo-item';
            newTask.dataset.taskId = task.id;
            newTask.innerHTML = `
              <input type="checkbox" class="todo-checkbox" checked>
              <span style="text-decoration: line-through; opacity: 0.7;">${task.text}</span>
            `;
            
            // Add event listener to checkbox
            const checkbox = newTask.querySelector('input[type="checkbox"]');
            checkbox.addEventListener("change", function() {
              if (!this.checked) {
                const completedItem = this.closest('.todo-item');
                moveTaskToTodo(completedItem);
              }
            });
            
            completedList.appendChild(newTask);
          });
          
          // Update state
          courseState.tasks.completed = completedTasks.length;
        }
      }
      
      // Update total task count
      courseState.tasks.total = tasks.length;
      updateProgress();
    } catch (error) {
      console.error("Error initializing tasks:", error);
      
      // Show error UI
      const todoList = document.querySelector(".todo-list");
      if (todoList) {
        todoList.innerHTML = '<div class="error-loading">Failed to load tasks. <button class="retry-btn">Retry</button></div>';
        const retryBtn = todoList.querySelector('.retry-btn');
        if (retryBtn) {
          retryBtn.addEventListener('click', initializeTasks);
        }
      }
    }
  }


  // Enhanced document upload function
  async function uploadDocument(file) {
    try {
      // Use the debug upload method instead of the regular upload method
      const result = await window.supabaseClient.documents.debugUpload(file);
      
      if (result.success) {
        // Log whether the document was created by trigger or manually
        console.log('Document uploaded successfully:', result.document);
        console.log('Created by trigger:', result.document.fromTrigger ? 'Yes' : 'No');
        
        // Add to UI
        await addDocumentToUI(result.document, "both");
        
        return result.document;
      } else {
        console.error('Upload failed:', result.error);
        // Show error to user
        alert(`Upload failed: ${result.error}`);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Upload process error:', error);
      alert('Failed to upload document. Please try again.');
      throw error;
    }
  }

// Download a document from Supabase
async function downloadDocument(docId) {
  try {
    // Show downloading status
    const statusElement = document.createElement('div');
    statusElement.className = 'download-status';
    statusElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Preparing download...`;
    document.body.appendChild(statusElement);
    
    // Get document details from Supabase
    const { success: docSuccess, documents, error: docError } = await supabaseDocuments.getUserDocuments();
    
    if (!docSuccess || !documents) {
      throw new Error(docError || "Failed to get document details");
    }
    
    // Find document by ID
    const doc = documents.find(d => d.id === docId);
    if (!doc) {
      throw new Error("Document not found");
    }
    
    // Get signed URL for download
    const { success, url, error } = await supabaseDocuments.getDocumentUrl(doc.file_path);
    
    if (!success || !url) {
      throw new Error(error || "Failed to get download URL");
    }
    
    // Update status
    statusElement.innerHTML = `<i class="fas fa-download"></i> Starting download...`;
    
    // Trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      
      // Update status
      statusElement.innerHTML = `<i class="fas fa-check"></i> Download complete`;
      setTimeout(() => {
        statusElement.remove();
      }, 3000);
    }, 100);
    
    return doc;
  } catch (error) {
    console.error("Error downloading document:", error);
    
    // Show error status
    const statusElement = document.querySelector('.download-status');
    if (statusElement) {
      statusElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> Download failed`;
      statusElement.classList.add('error');
      setTimeout(() => {
        statusElement.remove();
      }, 5000);
    }
    
    throw error;
  }
}

// Render documents from Supabase to UI
async function renderDocuments() {
  try {
    // Show loading indicator in document sections
    const sections = [
      document.querySelector("#notes-tab .documents-grid"),
      document.querySelector("#notes-tab .document-list"),
      document.querySelector(".content-section .document-list")
    ];
    
    sections.forEach(section => {
      if (section) {
        section.innerHTML = '<div class="loading-documents"><i class="fas fa-spinner fa-spin"></i> Loading documents...</div>';
      }
    });
    
    // Load documents from Supabase
    const documents = await loadDocuments();
    
    if (documents.length === 0) {
      console.log("No documents found in Supabase");
      sections.forEach(section => {
        if (section) {
          section.innerHTML = '<div class="no-documents-message"><i class="fas fa-folder-open"></i><p>No documents available</p></div>';
        }
      });
      return;
    }
    
    console.log(`Found ${documents.length} documents in Supabase`);
    
    // Clear loading indicators
    sections.forEach(section => {
      if (section) {
        section.innerHTML = '';
      }
    });
    
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
        setupDocumentHandlers(notesClone);
        notesDocList.appendChild(notesClone);
        notesCount++;
      }
      
      // Add to overview list (max 2)
      if (overviewDocList && overviewCount < 2) {
        const overviewClone = docItem.cloneNode(true);
        setupDocumentHandlers(overviewClone);
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
  } catch (error) {
    console.error("Error rendering documents:", error);
    
    // Show error message in document sections
    const sections = [
      document.querySelector("#notes-tab .documents-grid"),
      document.querySelector("#notes-tab .document-list"),
      document.querySelector(".content-section .document-list")
    ];
    
    sections.forEach(section => {
      if (section) {
        section.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i><p>Failed to load documents</p><button class="retry-btn">Retry</button></div>';
        
        // Add retry button functionality
        const retryBtn = section.querySelector('.retry-btn');
        if (retryBtn) {
          retryBtn.addEventListener('click', renderDocuments);
        }
      }
    });
  }
}

// Add document to UI after upload
async function addDocumentToUI(document, targetSection) {
  // Create the document item
  const docId = document.id;
  const filename = document.filename;
  const timeString = getTimeSince(document.created_at);
  
  // Track the document in memory
  courseState.documents.push({
    id: docId,
    name: filename,
    date: new Date(document.created_at),
    type: document.mime_type,
    size: document.file_size
  });
  
  // Create HTML element
  const documentItem = document.createElement("div");
  documentItem.className = "document-item";
  documentItem.dataset.docId = docId;
  const iconClass = getIconClass(filename);
  
  documentItem.innerHTML = `
    <div class="document-item-left">
      <div class="document-icon ${iconClass}">
        ${getFileIcon(filename)}
      </div>
      <div class="document-info">
        <h3 class="document-title">${filename}</h3>
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
      setupDocumentHandlers(notesClone);
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
          ${getFileIcon(filename)}
        </div>
        <div class="document-info">
          <h3 class="document-title">${filename}</h3>
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
      setupDocumentHandlers(overviewClone);
      
      // Make sure there are at most 2 documents visible in overview
      if (overviewList.children.length >= 2) {
        overviewList.removeChild(overviewList.lastChild);
      }
      overviewList.prepend(overviewClone);
    }
  }
}

// Helper function to set up download and delete handlers for document items
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

// Helper function to create document elements
function createDocumentElement(doc, type, includeDelete = false) {
  const iconClass = getIconClass(doc.filename || doc.name);
  const timeSince = getTimeSince(doc.created_at || doc.timestamp);
  
  // Add delete button if requested
  const deleteButton = includeDelete ? 
    `<div class="document-delete" title="Delete Document">
       <i class="fas fa-trash-alt"></i>
     </div>` : '';
  
  if (type === 'grid') {
    // For the documents grid (card style)
    const element = document.createElement("div");
    element.className = "document-card";
    element.dataset.docId = doc.id;
    
    element.innerHTML = `
      <div class="document-icon ${iconClass}">
        ${getFileIcon(doc.filename || doc.name)}
      </div>
      <div class="document-info">
        <h3 class="document-title">${doc.filename || doc.name}</h3>
        <p class="document-date">Added ${timeSince}</p>
      </div>
    `;
    
    return element;
  } else {
    // For document lists
    const element = document.createElement("div");
    element.className = "document-item";
    element.dataset.docId = doc.id;

    element.innerHTML = `
      <div class="document-item-left">
        <div class="document-icon ${iconClass}">
          ${getFileIcon(doc.filename || doc.name)}
        </div>
        <div class="document-info">
          <h3 class="document-title">${doc.filename || doc.name}</h3>
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

// Show upload progress with improved UI
function showUploadProgress(fileName) {
  // Create progress element if it doesn't exist
  let progressBar = document.querySelector('.upload-progress');
  if (progressBar) {
    progressBar.remove();
  }
  
  progressBar = document.createElement("div");
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
  
  // Add to document
  document.body.appendChild(progressBar);
  
  // Animate progress (simulated since actual progress is handled by Supabase)
  let progress = 0;
  const progressFill = progressBar.querySelector('.progress-fill');
  const percentElement = progressBar.querySelector('.progress-percentage');
  
  // Start animation that will run until completion or failure
  const interval = setInterval(() => {
    if (progress < 90) {
      // Only go up to 90% - the last 10% is reserved for server processing
      progress += Math.random() * 5;
      progress = Math.min(progress, 90);
      
      progressFill.style.width = `${progress}%`;
      percentElement.textContent = `${Math.round(progress)}%`;
    } else {
      clearInterval(interval);
    }
  }, 150);
  
  // Store the interval ID so we can clear it later
  progressBar.dataset.intervalId = interval;
}

// Complete the upload progress animation
function completeUploadProgress() {
  const progressBar = document.querySelector('.upload-progress');
  if (!progressBar) return;
  
  // Clear the animation interval
  clearInterval(progressBar.dataset.intervalId);
  
  // Set to 100%
  const progressFill = progressBar.querySelector('.progress-fill');
  const percentElement = progressBar.querySelector('.progress-percentage');
  
  progressFill.style.width = '100%';
  percentElement.textContent = '100%';
  
  // Show success message
  const progressInfo = progressBar.querySelector('.progress-info');
  progressInfo.innerHTML = '<span><i class="fas fa-check-circle"></i> Upload complete</span>';
  progressBar.classList.add('success');
  
  // Remove after delay
  setTimeout(() => {
    progressBar.style.opacity = '0';
    setTimeout(() => {
      progressBar.remove();
    }, 300);
  }, 1500);
}

// Show upload failure
function failUploadProgress(fileName) {
  const progressBar = document.querySelector('.upload-progress');
  if (!progressBar) return;
  
  // Clear the animation interval
  clearInterval(progressBar.dataset.intervalId);
  
  // Show error message
  const progressInfo = progressBar.querySelector('.progress-info');
  progressInfo.innerHTML = `<span><i class="fas fa-exclamation-circle"></i> Failed to upload ${fileName}</span>`;
  progressBar.classList.add('error');
  
  // Remove after delay
  setTimeout(() => {
    progressBar.style.opacity = '0';
    setTimeout(() => {
      progressBar.remove();
    }, 300);
  }, 3000);
}

// Helper function to convert timestamp to "X time ago" format
function getTimeSince(timestamp) {
  if (!timestamp) return "just now";
  
  const now = Date.now();
  const date = new Date(timestamp);
  const diff = now - date.getTime();
  
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
  
  // Format date
  return date.toLocaleDateString();
}

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

// Setup drag and drop with Supabase upload
function setupDragAndDrop() {
  const uploadArea = document.querySelector(".upload-area");
  if (!uploadArea) return;
  
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
  
  uploadArea.addEventListener("drop", async function(e) {
    e.preventDefault();
    this.style.borderColor = "#e0e0e0";
    this.style.backgroundColor = "transparent";
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      try {
        // Show upload progress
        showUploadProgress(files[0].name);
        
        // Upload file to Supabase
        await uploadDocument(files[0]);
        
        // Complete the progress animation
        completeUploadProgress();
      } catch (error) {
        console.error("Upload failed:", error);
        // Handle upload failure in the progress UI
        failUploadProgress(files[0].name);
      }
    }
  });
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

    input.addEventListener("change", async function (e) {
      const file = e.target.files[0];
      if (file) {
        try {
          // Show upload progress
          showUploadProgress(file.name);
          
          // Upload file to Supabase
          await uploadDocument(file);
          
          // Complete the progress animation
          completeUploadProgress();
        } catch (error) {
          console.error("Upload failed:", error);
          // Handle upload failure in the progress UI
          failUploadProgress(file.name);
        }
      }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
}





  // document handling
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Check authentication first
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      // Redirect handled in checkAuth function
      return;
    }
    
    console.log("User authenticated, initializing application");
    
    // Initialize tabs functionality
    initializeTabs();
    
    // Initialize tasks from Supabase
    await initializeTasks();
    
    // Load and render documents from Supabase
    await renderDocuments();
    
    // Update progress
    updateProgress();
    
    // Add completed tasks section if it doesn't exist
    createCompletedTasksSection();
    
    // Initialize the add task feature
    initializeAddTaskFeature();
    
    // Setup upload buttons
    setupUploadButton(uploadBtn, "both"); 
    setupUploadButton(browseBtn, "notes");
    
    // Setup drag and drop
    setupDragAndDrop();
    
    console.log("Application initialization complete");
  } catch (error) {
    console.error("Error initializing application:", error);
    // Show error message to user
    const errorMsg = document.createElement('div');
    errorMsg.className = 'app-error-message';
    errorMsg.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      <p>There was a problem loading the application. Please refresh the page or try again later.</p>
      <button class="retry-btn">Retry</button>
    `;
    document.body.appendChild(errorMsg);
    
    // Add retry button functionality
    const retryBtn = errorMsg.querySelector('.retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        errorMsg.remove();
        location.reload();
      });
    }
  }
}
  );
});
    