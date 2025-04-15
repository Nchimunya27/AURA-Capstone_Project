document.addEventListener("DOMContentLoaded", async function () {
  // Initialize UI
  initSidebar("results");

  // Check authentication
  const user = await checkAuth();
  if (!user) return;

  // Display username
  document.getElementById("current-user").textContent =
    user.user_metadata.username || user.email;

  // Get DOM elements
  const quizTitle = document.getElementById("quiz-title");
  const scorePercentage = document.getElementById("score-percentage");
  const circleProgress = document.getElementById("circle-progress");
  const correctCount = document.getElementById("correct-count");
  const totalQuestions = document.getElementById("total-questions");
  const completionDate = document.getElementById("completion-date");
  const questionsList = document.getElementById("questions-list");
  const retryQuizBtn = document.getElementById("retry-quiz-btn");
  const shareBtn = document.getElementById("share-btn");
  const backToQuizzesLink = document.getElementById("back-to-quizzes");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Get quiz and attempt IDs from localStorage
  const quizId = localStorage.getItem("resultQuizId");
  const attemptId = localStorage.getItem("resultAttemptId");

  // Data variables
  let quizData = {};
  let attemptData = {};
  let questionsData = [];
  let answersData = [];

  // Back to quizzes navigation
  backToQuizzesLink.addEventListener("click", function (e) {
    e.preventDefault();
    navigateTo("history");
  });

  // Load quiz results
  async function loadQuizResults() {
    try {
      showLoading("Loading quiz results...");

      // Check if we have quiz and attempt IDs
      if (!quizId || !attemptId) {
        hideLoading();
        showToast("No quiz results to display", true);
        setTimeout(() => navigateTo("history"), 1000);
        return;
      }

      // Load attempt data
      attemptData = await quizDb.attempts.get(attemptId);

      // Check if attempt is completed
      if (!attemptData.is_completed) {
        hideLoading();
        showToast("This quiz is not yet completed", true);
        setTimeout(() => navigateTo("history"), 1000);
        return;
      }

      // Verify this is the user's attempt
      if (attemptData.user_id !== user.id) {
        hideLoading();
        showToast("You do not have access to these results", true);
        setTimeout(() => navigateTo("history"), 1000);
        return;
      }

      // Load quiz data
      quizData = await quizDb.quizzes.get(quizId);
      quizTitle.textContent = quizData.title;

      // Load questions
      questionsData = await quizDb.questions.getByQuiz(quizId);

      // Load answers
      answersData = await quizDb.answers.getByAttempt(attemptId);

      // Update summary
      updateSummary();

      // Render questions
      renderQuestions("all");

      hideLoading();
    } catch (error) {
      hideLoading();
      console.error("Error loading quiz results:", error);
      showToast("Error loading quiz results: " + error.message, true);
      setTimeout(() => navigateTo("history"), 2000);
    }
  }

  // Update the summary section
  function updateSummary() {
    // Calculate score
    const score = attemptData.score || 0;

    // Update score display
    scorePercentage.textContent = `${score}%`;
    circleProgress.setAttribute("stroke-dasharray", `${score}, 100`);

    // Count correct answers
    const correctAnswers = answersData.filter((a) => a.is_correct).length;
    correctCount.textContent = correctAnswers;
    totalQuestions.textContent = questionsData.length;

    // Format completion date
    const completed = new Date(attemptData.completed_at);
    completionDate.textContent = completed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Render questions with answers
  function renderQuestions(filter = "all") {
    questionsList.innerHTML = "";

    // Apply filter
    let filteredAnswers = [...answersData];

    if (filter === "correct") {
      filteredAnswers = answersData.filter((a) => a.is_correct);
    } else if (filter === "incorrect") {
      filteredAnswers = answersData.filter((a) => !a.is_correct);
    } else if (filter === "flagged") {
      filteredAnswers = answersData.filter((a) => a.is_flagged);
    }

    // If no items match the filter
    if (filteredAnswers.length === 0) {
      questionsList.innerHTML = `
          <div class="empty-filter">
            <i class="fas fa-filter"></i>
            <p>No questions match this filter.</p>
          </div>
        `;
      return;
    }

    // Render each question and answer
    filteredAnswers.forEach((answer, index) => {
      // Find the question for this answer
      const question = questionsData.find((q) => q.id === answer.question_id);
      if (!question) return;

      // Create question item
      const questionItem = document.createElement("div");
      questionItem.className = `question-item ${
        answer.is_correct ? "correct" : "incorrect"
      } ${answer.is_flagged ? "flagged" : ""}`;

      // Create question header
      const questionHeader = document.createElement("div");
      questionHeader.className = "question-header";
      questionHeader.innerHTML = `
          <span class="question-number">Question ${index + 1}</span>
          <div class="question-status">
            ${
              answer.is_correct
                ? '<span class="status-badge correct"><i class="fas fa-check"></i> Correct</span>'
                : '<span class="status-badge incorrect"><i class="fas fa-times"></i> Incorrect</span>'
            }
            ${
              answer.is_flagged
                ? '<span class="status-badge flagged"><i class="fas fa-flag"></i> Flagged</span>'
                : ""
            }
          </div>
        `;

      // Create question content
      const questionContent = document.createElement("div");
      questionContent.className = "question-content";
      questionContent.innerHTML = `
          <h3 class="question-text">${question.question_text}</h3>
          <div class="options-list"></div>
        `;

      // Add options
      const optionsList = questionContent.querySelector(".options-list");
      question.options.forEach((option, optIndex) => {
        const isUserAnswer = option === answer.user_answer;
        const isCorrectAnswer = option === question.correct_answer;

        const optionItem = document.createElement("div");
        optionItem.className = `option-item 
            ${isUserAnswer ? "user-answer" : ""} 
            ${isCorrectAnswer ? "correct-answer" : ""}`;

        optionItem.innerHTML = `
            <span class="option-marker">${String.fromCharCode(
              65 + optIndex
            )}</span>
            <span class="option-text">${option}</span>
            ${
              isUserAnswer
                ? '<i class="fas fa-user-check user-indicator"></i>'
                : ""
            }
            ${
              isCorrectAnswer
                ? '<i class="fas fa-check correct-indicator"></i>'
                : ""
            }
          `;

        optionsList.appendChild(optionItem);
      });

      // Append all elements
      questionItem.appendChild(questionHeader);
      questionItem.appendChild(questionContent);
      questionsList.appendChild(questionItem);
    });
  }

  // Retry quiz
  retryQuizBtn.addEventListener("click", async function () {
    try {
      showLoading("Creating new attempt...");

      // Create a new attempt
      const attempt = await quizDb.attempts.create(quizId, user.id);

      // Store IDs for quiz page
      localStorage.setItem("currentQuizId", quizId);
      localStorage.setItem("currentAttemptId", attempt.id);

      // Clear result IDs
      localStorage.removeItem("resultQuizId");
      localStorage.removeItem("resultAttemptId");

      hideLoading();

      // Navigate to quiz page
      navigateTo("take");
    } catch (error) {
      hideLoading();
      console.error("Error creating new attempt:", error);
      showToast("Error creating new attempt: " + error.message, true);
    }
  });

  // Share results
  shareBtn.addEventListener("click", function () {
    // In a real app, generate a shareable link
    // For demo, just show a toast
    const shareToast = document.getElementById("share-toast");
    shareToast.classList.add("show");

    setTimeout(() => {
      shareToast.classList.remove("show");
    }, 3000);
  });

  // Filter questions
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Get filter value
      const filter = this.getAttribute("data-filter");

      // Render questions with filter
      renderQuestions(filter);
    });
  });

  // Load results on page load
  loadQuizResults();
});
