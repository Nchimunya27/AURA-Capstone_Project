// Common UI components and utilities

// Show a toast notification
function showToast(message, isError = false) {
  // Remove existing toast if any
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? "toast-error" : "toast-success"}`;
  toast.innerHTML = message;

  // Add to document
  document.body.appendChild(toast);

  // Show and then hide after 3 seconds
  setTimeout(() => {
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }, 100);
}

// Show loading indicator
function showLoading(message = "Loading...") {
  // Remove existing loader if any
  hideLoading();

  // Create loader element
  const loader = document.createElement("div");
  loader.className = "loader-overlay";
  loader.innerHTML = `
      <div class="loader-container">
        <div class="loader-spinner"></div>
        <div class="loader-message">${message}</div>
      </div>
    `;

  // Add to document
  document.body.appendChild(loader);
}

// Hide loading indicator
function hideLoading() {
  const loader = document.querySelector(".loader-overlay");
  if (loader) {
    loader.remove();
  }
}

// Navigate to another page in the app
function navigateTo(page) {
  window.location.href = `/aura-login/quiz/${page}/index.html`;
}

// Initialize sidebar navigation with active state
function initSidebar(activePage) {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  // Set active nav item
  const activeLink = sidebar.querySelector(
    `.nav-item[data-page="${activePage}"]`
  );
  if (activeLink) {
    activeLink.classList.add("active");
  }

  // Add event listeners for navigation
  const navLinks = sidebar.querySelectorAll(".nav-item");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      navigateTo(page);
    });
  });

  // Add logout handler
  const logoutBtn = sidebar.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
}
