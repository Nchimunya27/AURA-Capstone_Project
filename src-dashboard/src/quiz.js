/**
 * Enhanced Quiz Application with Bear Logo and Donut Chart
 * 
 * This file contains all the JavaScript functionality for:
 * - Quiz initialization and navigation
 * - Question rendering and answer selection
 * - Score calculation and results display
 * - Interactive donut chart animation
 * - Bear logo with streamer effects
 * - Star ratings and animations
 */

document.addEventListener("DOMContentLoaded", function () {
  // ===== INITIALIZATION =====
  
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

  // Username update
  (function() {
    function updateUsername() {
      const username = localStorage.getItem('currentUsername');
      const userNameElement = document.querySelector('.user-name');
      
      if (userNameElement && username) {
        userNameElement.textContent = username;
        userNameElement.classList.add('username-loaded');
      }
      
      setTimeout(function() {
        if (userNameElement) {
          userNameElement.style.opacity = "1";
          userNameElement.style.visibility = "visible";
        }
      }, 500);
    }
    
    updateUsername();
    setTimeout(updateUsername, 100);
    window.addEventListener('load', updateUsername);
  })();
  
  // ===== QUIZ DATA LOADING =====
  
  // Load quiz data from localStorage or use sample data
  let quizData = [];
  try {
    quizData = JSON.parse(localStorage.getItem('quizData')) || [];
  } catch (e) {
    console.error('Error loading quiz data:', e);
    
    // Sample data for demonstration
    quizData = [
      {
        question: "Which of the following is NOT a type of database index?",
        options: ["B-tree Index", "Hash Index", "Circle Index", "Bitmap Index"],
        correctAnswer: "Circle Index"
      },
      {
        question: "What is the primary purpose of normalization in database design?",
        options: ["To eliminate redundancy", "To improve performance", "To simplify queries", "To encrypt data"],
        correctAnswer: "To eliminate redundancy"
      },
      {
        question: "Which SQL statement is used to update data in a database?",
        options: ["UPDATE", "SAVE", "MODIFY", "EDIT"],
        correctAnswer: "UPDATE"
      },
      {
        question: "What does CRUD stand for in database operations?",
        options: [
          "Create, Read, Update, Delete", 
          "Connect, Retrieve, Update, Disconnect", 
          "Compile, Run, Update, Debug", 
          "Control, Read, Utilize, Distribute"
        ],
        correctAnswer: "Create, Read, Update, Delete"
      }
    ];
  }

  // Check if quiz data is available
  if (!quizData.length) {
    alert('No quiz data found. Please generate a quiz first.');
    // Uncomment to redirect back to upload page
    // window.location.href = 'upload.html';
    return;
  }

  // ===== QUIZ STATE MANAGEMENT =====
  
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

  // ===== QUESTION RENDERING =====
  
  // Load and display current question
  function loadQuestion() {
    const question = quizData[currentQuestionIndex];
    
    // Update question text with question number indicator
    questionText.innerHTML = `<span class="question-number">${currentQuestionIndex + 1}</span> ${question.question}`;
    
    // Update options with enhanced selection feedback
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
      const isChecked = userAnswers[currentQuestionIndex] === option ? 'checked' : '';
      optionsContainer.innerHTML += `
        <label class="option-item ${isChecked ? 'active-selection' : ''}">
          <input type="radio" name="answer" value="${index}" ${isChecked} />
          <span class="option-text">${option}</span>
        </label>
      `;
    });
    
    // Update progress indicators
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

  // ===== INTERACTION HANDLERS =====
  
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
    ripple.style.position = 'absolute';
    ripple.style.width = '10px';
    ripple.style.height = '10px';
    ripple.style.borderRadius = '50%';
    ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    ripple.style.top = '50%';
    ripple.style.left = '50%';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.animation = 'ripple 0.6s ease-out forwards';
    element.appendChild(ripple);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

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

  // ===== QUIZ SUBMISSION =====
  
  // Submit quiz
  submitButton.addEventListener("click", function () {
    // Check if all questions are answered
    const unansweredCount = userAnswers.filter(answer => answer === null).length;
    
    if (unansweredCount > 0) {
      if (!confirm(`You have ${unansweredCount} unanswered ${unansweredCount === 1 ? 'question' : 'questions'}. Do you want to submit anyway?`)) {
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

  // ===== RESULTS DISPLAY =====
  
  // Enhanced interactive results display with bear logo and donut animation
  function displayEnhancedResults(correct, total, percentage) {
    // Replace quiz content with results
    const mainContent = document.querySelector('.main-content');
    
    // Create score message based on percentage
    const { message, stars } = getScoreMessage(percentage);
    
    // Create SVG for donut animation
    const circleSvg = `
      <svg class="circle-progress" viewBox="0 0 200 200">
        <circle class="circle-bg" cx="100" cy="100" r="90" />
        <circle class="circle-fill" cx="100" cy="100" r="90" />
      </svg>
    `;
    
    mainContent.innerHTML = `
      <h1 class="page-title">Quiz Results</h1>
      
      <div class="quiz-card results-card">
        <div class="results-header">
          <h2>Your Score</h2>
          
          <!-- Bear logo with streamers effect container -->
          <div class="logo-reaction" style="position: relative;">
            <div class="streamer-container"></div>
            <div class="bear-glow"></div>
            <img src="bear-logo.png" alt="Bear mascot" />
          </div>
          
          <!-- Updated score circle with enhanced donut animation -->
          <div class="score-circle">
            ${circleSvg}
            <div class="score-circle-inner">
              <span class="score-percentage">0%</span>
              <span class="score-rating">${message}</span>
            </div>
          </div>
          
          <!-- Star rating display -->
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
    
    // Animate the donut fill and counter
    setTimeout(() => {
      // Create streamers effect instead of bouncing bear
      createStreamersEffect();
      
      // Calculate dashoffset for the circle fill (565.48 is the circumference of our circle)
      const circleFill = document.querySelector('.circle-fill');
      const dashoffset = 565.48 * (1 - (percentage / 100));
      
      if (circleFill) {
        // Set initial values first
        circleFill.style.strokeDasharray = '565.48';
        circleFill.style.strokeDashoffset = '565.48';
        
        // Force a reflow to ensure the animation works
        circleFill.getBoundingClientRect();
        
        // Now set the final dashoffset for animation
        circleFill.style.strokeDashoffset = dashoffset;
      }
      
      // Animate the percentage counter
      const scorePercentage = document.querySelector('.score-percentage');
      if (scorePercentage) {
        animateCounter(0, percentage, 1500, value => {
          scorePercentage.textContent = `${Math.round(value)}%`;
        });
      }
      
      // Activate stars animation
      activateStars(stars);
      
      // Make bear logo visible with a simple fade-in (no bouncing)
      const logoReaction = document.querySelector('.logo-reaction');
      if (logoReaction) {
        logoReaction.style.opacity = '1';
      }
      
      // Trigger confetti for high scores
      if (percentage >= 80) {
        createConfetti();
      }
    }, 500);
    
    // Add event listener for review button
    setTimeout(() => {
      document.querySelector('.review-button').addEventListener('click', function() {
        displayQuestionReview();
      });
    }, 100);
  }

  // ===== VISUAL EFFECTS =====
  
  // Create streamers effect when the bear appears
  function createStreamersEffect() {
    const streamerContainer = document.querySelector('.streamer-container');
    if (!streamerContainer) return;
    
    // Create 12 streamers in a circle pattern
    for (let i = 0; i < 12; i++) {
      const streamer = document.createElement('div');
      streamer.className = 'streamer';
      
      // Calculate angle for circular pattern
      const angle = (i / 12) * 360;
      const rad = angle * (Math.PI / 180);
      
      // Position streamers in circle
      streamer.style.left = `calc(50% + ${Math.cos(rad) * 40}px)`;
      streamer.style.top = `calc(50% + ${Math.sin(rad) * 40}px)`;
      streamer.style.transformOrigin = 'bottom center';
      streamer.style.transform = `rotate(${angle}deg)`;
      
      // Random color and delay for variety
      const hue = Math.floor(Math.random() * 60) + 200; // Blue-ish hues
      streamer.style.background = `linear-gradient(to bottom, hsl(${hue}, 80%, 60%), transparent)`;
      streamer.style.animationDelay = `${Math.random() * 0.5}s`;
      
      streamerContainer.appendChild(streamer);
    }
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

  // ===== STAR RATING =====
  
  // Generate star rating HTML
  function generateStars(count) {
    let starsHTML = '';
    for (let i = 0; i < 5; i++) {
      starsHTML += `<i class="level-star fas fa-star" data-index="${i}"></i>`;
    }
    return starsHTML;
  }

  // Activate stars sequentially
  function activateStars(count) {
    const stars = document.querySelectorAll('.level-star');
    
    stars.forEach((star, index) => {
      setTimeout(() => {
        if (index < count) {
          star.classList.add('active');
        }
      }, 300 + (index * 200));
    });
  }

  // Get score message and star count based on percentage
  function getScoreMessage(percentage) {
    if (percentage >= 90) {
      return { 
        message: 'Outstanding!',
        stars: 5
      };
    } else if (percentage >= 80) {
      return { 
        message: 'Excellent!',
        stars: 4
      };
    } else if (percentage >= 70) {
      return { 
        message: 'Good Job!',
        stars: 3
      };
    } else if (percentage >= 60) {
      return { 
        message: 'Not Bad',
        stars: 2
      };
    } else {
      return { 
        message: 'Keep Learning',
        stars: 1
      };
    }
  }

  // ===== QUESTION BREAKDOWN =====
  
  // Generate question breakdown HTML
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

  // ===== QUESTION REVIEW =====
  
  // Display detailed question review screen
  function displayQuestionReview() {
    const mainContent = document.querySelector('.main-content');
    
    // Create the HTML for the review screen
    let reviewHtml = `
      <h1 class="page-title">Question Review</h1>
      
      <div class="quiz-card results-card">
        <div class="results-header">
          <a href="#" class="back-button review-back-button">
            <i class="fas fa-arrow-left"></i>
            Back to Results
          </a>
          <h2>Detailed Review</h2>
        </div>
        
        <div class="review-list">
    `;
    
    // Generate HTML for each question
    quizData.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      const status = isCorrect ? 'correct' : 'incorrect';
      
      reviewHtml += `
        <div class="question-item ${status}" style="animation: fadeIn 0.5s ease forwards; animation-delay: ${index * 0.1}s; opacity: 0;">
          <h3><span class="question-number">${index + 1}</span> ${question.question}</h3>
          
          <div class="review-options">
      `;
      
      // Generate HTML for each option
      question.options.forEach(option => {
        let optionClass = '';
        
        if (option === userAnswer && option === question.correctAnswer) {
          optionClass = 'correct-selected';
        } else if (option === userAnswer) {
          optionClass = 'incorrect-selected';
        } else if (option === question.correctAnswer) {
          optionClass = 'correct-answer';
        }
        
        reviewHtml += `
          <div class="review-option ${optionClass}">
            ${option}
            ${option === question.correctAnswer ? ' <i class="fas fa-check"></i>' : ''}
            ${option === userAnswer && option !== question.correctAnswer ? ' <i class="fas fa-times"></i>' : ''}
          </div>
        `;
      });
      
      reviewHtml += `
          </div>
        </div>
      `;
    });
    
    reviewHtml += `
        </div>
        
        <div class="action-buttons results-actions">
          <button class="back-to-results-button">Back to Results</button>
        </div>
      </div>
    `;
    
    // Update the content
    mainContent.innerHTML = reviewHtml;
    
    // Add event listeners
    setTimeout(() => {
      document.querySelector('.back-to-results-button').addEventListener('click', function() {
        const score = Math.round((userAnswers.filter((answer, index) => answer === quizData[index].correctAnswer).length / quizData.length) * 100);
        displayEnhancedResults(userAnswers.filter((answer, index) => answer === quizData[index].correctAnswer).length, quizData.length, score);
      });
      
      document.querySelector('.review-back-button').addEventListener('click', function(e) {
        e.preventDefault();
        const score = Math.round((userAnswers.filter((answer, index) => answer === quizData[index].correctAnswer).length / quizData.length) * 100);
        displayEnhancedResults(userAnswers.filter((answer, index) => answer === quizData[index].correctAnswer).length, quizData.length, score);
      });
    }, 100);
  }

  // Initialize the quiz
  loadQuestion();
});