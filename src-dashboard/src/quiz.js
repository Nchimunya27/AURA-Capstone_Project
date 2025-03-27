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

  // Load quiz data from localStorage
  let quizData = [];
  try {
    quizData = JSON.parse(localStorage.getItem('quizData')) || [];
  } catch (e) {
    console.error('Error loading quiz data:', e);
  }

  // If no quiz data, show message or redirect
  if (!quizData.length) {
    alert('No quiz data found. Please generate a quiz first.');
    // Uncomment to redirect back to upload page
    // window.location.href = 'upload.html';
    return;
  }

  // Quiz state variables
  let currentQuestionIndex = 0;
  const userAnswers = new Array(quizData.length).fill(null);
  const flaggedQuestions = new Set();

  // Get DOM elements
  const questionText = document.querySelector('.question-text');
  const optionsContainer = document.querySelector('.options-container');
  const progressText = document.querySelector('.progress-text');
  const progressFill = document.querySelector('.progress-fill');
  const prevButton = document.querySelector('.prev-button');
  const nextButton = document.querySelector('.next-button');
  const flagButton = document.querySelector('.flag-button');
  const submitButton = document.querySelector('.submit-button');

  // Load current question
  function loadQuestion() {
    const question = quizData[currentQuestionIndex];
    
    // Update question text
    questionText.textContent = question.question;
    
    // Update options
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
      const isChecked = userAnswers[currentQuestionIndex] === option ? 'checked' : '';
      optionsContainer.innerHTML += `
        <label class="option-item">
          <input type="radio" name="answer" value="${index}" ${isChecked} />
          <span class="option-text">${option}</span>
        </label>
      `;
    });
    
    // Update progress
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;
    progressFill.style.width = `${((currentQuestionIndex + 1) / quizData.length) * 100}%`;
    
    // Update flag button state
    flagButton.classList.toggle('flagged', flaggedQuestions.has(currentQuestionIndex));
    
    // Add click event to each option
    document.querySelectorAll(".option-item").forEach((item) => {
      item.addEventListener("click", function () {
        const radio = this.querySelector('input[type="radio"]');
        radio.checked = true;
        
        // Save the answer
        userAnswers[currentQuestionIndex] = quizData[currentQuestionIndex].options[radio.value];
      });
    });
  }

  // Navigate to previous question
  prevButton.addEventListener("click", function () {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      loadQuestion();
    }
  });

  // Navigate to next question
  nextButton.addEventListener("click", function () {
    if (currentQuestionIndex < quizData.length - 1) {
      currentQuestionIndex++;
      loadQuestion();
    }
  });

  // Flag question for review
  flagButton.addEventListener("click", function () {
    this.classList.toggle("flagged");
    if (this.classList.contains('flagged')) {
      flaggedQuestions.add(currentQuestionIndex);
    } else {
      flaggedQuestions.delete(currentQuestionIndex);
    }
  });

  // Submit quiz
  submitButton.addEventListener("click", function () {
    // Check if all questions are answered
    const unansweredCount = userAnswers.filter(answer => answer === null).length;
    
    if (unansweredCount > 0) {
      if (!confirm(`You have ${unansweredCount} unanswered questions. Do you want to submit anyway?`)) {
        return;
      }
    }
    
    // Calculate score
    let correctAnswers = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / quizData.length) * 100);
    
    // Display results
    displayResults(correctAnswers, quizData.length, score);
  });

  // Display quiz results
  function displayResults(correct, total, percentage) {
    // Replace quiz content with results
    const mainContent = document.querySelector('.main-content');
    
    mainContent.innerHTML = `
      <h1 class="page-title">Quiz Results</h1>
      
      <div class="quiz-card results-card">
        <div class="results-header">
          <h2>Your Score</h2>
          <div class="score-circle">
            <span class="score-percentage">${percentage}%</span>
          </div>
          <p class="score-details">You got ${correct} out of ${total} questions correct</p>
        </div>
        
        <div class="results-breakdown">
          <h3>Question Breakdown</h3>
          <div class="questions-list">
            ${generateQuestionBreakdown()}
          </div>
        </div>
        
        <div class="action-buttons results-actions">
          <button class="review-button">Review Answers</button>
          <button class="new-quiz-button" onclick="window.location.href='upload.html'">Create New Quiz</button>
        </div>
      </div>
    `;
    
    // Add event listener for review button
    document.querySelector('.review-button').addEventListener('click', function() {
      displayQuestionReview();
    });
  }

  // Generate HTML for question breakdown
  function generateQuestionBreakdown() {
    let html = '';
    
    userAnswers.forEach((answer, index) => {
      const question = quizData[index];
      const isCorrect = answer === question.correctAnswer;
      const status = isCorrect ? 'correct' : 'incorrect';
      
      html += `
        <div class="question-item ${status}">
          <div class="question-status">
            <i class="fas fa-${isCorrect ? 'check' : 'times'}"></i>
          </div>
          <div class="question-info">
            <p class="question-text">${question.question}</p>
            <p class="answer-info">
              Your answer: <span class="${status}">${answer || 'Not answered'}</span>
              ${!isCorrect ? `<span class="correct-answer">Correct answer: ${question.correctAnswer}</span>` : ''}
            </p>
          </div>
        </div>
      `;
    });
    
    return html;
  }

  // Display detailed question review
  function displayQuestionReview() {
    // Implement if needed - shows each question with user's answer and correct answer
    console.log("Display question review");
  }

  // Initialize the quiz
  loadQuestion();
});