// Tab System Fix - Complete solution with task progress integration
document.addEventListener('DOMContentLoaded', function() {
  console.log('Tab System Fix loaded');
  
  // Get all tab buttons
  const navButtons = document.querySelectorAll(".nav-button");
  
  // Store references to progress elements
  const progressFill = document.querySelector(".progress-fill");
  const progressPercentage = document.querySelector(".progress-percentage");
  const completedModules = document.querySelector(".progress-stats p:first-child");
  
  // Make sure updateProgress function is accessible globally
  // This preserves the original progress update functionality
  if (typeof window.updateProgress !== 'function') {
    window.updateProgress = function() {
      // Get course state from global object or create default
      const courseState = window.courseState || {
        tasks: {
          total: document.querySelectorAll('.todo-list .todo-item').length + 
                document.querySelectorAll('.completed-list .todo-item').length,
          completed: document.querySelectorAll('.completed-list .todo-item').length
        },
        modules: {
          total: 8,
          completed: 6
        }
      };
      
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
      
      console.log(`Updating progress: Modules ${moduleProgress.toFixed(1)}%, Tasks ${taskProgress.toFixed(1)}%, Overall ${overallProgress}%`);
      
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
    };
  }
  
  // Force initial CSS reset on all tabs
  navButtons.forEach(btn => {
    // Remove the active class from all buttons initially
    btn.classList.remove("active");
    
    // Reset any inline styles that might be affecting the tabs
    btn.style.color = "";
    btn.style.borderBottom = "";
  });
  
  // Identify all content sections for each tab
  // We'll use querySelectorAll since there are duplicate elements
  const tabContentsMap = {
    'overview': document.querySelectorAll(".content-section"),
    'notes': document.querySelectorAll("#notes-tab, .tab-content[id='notes-tab']"),
    'quizzes': document.querySelectorAll("#quizzes-tab, .tab-content[id='quizzes-tab']"),
    'flashcards': document.querySelectorAll("#flashcards-tab, .tab-content[id='flashcards-tab']")
  };
  
  // Get all overview-specific elements that should be hidden in other tabs
  function getOverviewElements() {
    const elements = [];
    
    // Main progress section
    const progressSection = document.querySelector(".progress-section");
    if (progressSection) {
      elements.push(progressSection);
    }
    
    // Progress grid and its cards
    const progressGridCards = document.querySelectorAll(".progress-grid > article");
    progressGridCards.forEach(card => {
      elements.push(card);
    });
    
    return elements;
  }
  
  const overviewElements = getOverviewElements();
  console.log(`Found ${overviewElements.length} overview-specific elements`);
  
  // Function to hide all tab contents
  function hideAllTabContents() {
    for (const tabName in tabContentsMap) {
      const tabElements = tabContentsMap[tabName];
      tabElements.forEach(el => {
        if (el) el.style.display = "none";
      });
    }
    
    // Also hide overview elements
    overviewElements.forEach(el => {
      if (el) el.style.display = "none";
    });
  }
  
  // Fix for the Notes tab duplication - choose which notes tab to show
  function selectNotesTabInstance() {
    // We'll prefer the one outside the course-header if it exists
    const notesElements = tabContentsMap['notes'];
    let selectedNotesTab = null;
    
    // Try to find the tab outside of course-header
    for (let i = 0; i < notesElements.length; i++) {
      const el = notesElements[i];
      if (!el.closest('.course-header')) {
        selectedNotesTab = el;
        break;
      }
    }
    
    // If not found, use the first one
    if (!selectedNotesTab && notesElements.length > 0) {
      selectedNotesTab = notesElements[0];
    }
    
    // Hide all notes tabs first
    notesElements.forEach(el => {
      if (el) el.style.display = "none";
    });
    
    // Show only the selected one
    if (selectedNotesTab) {
      selectedNotesTab.style.display = "block";
    }
  }
  
  // Function to style the active tab
  function styleActiveTab(activeButton) {
    // Reset all tabs first
    navButtons.forEach(btn => {
      btn.classList.remove("active");
      
      // Force override any blue styling
      btn.style.color = "var(--text-tertiary, rgb(107, 114, 128))";
      btn.style.borderBottom = "none";
    });
    
    // Then style the active tab
    activeButton.classList.add("active");
    activeButton.style.color = "var(--link-color, #5997ac)";
    activeButton.style.borderBottom = "2px solid var(--link-color, #5997ac)";
  }
  
  // Set up tab switching
  navButtons.forEach(button => {
    // Remove any existing events to avoid conflicts
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener("click", function() {
      // Style the active tab
      styleActiveTab(this);
      
      // Get the tab name
      const tabName = this.textContent.trim().toLowerCase();
      console.log('Switching to tab:', tabName);
      
      // Hide everything first - but preserve upload progress bars
      const uploadProgressBars = document.querySelectorAll(".upload-progress");
      const progressBarDisplayStates = [];
      
      // Save current display state of progress bars
      uploadProgressBars.forEach(bar => {
        progressBarDisplayStates.push(bar.style.display);
      });
      
      // Hide all tab content
      hideAllTabContents();
      
      // Restore progress bars to their previous state
      uploadProgressBars.forEach((bar, index) => {
        bar.style.display = progressBarDisplayStates[index];
      });
      
      // Show appropriate content based on tab
      if (tabName === 'overview') {
        // Show overview content and elements
        const overviewContent = tabContentsMap['overview'];
        overviewContent.forEach(el => {
          if (el) el.style.display = "block";
        });
        
        overviewElements.forEach(el => {
          if (el) el.style.display = "block";
        });
        
        // Update progress when returning to overview tab
        if (typeof window.updateProgress === 'function') {
          window.updateProgress();
        }
      } 
      else if (tabName === 'notes') {
        // Show only one instance of notes tab
        selectNotesTabInstance();
        
        // Make sure document containers are visible for upload progress
        const documentsCard = document.querySelector(".documents-card");
        if (documentsCard) {
          documentsCard.style.display = "block";
        }
        
        const documentsSection = document.querySelector(".documents-section");
        if (documentsSection) {
          documentsSection.style.display = "block";
        }
      }
      else {
        // Handle other tabs
        const tabContent = tabContentsMap[tabName];
        if (tabContent) {
          tabContent.forEach(el => {
            if (el) el.style.display = "block";
          });
        }
      }
      
      // Adjust the action buttons visibility
      const actionButtons = document.querySelector('.action-buttons');
      if (actionButtons) {
        actionButtons.style.display = (tabName === "overview") ? "flex" : "none";
      }
    });
  });
  
  // Observer to ensure upload progress bars remain visible
  // This helps when progress bars are dynamically added after tab switching
  const documentObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(function(node) {
          // Check if the added node is an upload progress bar
          if (node.classList && node.classList.contains('upload-progress')) {
            // Make sure it's visible
            node.style.display = "block";
          }
        });
      }
    });
  });
  
  // Observe document containers for changes
  const documentsContainers = document.querySelectorAll(".documents-card, .documents-section");
  documentsContainers.forEach(container => {
    if (container) {
      documentObserver.observe(container, { 
        childList: true,
        subtree: true 
      });
    }
  });
  
  // Set up task addition and completion monitoring
  // This ensures the progress gets updated whenever tasks are added or completed
  const todoObserver = new MutationObserver(function(mutations) {
    let shouldUpdateProgress = false;
    
    mutations.forEach(function(mutation) {
      // Look for changes to the todo list or completed list
      if (mutation.type === 'childList') {
        if (mutation.addedNodes.length || mutation.removedNodes.length) {
          shouldUpdateProgress = true;
        }
      }
      // Also detect attribute changes like checking a checkbox
      else if (mutation.type === 'attributes' && 
              mutation.target.tagName === 'INPUT' && 
              mutation.target.type === 'checkbox') {
        shouldUpdateProgress = true;
      }
    });
    
    if (shouldUpdateProgress && typeof window.updateProgress === 'function') {
      // Update the progress with a slight delay to ensure all DOM changes are complete
      setTimeout(function() {
        window.updateProgress();
      }, 50);
    }
  });
  
  // Monitor both todo list and completed list for changes
  const todoList = document.querySelector('.todo-list');
  const completedList = document.querySelector('.completed-list');
  
  if (todoList) {
    todoObserver.observe(todoList, { 
      childList: true, 
      attributes: true,
      attributeFilter: ['checked'],
      subtree: true 
    });
  }
  
  if (completedList) {
    todoObserver.observe(completedList, { 
      childList: true, 
      subtree: true 
    });
  }
  
  // If the add task button exists, monitor it for clicks
  const addTaskBtn = document.querySelector('.add-task-btn');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', function() {
      // Update progress after a short delay to allow for the new task to be added
      setTimeout(function() {
        if (typeof window.updateProgress === 'function') {
          window.updateProgress();
        }
      }, 300);
    });
  }
  
  // Monitor the modal add tasks button if it exists
  document.addEventListener('click', function(e) {
    if (e.target && e.target.matches('.add-tasks-btn')) {
      // Update progress after the tasks are added
      setTimeout(function() {
        if (typeof window.updateProgress === 'function') {
          window.updateProgress();
        }
      }, 500);
    }
  });
  
  // Initialize the active tab (the first one by default)
  const activeTab = navButtons[0];
  if (activeTab) {
    console.log('Setting initial active tab:', activeTab.textContent.trim());
    activeTab.click();
  }
  
  // Run an initial progress update
  if (typeof window.updateProgress === 'function') {
    window.updateProgress();
  }
});