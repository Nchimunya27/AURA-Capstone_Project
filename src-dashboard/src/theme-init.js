/**
 * theme-init.js - Add this as a separate file or at the beginning of all your JS files
 * This is a script that has to be included in order for the appearance to take effect.
 */
// Apply theme immediately on page load 
// THIS MUST RUN BEFORE THE DOM IS FULLY LOADED to prevent flickering
(function() {
    const savedTheme = localStorage.getItem('theme') || 'day';
    document.documentElement.setAttribute('data-theme', savedTheme);
  })();