document.addEventListener("DOMContentLoaded", async function () {
  // Initialize UI
  initSidebar("take");

  // Check authentication
  const user = await checkAuth();
  if (!user) return;

  // Display username
  document.getElementById("current-user").textContent =
    user.user_metadata.username || user.email;

  // Get DOM elements
  const questionText = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options-container");
  const questionNumberElement = document.getElementById("question-number");
  const totalQuestionsElement = document.getElementById("total-questions");
  const progressFill = document.getElementById("progress-fill");
  const prevButton = document.getElementById("prev-btn");
  const nextButton = document.getElementById("next-btn");
  const flagButton = document.getElementById("flag-btn");
  const submitButton = document.getElementById("submit-btn");
  const quizTitle = document.getElementById("quiz-title");
  const backToQuizzesLink = document.getElementById("back-to-quizzes");

  // Quiz navigation modal elements
  const quizNavModal = document.getElementById("quiz-nav-modal");
  const questionGrid = document.getElementById("question-grid");
  const closeNavButton = document.getElementById("close-nav-btn");
  const submitFromNavButton = document.getElementById("submit-from-nav-btn");

  // Confirmation modal elements
  const confirmModal = document.getElementById("confirm-modal");
  const confirmMessage = document.getElementById("confirm-message");
  const cancelSubmitButton = document.getElementById("cancel-submit-btn");
  const confirmSubmitButton = document.getElementById("confirm-submit-btn");

  // Quiz state variables
  let quizId = localStorage.getItem("currentQuizId");
  let attemptId = localStorage.getItem("currentAttemptId");
  let quizData = [];
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let flaggedQuestions = new Set();

  // Back to quizzes navigation
  backToQuizzesLink.addEventListener("click", function (e) {
    e.preventDefault();
    navigateTo("history");
  });

  // Load quiz data
  async function loadQuizData() {
    try {
      showLoading("Loading quiz...");

      // Check if we have an ongoing quiz
      if (!quizId || !attemptId) {
        hideLoading();
        showToast("No active quiz found", true);
        navigateTo("history");
        return;
      }

      // Load attempt data
      const attempt = await quizDb.attempts.get(attemptId);

      // Verify this is the user's attempt
      if (attempt.user_id !== user.id) {
        hideLoading();
        showToast("You do not have access to this quiz", true);
        navigateTo("history");
        return;
      }

      // Load quiz data
      const quiz = await quizDb.quizzes.get(quizId);
      quizTitle.textContent = quiz.title;

      // Load questions
      const questions = await quizDb.questions.getByQuiz(quizId);

      // Transform questions to expected format
      quizData = questions.map((q) => ({
        id: q.id,
        question: q.question_text,
        options: q.options,
        correctAnswer: q.correct_answer,
      }));

      // Set current question from saved progress
      currentQuestionIndex = attempt.current_question || 0;

      // Initialize user answers
      userAnswers = new Array(quizData.length).fill(null);

      // Load existing answers
      const answers = await quizDb.answers.getByAttempt(attemptId);

      if (answers && answers.length > 0) {
        answers.forEach((answer) => {
          // Find the question index by its ID
          const questionIndex = quizData.findIndex(
            (q) => q.id === answer.question_id
          );
          if (questionIndex >= 0) {
            userAnswers[questionIndex] = answer.user_answer;
            if (answer.is_flagged) {
              flaggedQuestions.add(questionIndex);
            }
          }
        });
      }

      // Update UI
      totalQuestionsElement.textContent = quizData.length;
      updateQuestionNavigation();
      loadQuestion();

      hideLoading();
    } catch (error) {
      hideLoading();
      console.error("Error loading quiz:", error);
      showToast("Error loading quiz: " + error.message, true);
      setTimeout(() => navigateTo("history"), 2000);
    }
  }

  // Load current question
  function loadQuestion() {
    const question = quizData[currentQuestionIndex];

    // Update question text
    questionText.textContent = question.question;

    // Update question number
    questionNumberElement.textContent = `Question ${currentQuestionIndex + 1}`;

    // Update progress bar
    const progressPercentage =
      ((currentQuestionIndex + 1) / quizData.length) * 100;
    progressFill.style.width = `${progressPercentage}%`;

    // Update flag button state
    if (flaggedQuestions.has(currentQuestionIndex)) {
      flagButton.classList.add("flagged");
      flagButton.innerHTML = `<i class="fas fa-flag"></i><span>Flagged</span>`;
    } else {
      flagButton.classList.remove("flagged");
      flagButton.innerHTML = `<i class="far fa-flag"></i><span>Flag for Review</span>`;
    }

    // Update navigation buttons
    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.disabled = currentQuestionIndex === quizData.length - 1;

    // Generate options
    optionsContainer.innerHTML = "";
    question.options.forEach((option, index) => {
      const isSelected = userAnswers[currentQuestionIndex] === option;
      const optionElement = document.createElement("label");
      optionElement.className = `option-item ${isSelected ? "selected" : ""}`;

      optionElement.innerHTML = `
          <input type="radio" name="quiz-option" value="${index}" ${
        isSelected ? "checked" : ""
      }>
          <span class="option-marker">${String.fromCharCode(65 + index)}</span>
          <span class="option-text">${option}</span>
        `;

      optionsContainer.appendChild(optionElement);
    });

    // Add event listeners to options
    document.querySelectorAll(".option-item").forEach((item) => {
      item.addEventListener("click", function () {
        selectOption(this);
      });
    });
  }

  // Select an option
  async function selectOption(optionElement) {
    // Clear any previously selected options
    document.querySelectorAll(".option-item").forEach((item) => {
      item.classList.remove("selected");
    });

    // Select this option
    optionElement.classList.add("selected");
    const radio = optionElement.querySelector('input[type="radio"]');
    radio.checked = true;

    // Get option value/index
    const optionIndex = parseInt(radio.value);
    const selectedOption = quizData[currentQuestionIndex].options[optionIndex];

    // Save answer
    userAnswers[currentQuestionIndex] = selectedOption;

    // Update question navigation UI
    updateQuestionNavigation();

    // Save to database
    await saveAnswer();
  }

  // Update the question navigation grid
  function updateQuestionNavigation() {
    questionGrid.innerHTML = "";

    quizData.forEach((_, index) => {
      const isAnswered = userAnswers[index] !== null;
      const isFlagged = flaggedQuestions.has(index);
      const isCurrent = index === currentQuestionIndex;

      const button = document.createElement("button");
      button.className = `question-nav-btn ${
        isAnswered ? "answered" : "unanswered"
      } ${isFlagged ? "flagged" : ""} ${isCurrent ? "current" : ""}`;
      button.textContent = index + 1;
      button.addEventListener("click", () => {
        quizNavModal.style.display = "none";
        navigateToQuestion(index);
      });

      questionGrid.appendChild(button);
    });
  }

  // Navigate to specific question
  async function navigateToQuestion(index) {
    // Save current answer first
    await saveAnswer();

    // Update index and load new question
    currentQuestionIndex = index;
    loadQuestion();

    // Update attempt progress in database
    try {
      await quizDb.attempts.updateProgress(attemptId, currentQuestionIndex);
    } catch (error) {
      console.error("Error updating progress:", error);
      // Continue anyway
    }
  }

  // Save current answer to database
  async function saveAnswer() {
    try {
      const currentQuestion = quizData[currentQuestionIndex];
      const userAnswer = userAnswers[currentQuestionIndex];

      // Skip if no answer
      if (!userAnswer) return;

      const isFlagged = flaggedQuestions.has(currentQuestionIndex);
      const isCorrect = userAnswer === currentQuestion.correctAnswer;

      // Save to database
      await quizDb.answers.save(
        attemptId,
        currentQuestion.id,
        userAnswer,
        isCorrect,
        isFlagged
      );
    } catch (error) {
      console.error("Error saving answer:", error);
      // We don't want to interrupt the user, so just log the error
    }
  }

  // Navigation event listeners
  prevButton.addEventListener("click", async () => {
    if (currentQuestionIndex > 0) {
      await navigateToQuestion(currentQuestionIndex - 1);
    }
  });

  nextButton.addEventListener("click", async () => {
    if (currentQuestionIndex < quizData.length - 1) {
      await navigateToQuestion(currentQuestionIndex + 1);
    }
  });

  // Flag question
  flagButton.addEventListener("click", async () => {
    const isFlagged = flaggedQuestions.has(currentQuestionIndex);

    if (isFlagged) {
      flaggedQuestions.delete(currentQuestionIndex);
      flagButton.classList.remove("flagged");
      flagButton.innerHTML = `<i class="far fa-flag"></i><span>Flag for Review</span>`;
    } else {
      flaggedQuestions.add(currentQuestionIndex);
      flagButton.classList.add("flagged");
      flagButton.innerHTML = `<i class="fas fa-flag"></i><span>Flagged</span>`;
    }

    updateQuestionNavigation();
    await saveAnswer();
  });

  // Quiz navigation modal
  document.addEventListener("keydown", function (e) {
    if (e.key === "q" || e.key === "Q") {
      toggleQuizNavigation();
    }
  });

  function toggleQuizNavigation() {
    updateQuestionNavigation();
    quizNavModal.style.display =
      quizNavModal.style.display === "flex" ? "none" : "flex";
  }

  closeNavButton.addEventListener("click", () => {
    quizNavModal.style.display = "none";
  });

  // Submit quiz
  submitButton.addEventListener("click", showSubmitConfirmation);
  submitFromNavButton.addEventListener("click", showSubmitConfirmation);

  function showSubmitConfirmation() {
    const unansweredCount = userAnswers.filter((a) => a === null).length;

    if (unansweredCount > 0) {
      confirmMessage.textContent = `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`;
    } else {
      confirmMessage.textContent = "Are you sure you want to submit your quiz?";
    }

    confirmModal.style.display = "flex";
  }

  confirmSubmitButton.addEventListener("click", submitQuiz);

  cancelSubmitButton.addEventListener("click", () => {
    confirmModal.style.display = "none";
  });

  // Close modals when clicking outside
  window.addEventListener("click", function (e) {
    if (e.target === quizNavModal) {
      quizNavModal.style.display = "none";
    }
    if (e.target === confirmModal) {
      confirmModal.style.display = "none";
    }
  });

  // Submit quiz
  async function submitQuiz() {
    try {
      showLoading("Submitting quiz...");

      // Save any current answer
      await saveAnswer();

      // Calculate score
      let correctCount = 0;
      quizData.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / quizData.length) * 100);

      // Complete the attempt in the database
      await quizDb.attempts.complete(attemptId, score);

      // Clear localStorage
      localStorage.removeItem("currentQuizId");
      localStorage.removeItem("currentAttemptId");

      hideLoading();

      // Redirect to results page
      localStorage.setItem("resultQuizId", quizId);
      localStorage.setItem("resultAttemptId", attemptId);
      navigateTo("results");
    } catch (error) {
      hideLoading();
      console.error("Error submitting quiz:", error);
      showToast("Error submitting quiz: " + error.message, true);
    }
  }

  // Load quiz data on page load
  loadQuizData();
});
