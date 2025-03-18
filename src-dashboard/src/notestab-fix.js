// Notes Tab Fix
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const contentSection = document.querySelector('.content-section');
    const progressSection = document.querySelector('.progress-section');
    
    // Function to handle tab switching
    function switchTab(tabName) {
      // Hide all tab contents first
      tabContents.forEach(tab => {
        tab.style.display = 'none';
      });
      
      // Handle overview special case
      if (tabName === 'overview') {
        // Show the main content sections for overview
        if (contentSection) contentSection.style.display = 'block';
        if (progressSection) progressSection.style.display = 'block';
      } else {
        // Hide main content sections for other tabs
        if (contentSection) contentSection.style.display = 'none';
        if (progressSection) progressSection.style.display = 'none';
        
        // Show the selected tab
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
          selectedTab.style.display = 'block';
        }
      }
      
      // Toggle visibility of upload button
      const actionButtons = document.querySelector('.action-buttons');
      if (actionButtons) {
        actionButtons.style.display = (tabName === 'overview') ? 'flex' : 'none';
      }
    }
    
    // Set up click handlers for all nav buttons
    navButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Update active button
        navButtons.forEach(btn => {
          btn.classList.remove('active');
        });
        this.classList.add('active');
        
        // Get the tab name and switch to it
        const tabName = this.textContent.trim().toLowerCase();
        switchTab(tabName);
      });
    });
    
    // Initialize with the currently active tab
    const activeButton = document.querySelector('.nav-button.active');
    if (activeButton) {
      const initialTabName = activeButton.textContent.trim().toLowerCase();
      switchTab(initialTabName);
    }
  });