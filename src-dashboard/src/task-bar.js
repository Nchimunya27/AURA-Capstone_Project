
document.addEventListener('DOMContentLoaded', function() {
  console.log('Task Progress Updater initialized');
  
  // Get progress elements
  const progressFill = document.querySelector(".progress-fill");
  const progressPercentage = document.querySelector(".progress-percentage");
  const completedModules = document.querySelector(".progress-stats p:first-child");
  
  // Initialize progress to 0% on page load
  if (progressFill) progressFill.style.width = '0%';
  if (progressPercentage) progressPercentage.textContent = '0%';
  
  // Course state management
  window.courseState = window.courseState || {
    tasks: {
      total: 0,
      completed: 0
    },
    modules: {
      total: 8,
      completed: 0
    }
  };

  // Setup add task button functionality
  setupAddTaskButton();
  
  // Enhanced updateProgress function
  function updateProgress() {
    // Count tasks directly from DOM to ensure accuracy
    const totalTasks = document.querySelectorAll('.todo-list .todo-item').length + 
                       document.querySelectorAll('.completed-list .todo-item').length;
    const completedTasks = document.querySelectorAll('.completed-list .todo-item').length;
    
    // Update course state
    window.courseState.tasks.total = totalTasks || 0;
    window.courseState.tasks.completed = completedTasks || 0;
    
    // Calculate progress
    const moduleWeight = 0.7; // Modules are 70% of progress
    const taskWeight = 0.3;   // Tasks are 30% of progress
    
    const moduleProgress = (window.courseState.modules.completed / window.courseState.modules.total) * 100;
    
    // Avoid division by zero
    let taskProgress = 0;
    if (window.courseState.tasks.total > 0) {
      taskProgress = (window.courseState.tasks.completed / window.courseState.tasks.total) * 100;
    }
    
    // Combine for overall progress
    const overallProgress = Math.round((moduleProgress * moduleWeight) + (taskProgress * taskWeight));
    
    console.log(`Progress updated: Modules ${moduleProgress.toFixed(1)}%, Tasks ${taskProgress.toFixed(1)}%, Overall ${overallProgress}%`);
    
    // Apply smooth animation to progress elements
    if (progressFill) {
      progressFill.style.transition = "width 0.8s ease-in-out";
      progressFill.style.width = `${overallProgress}%`;
    }
    
    if (progressPercentage) {
      progressPercentage.textContent = `${overallProgress}%`;
    }
    
    if (completedModules) {
      completedModules.textContent = `Completed Modules: ${window.courseState.modules.completed}/${window.courseState.modules.total}`;
    }
    
    // If all tasks are completed, show celebration (if it exists)
    if (totalTasks > 0 && completedTasks === totalTasks) {
      if (typeof window.showCelebration === 'function') {
        setTimeout(() => window.showCelebration(), 500);
      }
    }
  }
  
  // Function to add a new task
  function addNewTask(taskInput) {
    if (!taskInput || !taskInput.value.trim()) return;
    
    // Get todo list
    const todoList = document.querySelector('.todo-list');
    if (!todoList) return;
    
    // Clear empty message if it exists
    const emptyMessage = todoList.querySelector('.empty-tasks-message');
    if (emptyMessage) emptyMessage.remove();
    
    // Create task element
    const taskItem = document.createElement('div');
    taskItem.className = 'todo-item';
    
    taskItem.innerHTML = `
      <label class="checkbox-container">
        <input type="checkbox" class="task-checkbox">
        <span class="checkmark"></span>
      </label>
      <span class="task-text">${taskInput.value.trim()}</span>
    `;
    
    // Add to list
    todoList.appendChild(taskItem);
    
    // Clear input
    taskInput.value = '';
    
    // Set up checkbox event
    const checkbox = taskItem.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        const todoItem = this.closest('.todo-item');
        const todoText = todoItem.querySelector('.task-text');
        
        if (todoText) {
          todoText.style.textDecoration = "line-through";
          todoText.style.opacity = "0.7";
        }
        
        setTimeout(() => {
          if (window.moveTaskToCompleted) {
            window.moveTaskToCompleted(todoItem);
          }
        }, 500);
      }
    });
    
    // Update progress
    setTimeout(updateProgress, 100);
  }
  
  // Setup add task button functionality
  function setupAddTaskButton() {
    const addTaskBtn = document.querySelector('.add-task-btn');
    const taskInput = document.querySelector('.add-task-input');
    
    if (addTaskBtn && taskInput) {
      // Add task on button click
      addTaskBtn.addEventListener('click', function() {
        addNewTask(taskInput);
      });
      
      // Add task on Enter key
      taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          addNewTask(taskInput);
        }
      });
    }
  }
  
  // Override the existing updateProgress function
  window.updateProgress = updateProgress;
  
  // Set up checkbox event listeners for all existing tasks
  function setupTaskCheckboxes() {
    const checkboxes = document.querySelectorAll('.todo-item input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
      // Remove any existing listeners by cloning and replacing
      const newCheckbox = checkbox.cloneNode(true);
      checkbox.parentNode.replaceChild(newCheckbox, checkbox);
      
      // Add fresh event listener
      newCheckbox.addEventListener('change', function() {
        const todoItem = this.closest('.todo-item');
        const todoText = todoItem.querySelector('.task-text');
        
        if (this.checked) {
          // Visual update
          if (todoText) {
            todoText.style.textDecoration = "line-through";
            todoText.style.opacity = "0.7";
          }
          
          // Move to completed (if moveTaskToCompleted function exists)
          if (typeof window.moveTaskToCompleted === 'function') {
            setTimeout(() => window.moveTaskToCompleted(todoItem), 500);
          }
        } else {
          if (todoText) {
            todoText.style.textDecoration = "none";
            todoText.style.opacity = "1";
          }
        }
        
        // Always update progress
        setTimeout(updateProgress, 100);
      });
    });
  }
  
  // Monitor for new tasks being added
  const todoObserver = new MutationObserver(function(mutations) {
    let taskAdded = false;
    let checkboxChanged = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        taskAdded = true;
        
        // Set up listeners for new checkboxes
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const checkboxes = node.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
              checkbox.addEventListener('change', function() {
                setTimeout(updateProgress, 100);
              });
            });
          }
        });
      }
      
      if (mutation.type === 'attributes' && 
          mutation.attributeName === 'checked' && 
          mutation.target.type === 'checkbox') {
        checkboxChanged = true;
      }
    });
    
    if (taskAdded || checkboxChanged) {
      setTimeout(updateProgress, 200);
    }
  });
  
  // Observe both todo list and completed list
  const todoLists = document.querySelectorAll('.todo-list, .completed-list');
  todoLists.forEach(list => {
    if (list) {
      todoObserver.observe(list, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['checked']
      });
    }
  });
  
  // Handle task addition button clicks
  document.addEventListener('click', function(e) {
    // Single task add button
    if (e.target.matches('.add-task-btn') || e.target.closest('.add-task-btn')) {
      setTimeout(updateProgress, 400);
    }
    
    // Multiple tasks add button
    if (e.target.matches('.add-tasks-btn') || e.target.closest('.add-tasks-btn')) {
      setTimeout(updateProgress, 600);
    }
  });
  
  // Handle task input events - for when Enter key is used
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && 
        (document.activeElement.matches('.add-task-input') || 
         document.activeElement.matches('.task-textarea'))) {
      setTimeout(updateProgress, 400);
    }
  });
  
  // Initial setup
  setupTaskCheckboxes();
  
  // Force an initial progress update
  setTimeout(updateProgress, 100);
  
  // Share task completion functionality globally
  window.moveTaskToCompleted = function(todoItem) {
    if (!todoItem) return;
    
    // Ensure the completed section exists
    const todoCard = document.querySelector(".todo-card");
    if (!todoCard) return;
    
    // Create completed tasks section if it doesn't exist
    if (!document.querySelector(".completed-tasks")) {
      const completedSection = document.createElement("div");
      completedSection.className = "completed-tasks";
      completedSection.innerHTML = `
        <h4>Completed</h4>
        <div class="completed-list"></div>
      `;
      
      todoCard.appendChild(completedSection);
    }
    
    const completedList = document.querySelector(".completed-list");
    if (!completedList) return;
    
    // Clone the task and ensure it's checked
    const clonedTask = todoItem.cloneNode(true);
    const checkbox = clonedTask.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.checked = true;
      
      // Add event listener for moving back to todo
      checkbox.addEventListener("change", function() {
        if (!this.checked) {
          const task = this.closest('.todo-item');
          if (typeof window.moveTaskToTodo === 'function') {
            window.moveTaskToTodo(task);
          } else {
            // Fallback if moveTaskToTodo is not available
            task.remove();
            updateProgress();
          }
        }
      });
    }
    
    // Add to completed list
    completedList.appendChild(clonedTask);
    
    // Remove from todo list
    todoItem.remove();
    
    // Update progress
    updateProgress();
  };
  
  // Function to move task back to todo list
  window.moveTaskToTodo = function(completedItem) {
    if (!completedItem) return;
    
    const todoList = document.querySelector(".todo-list");
    if (!todoList) return;
    
    // Clone the task and uncheck it
    const clonedTask = completedItem.cloneNode(true);
    const checkbox = clonedTask.querySelector('input[type="checkbox"]');
    const todoText = clonedTask.querySelector('.task-text');
    
    if (checkbox) {
      checkbox.checked = false;
      
      if (todoText) {
        todoText.style.textDecoration = "none";
        todoText.style.opacity = "1";
      }
      
      checkbox.addEventListener("change", function() {
        if (this.checked) {
          const task = this.closest('.todo-item');
          if (typeof window.moveTaskToCompleted === 'function') {
            setTimeout(() => window.moveTaskToCompleted(task), 500);
          }
        }
      });
    }
    
    // Add to todo list
    todoList.appendChild(clonedTask);
    
    // Remove from completed list
    completedItem.remove();
    
    // Update progress
    updateProgress();
  };
  
  // Basic celebration functionality
  window.showCelebration = window.showCelebration || function() {
    // Prevent multiple celebrations
    if (document.querySelector('.motivation-message')) return;
    
    const todoCard = document.querySelector(".todo-card");
    if (!todoCard) return;
    
    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.className = 'motivation-message';
    
    const messages = [
      "Great job! You've completed all your tasks!",
      "All tasks complete! Keep up the fantastic work!",
      "Success! You've finished everything on your list!"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    messageContainer.innerHTML = `
      <div class="motivation-content">
        <i class="fas fa-trophy"></i>
        <span>${randomMessage}</span>
        <button class="close-motivation-btn"><i class="fas fa-times"></i></button>
      </div>
    `;
    
    // Insert before todo card
    todoCard.parentNode.insertBefore(messageContainer, todoCard);
    
    // Close button functionality
    const closeBtn = messageContainer.querySelector('.close-motivation-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        messageContainer.classList.add('fadeout');
        setTimeout(() => messageContainer.remove(), 500);
      });
    }
    
    // Add simple confetti effect
    for (let i = 0; i < 50; i++) {
      createConfetti();
    }
  };
  
  // Helper function to create confetti elements
  function createConfetti() {
    // Create confetti container if it doesn't exist
    let container = document.querySelector('.confetti-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'confetti-container';
      document.body.appendChild(container);
    }
    
    // Create a confetti particle
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4CAF50', '#FFEB3B', '#FF9800'];
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    container.appendChild(confetti);
    
    // Remove after animation completes
    setTimeout(() => confetti.remove(), 5000);
  }
});