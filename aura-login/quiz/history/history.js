document.addEventListener("DOMContentLoaded", async function () {
  // Initialize UI
  initSidebar("history");

  // Check authentication
  const user = await checkAuth();
  if (!user) return;

  // Display username
  document.getElementById("current-user").textContent =
    user.user_metadata.username || user.email;

  // DOM elements
  const quizzesContainer = document.getElementById("quizzes-container");
  const emptyState = document.getElementById("empty-state");
  const createQuizBtn = document.getElementById("create-quiz-btn");
  const emptyCreateBtn = document.getElementById("empty-create-btn");
  const searchInput = document.getElementById("search-input");
  const statusFilter = document.getElementById("status-filter");

  // Data variables
  let allQuizzes = [];

  // Navigation to create quiz
  createQuizBtn.addEventListener("click", () => navigateTo("upload"));
  emptyCreateBtn.addEventListener("click", () => navigateTo("upload"));

  // Load quizzes
  async function loadQuizzes() {
    try {
      showLoading("Loading your quizzes...");

      // Get all quizzes for this user with their attempts
      const quizzes = await quizDb.quizzes.getByUser(user.id);

      // Store for filtering
      allQuizzes = quizzes;

      // Render quizzes
      renderQuizzes(quizzes);

      hideLoading();
    } catch (error) {
      hideLoading();
      console.error("Error loading quizzes:", error);
      showToast("Error loading quizzes: " + error.message, true);

      // Show empty state
      quizzesContainer.innerHTML = `
          <div class="error-state">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Error Loading Quizzes</h3>
            <p>${error.message}</p>
            <button class="btn btn-primary retry-btn">Retry</button>
          </div>
        `;

      document
        .querySelector(".retry-btn")
        .addEventListener("click", loadQuizzes);
    }
  }

  // Render quizzes
  function renderQuizzes(quizzes) {
    if (!quizzes || quizzes.length === 0) {
      // Show empty state
      quizzesContainer.innerHTML = "";
      emptyState.style.display = "flex";
      return;
    }

    // Hide empty state
    emptyState.style.display = "none";

    // Render quizzes
    quizzesContainer.innerHTML = "";

    quizzes.forEach((quiz) => {
      // Find the latest attempt
      const attempts = quiz.quiz_attempts || [];
      const latestAttempt =
        attempts.length > 0
          ? attempts.sort(
              (a, b) => new Date(b.started_at) - new Date(a.started_at)
            )[0]
          : null;

      // Determine status
      let status = "Not Started";
      let statusClass = "not-started";
      let progress = "0%";
      let scoreDisplay = "";

      if (latestAttempt) {
        if (latestAttempt.is_completed) {
          status = "Completed";
          statusClass = "completed";
          scoreDisplay = `<div class="quiz-score">${latestAttempt.score}%</div>`;
        } else {
          status = "In Progress";
          statusClass = "in-progress";
          // Rough progress calculation assuming questions are loaded
          progress =
            Math.round((latestAttempt.current_question / 10) * 100) + "%";
        }
      }

      // Format date
      const createdDate = new Date(quiz.created_at).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );

      // Create quiz card
      const quizCard = document.createElement("div");
      quizCard.className = "quiz-card";
      quizCard.innerHTML = `
          <div class="quiz-info">
            <h3 class="quiz-title">${quiz.title}</h3>
            <div class="quiz-date">Created: ${createdDate}</div>
            <div class="quiz-status ${statusClass}">
              <span>${status}</span>
              ${scoreDisplay}
            </div>
            ${
              latestAttempt && !latestAttempt.is_completed
                ? `
              <div class="quiz-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${progress}"></div>
                </div>
                <span>Progress: ${progress}</span>
              </div>
            `
                : ""
            }
          </div>
          <div class="quiz-actions">
            ${
              latestAttempt && !latestAttempt.is_completed
                ? `<button class="btn btn-primary resume-btn" data-quiz-id="${quiz.id}" data-attempt-id="${latestAttempt.id}">Resume Quiz</button>`
                : latestAttempt && latestAttempt.is_completed
                ? `<button class="btn btn-outline results-btn" data-quiz-id="${quiz.id}" data-attempt-id="${latestAttempt.id}">View Results</button>
               <button class="btn btn-primary restart-btn" data-quiz-id="${quiz.id}">Take Again</button>`
                : `<button class="btn btn-primary start-btn" data-quiz-id="${quiz.id}">Start Quiz</button>`
            }
          </div>
        `;

      quizzesContainer.appendChild(quizCard);
    });

    // Add event listeners to buttons
    addQuizButtonListeners();
  }

  // Add event listeners to quiz action buttons
  function addQuizButtonListeners() {
    // Resume quiz buttons
    document.querySelectorAll(".resume-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const quizId = this.getAttribute("data-quiz-id");
        const attemptId = this.getAttribute("data-attempt-id");

        localStorage.setItem("currentQuizId", quizId);
        localStorage.setItem("currentAttemptId", attemptId);

        navigateTo("take");
      });
    });

    // Start quiz buttons
    document.querySelectorAll(".start-btn").forEach((button) => {
      button.addEventListener("click", async function () {
        try {
          showLoading("Starting quiz...");

          const quizId = this.getAttribute("data-quiz-id");

          // Create a new attempt
          const attempt = await quizDb.attempts.create(quizId, user.id);

          localStorage.setItem("currentQuizId", quizId);
          localStorage.setItem("currentAttemptId", attempt.id);

          hideLoading();
          navigateTo("take");
        } catch (error) {
          hideLoading();
          console.error("Error starting quiz:", error);
          showToast("Error starting quiz: " + error.message, true);
        }
      });
    });

    // Restart quiz buttons
    document.querySelectorAll(".restart-btn").forEach((button) => {
      button.addEventListener("click", async function () {
        try {
          showLoading("Starting new attempt...");

          const quizId = this.getAttribute("data-quiz-id");

          // Create a new attempt
          const attempt = await quizDb.attempts.create(quizId, user.id);

          localStorage.setItem("currentQuizId", quizId);
          localStorage.setItem("currentAttemptId", attempt.id);

          hideLoading();
          navigateTo("take");
        } catch (error) {
          hideLoading();
          console.error("Error restarting quiz:", error);
          showToast("Error restarting quiz: " + error.message, true);
        }
      });
    });

    // View results buttons
    document.querySelectorAll(".results-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const quizId = this.getAttribute("data-quiz-id");
        const attemptId = this.getAttribute("data-attempt-id");

        localStorage.setItem("resultQuizId", quizId);
        localStorage.setItem("resultAttemptId", attemptId);

        navigateTo("results");
      });
    });
  }

  // Filter quizzes
  function filterQuizzes() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;

    const filtered = allQuizzes.filter((quiz) => {
      // Filter by search term
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm);

      // Filter by status
      let matchesStatus = true;
      if (statusValue !== "all") {
        const attempts = quiz.quiz_attempts || [];
        const latestAttempt =
          attempts.length > 0
            ? attempts.sort(
                (a, b) => new Date(b.started_at) - new Date(a.started_at)
              )[0]
            : null;

        if (statusValue === "completed") {
          matchesStatus = latestAttempt && latestAttempt.is_completed;
        } else if (statusValue === "in-progress") {
          matchesStatus = latestAttempt && !latestAttempt.is_completed;
        } else if (statusValue === "not-started") {
          matchesStatus = !latestAttempt;
        }
      }

      return matchesSearch && matchesStatus;
    });

    renderQuizzes(filtered);
  }

  // Set up search and filter
  searchInput.addEventListener("input", filterQuizzes);
  statusFilter.addEventListener("change", filterQuizzes);

  // Load quizzes on page load
  loadQuizzes();
});
