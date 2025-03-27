document.addEventListener("DOMContentLoaded", function () {
  // Sidebar Navigation
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      navItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Logout functionality
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', function() {
      localStorage.removeItem('currentUsername');
      localStorage.removeItem('isLoggedIn');
      window.location.href = 'login.html';
    });
  }

  // Check login status
  function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      window.location.href = 'login.html';
    }
  }
  checkLoginStatus();

  // Get all option items
  const optionItems = document.querySelectorAll(".option-item");

  // Add click event to each option
  optionItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Find the radio input inside this option and check it
      const radio = this.querySelector('input[type="radio"]');
      radio.checked = true;
    });
  });

  // Navigation buttons
  const prevButton = document.querySelector(".prev-button");
  const nextButton = document.querySelector(".next-button");

  prevButton.addEventListener("click", function () {
    // Navigate to previous question
    console.log("Navigate to previous question");
    // In a real app, you would load the previous question here
  });

  nextButton.addEventListener("click", function () {
    // Navigate to next question
    console.log("Navigate to next question");
    // In a real app, you would load the next question here
  });

  // Flag button
  const flagButton = document.querySelector(".flag-button");
  flagButton.addEventListener("click", function () {
    this.classList.toggle("flagged");
    console.log("Question flagged for review");
  });

  // Submit button
  const submitButton = document.querySelector(".submit-button");
  submitButton.addEventListener("click", function () {
    console.log("Quiz submitted");
    // In a real app, you would submit all answers here
    alert("Quiz submitted successfully!");
  });
});
