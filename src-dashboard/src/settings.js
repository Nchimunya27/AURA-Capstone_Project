/**
 * Settings Page Functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const sections = document.querySelectorAll('.settings-section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active section
            sections.forEach(section => {
                if (section.id === tabId) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
            
            // Initialize analytics if analytics tab is selected
            if (tabId === 'overall-analytics' && typeof initializeAnalytics === 'function') {
                // Add a slight delay to ensure the tab content is visible
                setTimeout(initializeAnalytics, 100);
            }
        });
    });
// === THEME MANAGEMENT ===
const themeModeRadios = document.querySelectorAll('input[name="themeMode"]');
    
// Apply current theme (should also match the checked radio button)
const currentTheme = localStorage.getItem('theme') || 'day';
document.documentElement.setAttribute('data-theme', currentTheme);
console.log('Initial theme set to: ' + currentTheme);

// Set the correct radio button based on current theme
const radioToCheck = document.getElementById(currentTheme + 'Mode');
if (radioToCheck) {
  radioToCheck.checked = true;
  console.log('Set checked radio to: ' + currentTheme + 'Mode');
} else {
  console.log('Could not find radio for theme: ' + currentTheme);
}

// Add change listeners to radio buttons
themeModeRadios.forEach(radio => {
  radio.addEventListener('change', function() {
    // Get selected theme (day or night)
    const theme = this.value;
    console.log('Theme changed to: ' + theme);
    
    // Apply theme by setting attribute on <html> element
    document.documentElement.setAttribute('data-theme', theme);
    
    // Save preference for future visits
    localStorage.setItem('theme', theme);
    
    // Update charts if we're on the analytics tab
    if (document.getElementById('overall-analytics') && 
        document.getElementById('overall-analytics').classList.contains('active') &&
        typeof Chart !== 'undefined') {
        updateChartsForTheme(theme);
    }
  });
});

    
    // Form submission handling
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', function() {
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            
            console.log('Saving user data:', { firstName, lastName, email });
            alert('Changes saved successfully!');
        });
    }
    
    // Password change handling
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            const currentPassword = prompt('Enter your current password:');
            if (!currentPassword) return;
            
            const newPassword = prompt('Enter your new password:');
            if (!newPassword) return;
            
            const confirmPassword = prompt('Confirm your new password:');
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match. Please try again.');
                return;
            }
            
            console.log('Password change requested');
            alert('Password changed successfully!');
        });
    }
});

/**
 * Function to update chart colors when theme changes
 */
function updateChartsForTheme(theme) {
    if (typeof Chart === 'undefined') return;
    
    // Find all charts on the page
    const charts = Object.values(Chart.instances);
    if (charts.length === 0) return;

    charts.forEach(chart => {
        // Update the chart with new theme colors
        chart.update();
    });
    
    // Update heatmap colors if it exists
    const heatmapContainer = document.getElementById('activityHeatmap');
    if (heatmapContainer) {
        const hourBlocks = heatmapContainer.querySelectorAll('.hour-block');
        hourBlocks.forEach(block => {
            const style = block.getAttribute('style');
            if (style) {
                const newStyle = theme === 'night'
                    ? style.replace('rgba(89, 151, 172,', 'rgba(123, 181, 245,')
                    : style.replace('rgba(123, 181, 245,', 'rgba(89, 151, 172,');
                block.setAttribute('style', newStyle);
            }
        });
    }
}