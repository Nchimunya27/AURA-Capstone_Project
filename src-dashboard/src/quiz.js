// Enhanced Quiz Interactivity

document.addEventListener("DOMContentLoaded", function () {
  // Original quiz code initializations
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

  // Enhanced: Add question number to question text
  function loadQuestion() {
    const question = quizData[currentQuestionIndex];
    
    // Update question text with question number indicator
    questionText.innerHTML = `<span class="question-number">${currentQuestionIndex + 1}</span> ${question.question}`;
    
    // Update options with enhanced selection feedback
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
    flagButton.innerHTML = flaggedQuestions.has(currentQuestionIndex) 
      ? '<i class="fas fa-flag"></i> Flagged'
      : '<i class="fas fa-flag"></i> Flag Question';
    
    // Add click event to each option with enhanced feedback
    document.querySelectorAll(".option-item").forEach((item, optionIndex) => {
      item.addEventListener("click", function () {
        const radio = this.querySelector('input[type="radio"]');
        radio.checked = true;
        
        // Add selection animation
        addSelectionEffect(this);
        
        // Save the answer
        userAnswers[currentQuestionIndex] = quizData[currentQuestionIndex].options[radio.value];
      });
    });
  }

  // Add visual feedback when selecting an option
  function addSelectionEffect(element) {
    // Remove any existing active classes
    document.querySelectorAll('.option-item').forEach(item => {
      item.classList.remove('active-selection');
    });
    
    // Add active class
    element.classList.add('active-selection');
    
    // Add ripple effect
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    element.appendChild(ripple);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      ripple.remove();
    }, 500);
  }

  // Enhanced navigation with animation
  prevButton.addEventListener("click", function () {
    if (currentQuestionIndex > 0) {
      animateQuestionTransition('right');
      currentQuestionIndex--;
      loadQuestion();
    }
  });

  nextButton.addEventListener("click", function () {
    if (currentQuestionIndex < quizData.length - 1) {
      animateQuestionTransition('left');
      currentQuestionIndex++;
      loadQuestion();
    }
  });

  // Question transition animation
  function animateQuestionTransition(direction) {
    const questionContainer = document.querySelector('.question-container');
    
    // Add exit animation class
    questionContainer.style.opacity = '0';
    questionContainer.style.transform = `translateX(${direction === 'left' ? '-10px' : '10px'})`;
    
    // After a short delay, reset for entrance animation
    setTimeout(() => {
      questionContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      questionContainer.style.opacity = '1';
      questionContainer.style.transform = 'translateX(0)';
    }, 300);
  }

  // Flag question for review with enhanced feedback
  flagButton.addEventListener("click", function () {
    this.classList.toggle("flagged");
    if (this.classList.contains('flagged')) {
      flaggedQuestions.add(currentQuestionIndex);
      this.innerHTML = '<i class="fas fa-flag"></i> Flagged';
      
      // Add quick pulse animation
      this.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.1)' },
        { transform: 'scale(1)' }
      ], {
        duration: 300,
        easing: 'ease-in-out'
      });
    } else {
      flaggedQuestions.delete(currentQuestionIndex);
      this.innerHTML = '<i class="fas fa-flag"></i> Flag Question';
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
    
    // Display enhanced interactive results
    displayEnhancedResults(correctAnswers, quizData.length, score);
  });

  // Enhanced interactive results display
  function displayEnhancedResults(correct, total, percentage) {
    // Replace quiz content with results
    const mainContent = document.querySelector('.main-content');
    
    // Create emoji and message based on score
    const { emoji, message, stars } = getScoreMessage(percentage);
    
    mainContent.innerHTML = `
      <h1 class="page-title">Quiz Results</h1>
      
      <div class="quiz-card results-card">
        <div class="results-header">
          <h2>Your Score</h2>
          
          <div class="emoji-reaction">${emoji}</div>
          
          <div class="score-circle">
            <div class="score-fill"></div>
            <div class="score-circle-inner">
              <span class="score-percentage">0%</span>
              <span class="score-rating">${message}</span>
            </div>
          </div>
          
          <div class="level-indicator">
            ${generateStars(stars)}
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
    
    // Animate the score fill
    setTimeout(() => {
      const scoreFill = document.querySelector('.score-fill');
      const scorePercentage = document.querySelector('.score-percentage');
      
      if (scoreFill && scorePercentage) {
        // Animate the fill height
        scoreFill.style.height = `${percentage}%`;
        
        // Animate the percentage counter
        animateCounter(0, percentage, 1500, value => {
          scorePercentage.textContent = `${Math.round(value)}%`;
        });
      }
      
      // Trigger confetti for high scores
      if (percentage >= 80) {
        createConfetti();
      }
      
      // Add stars animation
      const stars = document.querySelectorAll('.level-star');
      stars.forEach((star, index) => {
        setTimeout(() => {
          star.style.animation = 'popIn 0.4s forwards';
        }, 1200 + (index * 200));
      });
      
      // Make emoji visible
      document.querySelector('.emoji-reaction').style.opacity = '1';
    }, 500);
    
    // Add event listener for review button
    setTimeout(() => {
      document.querySelector('.review-button').addEventListener('click', function() {
        displayQuestionReview();
      });
    }, 100);
  }

  // Create celebration confetti
  function createConfetti() {
    // Create confetti container if it doesn't exist
    let confettiContainer = document.querySelector('.confetti-container');
    if (!confettiContainer) {
      confettiContainer = document.createElement('div');
      confettiContainer.className = 'confetti-container';
      document.body.appendChild(confettiContainer);
    }
    
    // Colors for confetti
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    // Create 100 confetti pieces
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      
      // Random properties
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100; // Random horizontal position
      const width = Math.random() * 10 + 5; // Random width
      const height = Math.random() * 10 + 5; // Random height
      const duration = Math.random() * 3 + 2; // Random animation duration
      const delay = Math.random() * 1.5; // Random delay
      
      // Apply random styles
      confetti.style.backgroundColor = color;
      confetti.style.left = `${left}%`;
      confetti.style.width = `${width}px`;
      confetti.style.height = `${height}px`;
      confetti.style.animationDuration = `${duration}s`;
      confetti.style.animationDelay = `${delay}s`;
      
      // Add to container
      confettiContainer.appendChild(confetti);
    }
    
    // Remove confetti after 5 seconds
    setTimeout(() => {
      confettiContainer.remove();
    }, 5000);
  }

  // Get score message and emoji based on percentage
  function getScoreMessage(percentage) {
    if (percentage >= 90) {
      return { 
        emoji: '🏆', 
        message: 'Outstanding!',
        stars: 5
      };
    } else if (percentage >= 80) {
      return { 
        emoji: '🎉', 
        message: 'Excellent!',
        stars: 4
      };
    } else if (percentage >= 70) {
      return { 
        emoji: '😊', 
        message: 'Good Job!',
        stars: 3
      };
    } else if (percentage >= 60) {
      return { 
        emoji: '🙂', 
        message: 'Not Bad',
        stars: 2
      };
    } else {
      return { 
        emoji: '📚', 
        message: 'Keep Learning',
        stars: 1
      };
    }
  }

  // Generate star rating based on score
  function generateStars(count) {
    let starsHTML = '';
    for (let i = 0; i < 5; i++) {
      // Filled star or empty star based on count
      const starType = i < count ? 'fas fa-star' : 'far fa-star';
      const delay = i * 0.1;
      starsHTML += `<i class="level-star ${starType}" style="animation-delay: ${delay}s"></i>`;
    }
    return starsHTML;
  }

  // Counter animation helper
  function animateCounter(start, end, duration, callback) {
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing function for smoother animation
      const easedProgress = easeOutQuad(progress);
      const currentValue = start + (end - start) * easedProgress;
      
      callback(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }
    
    requestAnimationFrame(updateCounter);
  }

  // Easing function for smoother animations
  function easeOutQuad(t) {
    return t * (2 - t);
  }

  // Enhanced question breakdown with animations
  function generateQuestionBreakdown() {
    let html = '';
    
    userAnswers.forEach((answer, index) => {
      const question = quizData[index];
      const isCorrect = answer === question.correctAnswer;
      const status = isCorrect ? 'correct' : 'incorrect';
      const icon = isCorrect ? 'check-circle' : 'times-circle';
      
      html += `
        <div class="question-item ${status}" style="animation: fadeIn 0.5s ease forwards; animation-delay: ${index * 0.1}s; opacity: 0;">
          <div class="question-status">
            <i class="fas fa-${icon}"></i>
          </div>
          <div class="question-info">
            <p class="question-text"><span class="question-number">${index + 1}</span> ${question.question}</p>
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